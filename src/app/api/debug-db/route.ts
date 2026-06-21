import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`
      INSERT INTO merchants (phone_number, shop_name, pickup_address, pickup_pincode, default_product)
      VALUES ('1234567890', 'Test Shop', 'Test Address', '123456', '[]')
      ON CONFLICT (phone_number) 
      DO UPDATE SET 
        shop_name = EXCLUDED.shop_name,
        pickup_address = EXCLUDED.pickup_address,
        pickup_pincode = EXCLUDED.pickup_pincode,
        default_product = EXCLUDED.default_product
      RETURNING *;
    `;
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}
