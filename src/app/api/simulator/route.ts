import { NextResponse } from 'next/server';
import { parseDeliveryDetails, parseImageDetails, parseAudioDetails } from '@/lib/gemini';
import { getTopCouriers, CourierOption } from '@/lib/shiprocket';
import { sql } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const maxDuration = 60; // Allow Vercel to run for up to 60 seconds

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const phone_number = formData.get('phone_number') as string;
    if (!phone_number) {
      return NextResponse.json({ messages: [{ text: "Error: No phone number provided." }] });
    }

    // Authenticate Merchant (Simulator)
    const fromLast10 = phone_number.slice(-10);
    const { rows: merchantRows } = await sql`
      SELECT id, shop_name, pickup_pincode FROM merchants
      WHERE phone_number LIKE ${'%' + fromLast10 + '%'}
      LIMIT 1
    `;
    const merchantData = merchantRows[0];

    if (!merchantData) {
      return NextResponse.json({
        messages: [{ text: "Welcome to Routefy! 🚀 We don't recognize this phone number. Please register at routefy.com first to start booking shipments." }]
      });
    }

    let parsedData = null;
    let messages: any[] = [];

    // Extract files or text
    const text = formData.get('text') as string;
    const image = formData.get('image') as File;
    const audio = formData.get('audio') as File;

    if (image) {
      messages.push({ text: "Analyzing your screenshot..." });
      const arrayBuffer = await image.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      parsedData = await parseImageDetails(base64Image);
    } else if (audio) {
      messages.push({ text: "Listening to your voice note..." });
      const arrayBuffer = await audio.arrayBuffer();
      const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.ogg`);
      fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));
      parsedData = await parseAudioDetails(tempFilePath);
      fs.unlinkSync(tempFilePath);
    } else if (text) {
      messages.push({ text: "Processing your text order..." });
      parsedData = await parseDeliveryDetails(text);
    }

    if (!parsedData) {
      messages.push({ text: "I couldn't understand that. Please provide an image, text, or audio note!" });
      return NextResponse.json({ messages });
    }

    const isMissing = (val: any) => !val || val === 'null' || val === 'N/A' || val === 'Unknown' || String(val).trim() === '';

    if (isMissing(parsedData.customer_name) || isMissing(parsedData.customer_phone) || isMissing(parsedData.delivery_address) || isMissing(parsedData.pincode)) {
      messages.push({
        text: "It looks like you missed some details! ❌\n\nPlease provide all of the following:\n- Customer Name\n- Customer Phone\n- Delivery Address\n- Pincode\n\n(If it's COD, please include the amount too!)"
      });
      return NextResponse.json({ messages });
    }

    messages.push({ text: "Finding the best courier rates via Shiprocket... 🚚" });
    
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
          ${merchantData.id}, ${parsedData.customer_name}, ${parsedData.customer_phone}, ${parsedData.delivery_address}, ${parsedData.pincode}, ${parsedData.is_cod}, ${parsedData.cod_amount}, ${parsedData.weight_kg}, ${couriers[0]?.price || 0}, 'pending'
        ) RETURNING *
      `;
      orderData = rows[0];
    } catch (e) {
      console.error("Simulator Order Insert Error:", e);
    }

    if (orderData) {
      // Return the interactive buttons
      const top3 = couriers.slice(0, 3);
      const buttons = top3.map((courier) => {
        const shortName = courier.courier_name.substring(0, 8).trim();
        const daysText = courier.estimated_delivery_days ? ` ${courier.estimated_delivery_days}d` : '';
        let title = `${shortName} ₹${courier.price}${daysText}`;
        if (title.length > 20) title = title.substring(0, 20);
        
        return {
          id: `confirm_${orderData.id}_${courier.courier_id}`,
          title: title
        };
      });

      messages.push({
        text: `We found ${top3.length} shipping options for this delivery.\n\nPlease select your preferred courier:`,
        buttons: buttons
      });
    } else {
      messages.push({ text: "❌ Sorry, there was an error saving your order." });
    }

    return NextResponse.json({ messages });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
