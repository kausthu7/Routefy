import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { parseDeliveryDetails, parseImageDetails, parseAudioDetails } from '@/lib/gemini';
import { getTopCouriers, createOrderAndGenerateAWB, CourierOption } from '@/lib/shiprocket';
import { sql } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import os from 'os';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

export const maxDuration = 60; // Allow Vercel to run for up to 60 seconds instead of the default 10s timeout

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("================ INCOMING WEBHOOK ================");
    console.log(JSON.stringify(body, null, 2));
    console.log("==================================================");

    waitUntil(processWebhook(body));

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processWebhook(body: any) {
  try {
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value && change.value.messages) {
            for (const message of change.value.messages) {
              const phone_number_id = change.value.metadata?.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID;
              const from = message.from; 
              
              // 1. Authenticate Merchant by Caller ID
              const fromLast10 = from.slice(-10);
              const { rows: merchantRows } = await sql`
                SELECT id, shop_name, pickup_pincode FROM merchants
                WHERE phone_number LIKE ${'%' + fromLast10 + '%'}
                LIMIT 1
              `;
              const merchantData = merchantRows[0];

              if (!merchantData) {
                console.log(`[Auth Failed] Unknown number: ${from}`);
                await sendWhatsAppMessage(phone_number_id, from, "Welcome to Routefy! 🚀 We don't recognize this phone number. Please register at routefy.com first to start booking shipments.");
                continue;
              }

              let parsedData = null;

              // 2. Handle Interactive Confirmations (Shiprocket Checkout)
              if (message.type === 'interactive' && message.interactive.button_reply) {
                const buttonId = message.interactive.button_reply.id; 
                if (buttonId.startsWith('confirm_')) {
                  const parts = buttonId.split('_');
                  const orderId = parts[1];
                  const courierId = parts.slice(2).join('_');

                  await sendWhatsAppMessage(phone_number_id, from, "Processing your booking with Shiprocket... ⏳");
                  
                  const { rows: orderRows } = await sql`SELECT * FROM orders WHERE id = ${orderId} LIMIT 1`;
                  const order = orderRows[0];
                  
                  if (!order) {
                    await sendWhatsAppMessage(phone_number_id, from, "❌ Error: Order not found in database.");
                    continue;
                  }

                  try {
                    const shipmentDetails = await createOrderAndGenerateAWB(orderId, courierId, order, 'Primary');
                    await sql`UPDATE orders SET status = 'dispatched' WHERE id = ${orderId}`;
                    await sendWhatsAppMessage(phone_number_id, from, `✅ Shipment officially booked! The agent will arrive tomorrow.\n\nTrack here: ${shipmentDetails.tracking_url}`);
                  } catch (err: any) {
                    await sendWhatsAppMessage(phone_number_id, from, `❌ Failed to book shipment: ${err.message}`);
                  }
                }
                continue;
              }

              // 3. Handle Text Messages
              if (message.type === 'text') {
                const text = message.text.body;
                await sendWhatsAppMessage(phone_number_id, from, "Processing your text order...");
                parsedData = await parseDeliveryDetails(text);
              }

              // 4. Handle Image Messages (Screenshots)
              if (message.type === 'image') {
                await sendWhatsAppMessage(phone_number_id, from, "Analyzing your screenshot...");
                const mediaId = message.image.id;
                const base64Image = await downloadWhatsAppMediaAsBase64(mediaId);
                parsedData = await parseImageDetails(base64Image);
              }

              // 5. Handle Audio Messages (Voice Notes)
              if (message.type === 'audio') {
                await sendWhatsAppMessage(phone_number_id, from, "Listening to your voice note...");
                const mediaId = message.audio.id;
                const audioFilePath = await downloadWhatsAppMediaToFile(mediaId);
                parsedData = await parseAudioDetails(audioFilePath);
                
                if (fs.existsSync(audioFilePath) && !audioFilePath.includes('mock')) {
                  fs.unlinkSync(audioFilePath);
                }
              }

              // 6. Process Extracted Data and Call Shiprocket
              if (parsedData) {
                const isMissing = (val: any) => !val || val === 'null' || val === 'N/A' || val === 'Unknown' || String(val).trim() === '';

                if (isMissing(parsedData.customer_name) || isMissing(parsedData.customer_phone) || isMissing(parsedData.delivery_address) || isMissing(parsedData.pincode)) {
                  await sendWhatsAppMessage(
                    phone_number_id, 
                    from, 
                    "It looks like you missed some details! ❌\n\nPlease provide all of the following in a single message so we can book your shipment:\n- Customer Name\n- Customer Phone\n- Delivery Address\n- Pincode\n\n(If it's COD, please include the amount too!)"
                  );
                  continue;
                }

                await sendWhatsAppMessage(phone_number_id, from, "Finding the best courier rates via Shiprocket... 🚚");
                
                const couriers = await getTopCouriers(
                  merchantData.pickup_pincode || '110001',
                  parsedData.pincode,
                  parsedData.weight_kg || 1,
                  parsedData.is_cod || false
                );

                let orderData = null;
                try {
                  const { rows } = await sql`
                    INSERT INTO orders (
                      merchant_id, customer_name, customer_phone, delivery_address, pincode, is_cod, cod_amount, weight_kg, price, status
                    ) VALUES (
                      ${merchantData.id}, ${parsedData.customer_name}, ${parsedData.customer_phone}, ${parsedData.delivery_address}, ${parsedData.pincode}, ${parsedData.is_cod}, ${parsedData.cod_amount}, ${parsedData.weight_kg}, ${couriers[0].price}, 'pending'
                    ) RETURNING *
                  `;
                  orderData = rows[0];
                } catch (e) {
                  console.error("Error saving order:", e);
                }

                if (orderData) {
                  await sendWhatsAppInteractive(phone_number_id, from, orderData.id, couriers);
                } else {
                  await sendWhatsAppMessage(phone_number_id, from, "❌ Sorry, there was an error saving your order.");
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
}

// Media Downloader Helpers
async function downloadWhatsAppMediaAsBase64(mediaId: string): Promise<string> {
  if (!WHATSAPP_TOKEN) throw new Error("Missing WHATSAPP_TOKEN");

  const urlRes = await fetch(`https://graph.facebook.com/v17.0/${mediaId}`, {
    headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
  });
  const urlData = await urlRes.json();
  
  if (!urlData.url) throw new Error("Failed to get media URL");

  const mediaRes = await fetch(urlData.url, {
    headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
  });
  const buffer = await mediaRes.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

async function downloadWhatsAppMediaToFile(mediaId: string): Promise<string> {
  if (!WHATSAPP_TOKEN) throw new Error("Missing WHATSAPP_TOKEN");

  const urlRes = await fetch(`https://graph.facebook.com/v17.0/${mediaId}`, {
    headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
  });
  const urlData = await urlRes.json();
  
  if (!urlData.url) throw new Error("Failed to get media URL");

  const mediaRes = await fetch(urlData.url, {
    headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
  });
  const buffer = await mediaRes.arrayBuffer();
  const tempFilePath = path.join(os.tmpdir(), `${mediaId}.ogg`);
  fs.writeFileSync(tempFilePath, Buffer.from(buffer));
  return tempFilePath;
}

// Send WhatsApp Message Helper
async function sendWhatsAppMessage(phone_number_id: string, to: string, text: string) {
  // Record for Simulator
  const toLast10 = to.slice(-10);
  const { rows } = await sql`SELECT id FROM merchants WHERE phone_number LIKE ${'%' + toLast10 + '%'} LIMIT 1`;
  const m = rows[0];
  if (m) {
    await sql`INSERT INTO ai_messages (merchant_id, sender, text_content) VALUES (${m.id}, 'ai', ${text})`;
  }

  if (!WHATSAPP_TOKEN) {
    console.warn("Cannot send message: WHATSAPP_TOKEN missing.");
    return;
  }

  const res = await fetch(`https://graph.facebook.com/v17.0/${phone_number_id}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      text: { body: text }
    })
  });
  const resData = await res.json();
  console.log(`[Meta API] Sent message to ${to}. Response:`, resData);
}

// Send Interactive Message Helper (Shiprocket 3-Button Flow)
async function sendWhatsAppInteractive(phone_number_id: string, to: string, orderId: string, couriers: CourierOption[]) {
  // Ensure max 3 couriers for WhatsApp Interactive limitations
  const top3 = couriers.slice(0, 3);
  
  const buttons = top3.map((courier) => {
    // Button title must be <= 20 chars
    // e.g. "Delhivery ₹60 4d"
    const shortName = courier.courier_name.substring(0, 8).trim();
    const daysText = courier.estimated_delivery_days ? ` ${courier.estimated_delivery_days}d` : '';
    
    // Ensure the total title doesn't exceed 20 characters
    let title = `${shortName} ₹${courier.price}${daysText}`;
    if (title.length > 20) {
        title = title.substring(0, 20);
    }

    return {
      type: 'reply',
      reply: {
        id: `confirm_${orderId}_${courier.courier_id}`,
        title: title
      }
    };
  });

  const messageText = `We found ${top3.length} shipping options for this delivery.\n\nPlease select your preferred courier:`;
  const optionsText = buttons.map(b => `🔘 ${b.reply.title} |__ID__${b.reply.id}__|`).join('\n');

  // Record for Simulator
  const toLast10 = to.slice(-10);
  const { rows } = await sql`SELECT id FROM merchants WHERE phone_number LIKE ${'%' + toLast10 + '%'} LIMIT 1`;
  const m = rows[0];
  if (m) {
    await sql`INSERT INTO ai_messages (merchant_id, sender, text_content) VALUES (${m.id}, 'ai', ${`${messageText}\n\n${optionsText}`})`;
  }

  if (!WHATSAPP_TOKEN) {
    console.warn("Cannot send interactive message: WHATSAPP_TOKEN missing.");
    return;
  }

  await fetch(`https://graph.facebook.com/v17.0/${phone_number_id}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: messageText
        },
        action: {
          buttons: buttons
        }
      }
    })
  });
}
