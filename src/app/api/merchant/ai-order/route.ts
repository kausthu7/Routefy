import { getSessionMerchantId } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { parseDeliveryDetails, parseImageDetails, parseAudioDetails } from '@/lib/gemini';
import { getAggregatedCouriers } from '@/lib/couriers';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const maxDuration = 60; // Allow long running for AI parsing

export async function POST(request: Request) {
  try {
    const merchantIdCookie = await getSessionMerchantId();
    if (!merchantIdCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const merchantId = Number(merchantIdCookie);
    if (isNaN(merchantId) || merchantId > 2147483647) {
      cookies().delete('merchant_session');
    cookies().delete('merchant_session_token');
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // 1. Fetch Merchant Data
    const { rows: merchantRows } = await sql`
      SELECT id, shop_name, pickup_pincode, default_product
      FROM merchants
      WHERE id = ${merchantId}
      LIMIT 1
    `;

    if (merchantRows.length === 0) {
      cookies().delete('merchant_session');
    cookies().delete('merchant_session_token');
      return NextResponse.json({ error: 'Merchant not found. Please log in again.' }, { status: 404 });
    }
    
    // Fetch products
    const { rows: productsRows } = await sql`SELECT * FROM products WHERE merchant_id = ${merchantId}`;
    const merchantProductsStr = productsRows.map((p: any) => p.name).join(", ");

    // 2. Parse Request
    const body = await request.json();
    const { type, data, parsedData: providedParsedData } = body;
    
    let parsedData = providedParsedData;

    if (!parsedData) {
      if (!type || !data) {
        return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
      }

      if (type === 'text') {
        parsedData = await parseDeliveryDetails(data, merchantProductsStr);
      } else if (type === 'image') {
        const base64Image = data.replace(/^data:image\/\w+;base64,/, "");
        parsedData = await parseImageDetails(base64Image, merchantProductsStr);
      } else if (type === 'audio') {
        const base64Audio = data.replace(/^data:audio\/\w+;base64,/, "").replace(/^data:audio\/webm;codecs=opus;base64,/, "").replace(/^data:application\/ogg;base64,/, "");
        const tempFilePath = path.join(os.tmpdir(), `ai_audio_${Date.now()}.ogg`);
        fs.writeFileSync(tempFilePath, Buffer.from(base64Audio, 'base64'));
        try {
          parsedData = await parseAudioDetails(tempFilePath, merchantProductsStr);
        } finally {
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        }
      } else {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
      }

      if (!parsedData) {
        return NextResponse.json({ error: 'Failed to extract data from input.' }, { status: 400 });
      }

      // If multiple products exist, return early to prompt user
      if (productsRows.length > 1) {
        return NextResponse.json({ needsProductSelection: true, parsedData, products: productsRows });
      } 
      // If 1 product exists, auto-apply it
      else if (productsRows.length === 1) {
        parsedData.product_name = productsRows[0].name;
        parsedData.weight_kg = productsRows[0].weight_kg;
        parsedData.length_cm = productsRows[0].length_cm;
        parsedData.breadth_cm = productsRows[0].breadth_cm;
        parsedData.height_cm = productsRows[0].height_cm;
      }
      // If 0 products exist, we could prompt for "Other" or just leave it for validation
      else {
        return NextResponse.json({ needsProductSelection: true, parsedData, products: [] });
      }
    }

    // 3. Validate extracted fields
    const isMissing = (val: any) => !val || val === 'null' || val === 'N/A' || val === 'Unknown' || String(val).trim() === '';
    
    if (isMissing(parsedData.customer_name) || isMissing(parsedData.customer_phone) || isMissing(parsedData.delivery_address) || isMissing(parsedData.pincode) || isMissing(parsedData.product_name)) {
      return NextResponse.json({ 
        error: "Missing details. Please provide Product Name, Customer Name, Phone, Delivery Address, and Pincode." 
      }, { status: 400 });
    }

    // 4. Fetch Couriers
    const pickupPincode = merchantRows[0].pickup_pincode || '110001';
    const couriers = await getAggregatedCouriers(
      pickupPincode,
      parsedData.pincode,
      parsedData.weight_kg || 1,
      parsedData.is_cod || false
    );

    if (!couriers || couriers.length === 0) {
      return NextResponse.json({ error: 'No courier options available for this route.' }, { status: 400 });
    }

    // 5. Create Pending Order
    const { rows: orderRows } = await sql`
      INSERT INTO orders (
        merchant_id, customer_name, customer_phone, delivery_address, pincode, product_name, is_cod, cod_amount, weight_kg, length_cm, breadth_cm, height_cm, price, status
      ) VALUES (
        ${merchantId}, ${parsedData.customer_name}, ${parsedData.customer_phone}, ${parsedData.delivery_address}, ${parsedData.pincode}, ${parsedData.product_name}, ${parsedData.is_cod}, ${parsedData.cod_amount || 0}, ${parsedData.weight_kg || 1}, ${parsedData.length_cm || 10}, ${parsedData.breadth_cm || 10}, ${parsedData.height_cm || 10}, ${couriers[0].price}, 'pending'
      ) RETURNING *
    `;
    
    const orderData = orderRows[0];

    // Return the created pending order and courier options
    return NextResponse.json({ 
      success: true,
      order: orderData, 
      couriers: couriers 
    });

  } catch (error: any) {
    console.error("AI Order API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
