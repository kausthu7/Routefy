import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { sql } from '@/lib/db';
import { parseDeliveryDetails, parseImageDetails, parseAudioDetails } from '@/lib/gemini';
import { createOrderAndGenerateAWB, CourierOption } from '@/lib/shiprocket';
import { getAggregatedCouriers, bookCourier } from '@/lib/couriers';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Token will be fetched dynamically inside functions to support Vercel serverless runtime

export const maxDuration = 60; // Allow Vercel to run for up to 60 seconds

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("================ TELEGRAM WEBHOOK ================");
    console.log(JSON.stringify(body, null, 2));
    console.log("==================================================");

    if (body.callback_query) {
      waitUntil(handleCallbackQuery(body.callback_query));
      return NextResponse.json({ status: 'ok' });
    }

    if (body.message) {
      waitUntil(handleMessage(body.message));
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function handleMessage(message: any) {
  const chatId = message.chat.id.toString();

  // 1. Authenticate Merchant
  let merchantData = null;
  const { rows } = await sql`
    SELECT id, shop_name, pickup_pincode, telegram_chat_id 
    FROM merchants 
    WHERE telegram_chat_id = ${chatId}
    LIMIT 1
  `;
  
  if (rows.length > 0) {
    merchantData = rows[0];
  }

  // 2. Handle Authentication
  if (!merchantData) {
    if (message.contact) {
      const phone = message.contact.phone_number.replace(/\D/g, ''); // Clean formatting
      const phoneLast10 = phone.slice(-10);

      const { rows: phoneRows } = await sql`
        SELECT id, shop_name FROM merchants WHERE phone_number LIKE ${'%' + phoneLast10 + '%'} LIMIT 1
      `;

      if (phoneRows.length > 0) {
        // Link account
        await sql`UPDATE merchants SET telegram_chat_id = ${chatId} WHERE id = ${phoneRows[0].id}`;
        await sendTelegramMessage(chatId, `✅ Successfully linked your Telegram account to Routefy!\n\nWelcome back, ${phoneRows[0].shop_name}. You can now send me delivery details, screenshots, or voice notes to book shipments.`);
      } else {
        await sendTelegramMessage(chatId, `❌ We couldn't find a Routefy account matching ${phone}.\n\nPlease register for an account on our website first, then return here to link your account:\n👉 https://routefy-liart.vercel.app/login`);
      }
      return;
    } else if (message.text) {
      const textLower = message.text.trim().toLowerCase();
      const rawDigits = textLower.replace(/\D/g, '');
      
      // If the user manually typed a 10-12 digit phone number
      if (rawDigits.length >= 10 && rawDigits.length <= 15) {
        const phoneLast10 = rawDigits.slice(-10);
        const { rows: phoneRows } = await sql`
          SELECT id, shop_name FROM merchants WHERE phone_number LIKE ${'%' + phoneLast10 + '%'} LIMIT 1
        `;

        if (phoneRows.length > 0) {
          // Link account
          await sql`UPDATE merchants SET telegram_chat_id = ${chatId} WHERE id = ${phoneRows[0].id}`;
          await sendTelegramMessage(chatId, `✅ Successfully linked your Telegram account to Routefy!\n\nWelcome back, ${phoneRows[0].shop_name}. You can now send me delivery details, screenshots, or voice notes to book shipments.`);
        } else {
          await sendTelegramMessage(chatId, `❌ We couldn't find a Routefy account matching ${rawDigits}.\n\nPlease register for an account on our website first, then return here to link your account:\n👉 https://routefy-liart.vercel.app/login`);
        }
        return;
      }
    }

    // If no contact shared and didn't type a phone number
    await sendTelegramMessage(chatId, "Welcome to Routefy! 🚀\n\nTo get started, please share your phone number to link your account. You can tap the button below, or simply type the phone number you registered with on our website.\n\nIf you don't have an account yet, please register on our website first:\n👉 https://routefy-liart.vercel.app/login", {
      keyboard: [
        [{ text: "📱 Share Contact to Login", request_contact: true }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    });
    return;
  }

  // 3. Process Messages
  let parsedData = null;
  const merchantProducts = merchantData.default_product || "No specific products saved.";

  if (message.text) {
    const textLower = message.text.trim().toLowerCase();
    
    // Intercept simple greetings
    if (['hi', 'hello', 'hey', 'start', '/start', 'help'].includes(textLower)) {
      await sendTelegramMessage(chatId, `👋 Hello ${merchantData.shop_name}!\n\nI am your Routefy assistant. I can automatically book shipments for you.\n\nSimply send me:\n1. A text with the delivery address and phone number\n2. A screenshot of the customer's details\n3. A voice note explaining the delivery\n\nTo link a different phone number, type /unlink\n\nGo ahead, try sending me an order!`);
      return;
    }

    // Allow user to unlink their account
    if (['unlink', '/unlink', 'logout', '/logout'].includes(textLower)) {
      await sql`UPDATE merchants SET telegram_chat_id = NULL WHERE telegram_chat_id = ${chatId}`;
      await sendTelegramMessage(chatId, "🔌 Your Telegram account has been unlinked from the current Routefy merchant account.\n\nSend /start to link a new phone number!");
      return;
    }

    if (message.text.startsWith('DIM_')) {
      const parts = message.text.split('_');
      // Format: DIM_ORDERID_ProductName_Weight_L_B_H
      if (parts.length < 7) {
        await sendTelegramMessage(chatId, "❌ Invalid format. Please use: DIM_ORDERID_ProductName_Weight_Length_Breadth_Height");
        return;
      }
      const orderId = parts[1];
      const prodName = parts[2];
      const weight = parseFloat(parts[3]) || 1;
      const length = parseFloat(parts[4]) || 10;
      const breadth = parseFloat(parts[5]) || 10;
      const height = parseFloat(parts[6]) || 10;

      await sql`
        UPDATE orders 
        SET product_name = ${prodName}, weight_kg = ${weight}, length_cm = ${length}, breadth_cm = ${breadth}, height_cm = ${height}, status = 'pending' 
        WHERE id = ${orderId}
      `;

      const { rows: orderRows } = await sql`SELECT * FROM orders WHERE id = ${orderId} LIMIT 1`;
      const orderData = orderRows[0];

      await sendTelegramMessage(chatId, "Finding the best courier rates via Shiprocket... 🚚");
      
      const couriers = await getAggregatedCouriers(
        merchantData.pickup_pincode || '110001',
        orderData.pincode,
        orderData.weight_kg || 1,
        orderData.is_cod || false
      );

      if (couriers.length > 0) {
        await sql`UPDATE orders SET price = ${couriers[0].price} WHERE id = ${orderData.id}`;
        await sendTelegramInteractive(chatId, orderData.id, couriers);
      } else {
        await sendTelegramMessage(chatId, "❌ No couriers found for this route.");
      }
      return;
    }

    await sendTelegramMessage(chatId, "Processing your text order... ⏳");
    parsedData = await parseDeliveryDetails(message.text, merchantProducts);
  } else if (message.photo) {
    await sendTelegramMessage(chatId, "Analyzing your screenshot... 🔍");
    // Telegram sends multiple photo sizes, the last one is the largest
    const photo = message.photo[message.photo.length - 1];
    const base64Image = await downloadTelegramMediaAsBase64(photo.file_id);
    parsedData = await parseImageDetails(base64Image, merchantProducts);
  } else if (message.voice) {
    await sendTelegramMessage(chatId, "Listening to your voice note... 🎧");
    const audioFilePath = await downloadTelegramMediaToFile(message.voice.file_id);
    parsedData = await parseAudioDetails(audioFilePath, merchantProducts);
    
    if (fs.existsSync(audioFilePath)) {
      fs.unlinkSync(audioFilePath);
    }
  }

  // 4. Handle Extracted Data
  if (parsedData) {
    const isMissing = (val: any) => !val || val === 'null' || val === 'N/A' || val === 'Unknown' || String(val).trim() === '';

    if (isMissing(parsedData.customer_name) || isMissing(parsedData.customer_phone) || isMissing(parsedData.delivery_address) || isMissing(parsedData.pincode) || isMissing(parsedData.product_name)) {
      await sendTelegramMessage(
        chatId, 
        "It looks like you missed some details! ❌\n\nPlease provide all of the following in a single message so we can book your shipment:\n- Product Name\n- Customer Name\n- Customer Phone\n- Delivery Address\n- Pincode\n\n(If it's COD, please include the amount too!)"
      );
      return;
    }

    // Fetch Products
    const { rows: productsRows } = await sql`SELECT * FROM products WHERE merchant_id = ${merchantData.id}`;

    let orderData = null;
    try {
      const { rows } = await sql`
        INSERT INTO orders (
          merchant_id, customer_name, customer_phone, delivery_address, pincode, product_name, is_cod, cod_amount, weight_kg, length_cm, breadth_cm, height_cm, price, status
        ) VALUES (
          ${merchantData.id}, ${parsedData.customer_name}, ${parsedData.customer_phone}, ${parsedData.delivery_address}, ${parsedData.pincode}, ${parsedData.product_name}, ${parsedData.is_cod}, ${parsedData.cod_amount || 0}, ${parsedData.weight_kg || 1}, 10, 10, 10, 0, 'draft'
        ) RETURNING *
      `;
      orderData = rows[0];
    } catch (e) {
      console.error("Error saving order:", e);
      await sendTelegramMessage(chatId, "❌ Sorry, there was an error saving your order.");
      return;
    }

    if (productsRows.length > 1) {
      // Need product selection
      const inlineKeyboard = productsRows.map((p: any) => [{
        text: `${p.name} (${p.weight_kg}kg, ${p.length_cm}x${p.breadth_cm}x${p.height_cm})`,
        callback_data: `prod_${orderData.id}_${p.id}`
      }]);
      inlineKeyboard.push([{ text: "Other (Custom Dimensions)", callback_data: `prod_${orderData.id}_other` }]);

      await sendTelegramMessage(chatId, "📦 You have multiple products saved. Which one is this order for?", {
        inline_keyboard: inlineKeyboard
      });
      return;
    } else if (productsRows.length === 1) {
      // Auto-apply single product
      const p = productsRows[0];
      await sql`UPDATE orders SET product_name = ${p.name}, weight_kg = ${p.weight_kg}, length_cm = ${p.length_cm}, breadth_cm = ${p.breadth_cm}, height_cm = ${p.height_cm}, status = 'pending' WHERE id = ${orderData.id}`;
      orderData.product_name = p.name;
      orderData.weight_kg = p.weight_kg;
      orderData.length_cm = p.length_cm;
    } else {
      await sql`UPDATE orders SET status = 'pending' WHERE id = ${orderData.id}`;
    }

    await sendTelegramMessage(chatId, "Finding the best courier rates via Shiprocket... 🚚");
    
    const couriers = await getAggregatedCouriers(
      merchantData.pickup_pincode || '110001',
      parsedData.pincode,
      orderData.weight_kg || 1,
      parsedData.is_cod || false
    );

    if (couriers.length > 0) {
      await sql`UPDATE orders SET price = ${couriers[0].price} WHERE id = ${orderData.id}`;
      await sendTelegramInteractive(chatId, orderData.id, couriers);
    } else {
      await sendTelegramMessage(chatId, "❌ No couriers found for this route.");
    }
  }
}

async function handleCallbackQuery(callbackQuery: any) {
  const chatId = callbackQuery.message.chat.id.toString();
  const data = callbackQuery.data; // confirm_ORDERID_COURIERID

  if (data.startsWith('confirm_')) {
    const parts = data.split('_');
    const orderId = parts[1];
    const courierId = parts[2];
    const selectedPrice = parseFloat(parts[3]) || 0;

    await sendTelegramMessage(chatId, "Processing your booking with Shiprocket... ⏳");
    
    const { rows: orderRows } = await sql`SELECT * FROM orders WHERE id = ${orderId} LIMIT 1`;
    const order = orderRows[0];
    
    if (!order) {
      await sendTelegramMessage(chatId, "❌ Error: Order not found in database.");
      return;
    }

    try {
      // 1. Fetch Merchant Data
      const { rows: merchantRows } = await sql`SELECT wallet_balance, pickup_address, pickup_pincode FROM merchants WHERE id = ${order.merchant_id} LIMIT 1`;
      const merchant = merchantRows[0];
      const balance = parseFloat(merchant.wallet_balance) || 0;
      const shipmentCost = selectedPrice;

      if (shipmentCost <= 0) {
        await sendTelegramMessage(chatId, `❌ Invalid order format (price missing). This usually happens if you clicked an old button. Please send the delivery details again to create a new order.`);
        return;
      }

      if (!merchant.pickup_address || !merchant.pickup_pincode) {
        await sendTelegramMessage(chatId, `❌ You haven't set up your pickup address yet!\n\nPlease go to your dashboard settings to add your pickup location before booking shipments:\n👉 https://routefy-liart.vercel.app/dashboard/settings`);
        return;
      }

      // 2. Check Balance
      if (balance < shipmentCost) {
        await sendTelegramMessage(chatId, `❌ Insufficient wallet balance.\n\nThis shipment costs ₹${shipmentCost}, but your current balance is ₹${balance}.\n\nPlease recharge your wallet to proceed:\n👉 https://routefy-liart.vercel.app/dashboard/wallet`);
        return;
      }

      // 3. Process Booking
      const pickupNickname = `RTF_${order.merchant_id}`;
      const shipmentDetails = await bookCourier(orderId, courierId, order, pickupNickname);
      
      // 4. Deduct Balance & Log Transaction
      await sql`UPDATE merchants SET wallet_balance = wallet_balance - ${shipmentCost} WHERE id = ${order.merchant_id}`;
      
      const refId = `RTF${orderId.substring(0, 8).toUpperCase()}`;
      await sql`
        INSERT INTO wallet_transactions (merchant_id, amount, type, reference_id, description)
        VALUES (${order.merchant_id}, -${shipmentCost}, 'shipping_deduction', ${refId}, 'Shipment Booking Deduction')
      `;

      await sql`
        UPDATE orders 
        SET status = 'dispatched', 
            awb_code = ${shipmentDetails.awb_code}, 
            tracking_url = ${shipmentDetails.tracking_url},
            price = ${shipmentCost}
        WHERE id = ${orderId}
      `;
      await sendTelegramMessage(chatId, `✅ Shipment officially booked!\n\n₹${shipmentCost} was deducted from your wallet. New balance: ₹${(balance - shipmentCost).toFixed(2)}\n\nThe delivery agent will arrive tomorrow.\nTrack here: ${shipmentDetails.tracking_url}`);
    } catch (error: any) {
      await sendTelegramMessage(chatId, `❌ Failed to book shipment: ${error.message}`);
    }
  } else if (data.startsWith('prod_')) {
    const parts = data.split('_');
    const orderId = parts[1];
    const prodId = parts[2];
    
    if (prodId === 'other') {
      await sendTelegramMessage(chatId, `Please reply with the dimensions for this package using the format:\nDIM_${orderId}_ProductName_Weight_Length_Breadth_Height\n\nExample: DIM_${orderId}_Tshirt_0.5_10_10_10`);
      return;
    }

    // Fetch product details
    const { rows: prodRows } = await sql`SELECT * FROM products WHERE id = ${prodId} LIMIT 1`;
    if (prodRows.length === 0) return;
    const p = prodRows[0];

    await sql`
      UPDATE orders 
      SET product_name = ${p.name}, weight_kg = ${p.weight_kg}, length_cm = ${p.length_cm}, breadth_cm = ${p.breadth_cm}, height_cm = ${p.height_cm}, status = 'pending' 
      WHERE id = ${orderId}
    `;

    const { rows: orderRows } = await sql`SELECT * FROM orders WHERE id = ${orderId} LIMIT 1`;
    const orderData = orderRows[0];

    const { rows: merchantRows } = await sql`SELECT pickup_pincode FROM merchants WHERE id = ${orderData.merchant_id} LIMIT 1`;
    
    await sendTelegramMessage(chatId, "Finding the best courier rates via Shiprocket... 🚚");
    
    const couriers = await getAggregatedCouriers(
      merchantRows[0].pickup_pincode || '110001',
      orderData.pincode,
      orderData.weight_kg || 1,
      orderData.is_cod || false
    );

    if (couriers.length > 0) {
      await sql`UPDATE orders SET price = ${couriers[0].price} WHERE id = ${orderData.id}`;
      await sendTelegramInteractive(chatId, orderData.id, couriers);
    } else {
      await sendTelegramMessage(chatId, "❌ No couriers found for this route.");
    }
  }
}

// ---- Telegram API Helpers ----

async function sendTelegramMessage(chatId: string, text: string, replyMarkup: any = null) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const payload: any = {
    chat_id: chatId,
    text: text,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function sendTelegramInteractive(chatId: string, orderId: string, couriers: CourierOption[]) {
  const top3 = couriers.slice(0, 3);
  
  const inlineKeyboard = top3.map(courier => {
    return [{
      text: `${courier.courier_name} - ₹${courier.price} (${courier.estimated_delivery_days || 3}d)`,
      callback_data: `confirm_${orderId}_${courier.courier_id}_${courier.price}`
    }];
  });

  await sendTelegramMessage(chatId, `We found ${top3.length} shipping options for this delivery.\n\nPlease select your preferred courier:`, {
    inline_keyboard: inlineKeyboard
  });
}

async function downloadTelegramMediaAsBase64(fileId: string): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const fileInfoRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
  const fileInfo = await fileInfoRes.json();
  const filePath = fileInfo.result.file_path;

  const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
  const mediaRes = await fetch(downloadUrl);
  const buffer = await mediaRes.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

async function downloadTelegramMediaToFile(fileId: string): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const fileInfoRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
  const fileInfo = await fileInfoRes.json();
  const filePath = fileInfo.result.file_path;

  const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
  const mediaRes = await fetch(downloadUrl);
  const buffer = await mediaRes.arrayBuffer();
  
  const tempFilePath = path.join(os.tmpdir(), `${fileId}.ogg`);
  fs.writeFileSync(tempFilePath, Buffer.from(buffer));
  return tempFilePath;
}
