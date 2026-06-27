import { getSessionMerchantId } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { addPickupLocation } from '@/lib/shiprocket';

export async function GET() {
  const merchantId = await getSessionMerchantId();
  if (!merchantId) {
    cookies().delete('merchant_session');
    cookies().delete('merchant_session_token');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(merchantId);
  if (isNaN(id)) {
    cookies().delete('merchant_session');
    cookies().delete('merchant_session_token');
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  try {
    const { rows } = await sql`SELECT * FROM merchants WHERE id = ${id} LIMIT 1`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const merchantId = await getSessionMerchantId();
  if (!merchantId) {
    cookies().delete('merchant_session');
    cookies().delete('merchant_session_token');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(merchantId);
  if (isNaN(id)) {
    cookies().delete('merchant_session');
    cookies().delete('merchant_session_token');
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  try {
    const { shop_name, pickup_address, pickup_pincode, default_product, phone_number: newPhone } = await request.json();

    if (!shop_name || !pickup_address || !pickup_pincode) {
      return NextResponse.json({ error: 'Shop Name, Pickup Address, and Pincode are mandatory fields.' }, { status: 400 });
    }

    const { rows: merchantRows } = await sql`SELECT phone_number FROM merchants WHERE id = ${id}`;
    if (merchantRows.length === 0) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }
    const currentPhone = merchantRows[0].phone_number;

    if (newPhone && newPhone !== currentPhone) {
      try {
        await sql`UPDATE merchants SET phone_number = ${newPhone} WHERE id = ${id}`;
      } catch (e) {
        console.warn("Could not update phone number (maybe already exists):", e);
      }
    }

    try {
      await sql`
        UPDATE merchants SET 
          shop_name = ${shop_name},
          pickup_address = ${pickup_address},
          pickup_pincode = ${pickup_pincode},
          default_product = COALESCE(${default_product || null}, default_product)
        WHERE id = ${id}
      `;
    } catch (error: any) {
      console.error("CRITICAL POSTGRES ERROR:", error);
      return NextResponse.json({ error: 'Database update failed: ' + (error.message || error.toString()) }, { status: 500 });
    }

    // Connect to Shiprocket API
    if (pickup_address && pickup_pincode) {
      try {
        let city = "City";
        let state = "State";
        
        // Fetch real city and state from postalpincode API
        const pinRes = await fetch(`https://api.postalpincode.in/pincode/${pickup_pincode}`);
        const pinData = await pinRes.json();
        if (pinData && pinData[0] && pinData[0].Status === "Success") {
          const postOffice = pinData[0].PostOffice[0];
          city = postOffice.District || postOffice.Region || "City";
          state = postOffice.State || "State";
        }

        // Generate unique nickname for Shiprocket using the merchant ID
        const pickupNickname = `RTF_${id}`;

        // Push to Shiprocket
        await addPickupLocation(
          pickupNickname,
          shop_name,
          newPhone || currentPhone,
          pickup_address,
          pickup_pincode,
          city,
          state
        );
      } catch (e) {
        console.error("Failed to push pickup location to Shiprocket", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
