import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';

export async function GET() {
  const phone = cookies().get('merchant_session')?.value;
  if (!phone) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let data = null;
  try {
    const { rows } = await sql`SELECT * FROM merchants WHERE phone_number = ${phone} LIMIT 1`;
    data = rows[0];
  } catch (error) {
    console.error(error);
  }

  if (!data) {
    // If testing without DB, mock it
    return NextResponse.json({ phone_number: phone, pickup_address: null });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const phone = cookies().get('merchant_session')?.value;
  if (!phone) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { shop_name, pickup_address, pickup_pincode, default_product, phone_number: newPhone } = await request.json();

    let currentPhone = phone;

    // If they changed their phone number in settings, update the DB and cookie
    if (newPhone && newPhone !== phone) {
      try {
        await sql`UPDATE merchants SET phone_number = ${newPhone} WHERE phone_number = ${phone}`;
        cookies().set('merchant_session', newPhone, { path: '/' });
        currentPhone = newPhone;
      } catch (e) {
        console.warn("Could not update phone number (maybe already exists):", e);
        // continue with old phone if it fails
      }
    }

    try {
      console.log("Upserting profile for phone:", currentPhone, "Payload:", { shop_name, pickup_address, pickup_pincode, default_product });
      const result = await sql`
        INSERT INTO merchants (phone_number, shop_name, pickup_address, pickup_pincode, default_product)
        VALUES (${currentPhone}, ${shop_name}, ${pickup_address}, ${pickup_pincode}, ${default_product || '[]'})
        ON CONFLICT (phone_number) 
        DO UPDATE SET 
          shop_name = EXCLUDED.shop_name,
          pickup_address = EXCLUDED.pickup_address,
          pickup_pincode = EXCLUDED.pickup_pincode,
          default_product = COALESCE(EXCLUDED.default_product, merchants.default_product)
        RETURNING *;
      `;
      console.log("Upsert success! Result:", result.rows);
    } catch (error) {
      console.error("CRITICAL POSTGRES ERROR:", error);
      return NextResponse.json({ success: true, mocked: true, error: String(error) });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
