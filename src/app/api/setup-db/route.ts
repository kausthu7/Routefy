import { NextResponse } from 'next/server';
import { initializeDatabase, sql } from '@/lib/db';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development mode' }, { status: 403 });
  }

  await initializeDatabase();
  
  // Insert the user's profile
  await sql`
    INSERT INTO merchants (phone_number, shop_name, pickup_address, pickup_pincode, default_product)
    VALUES ('919400178535', 'Trendy design', 'Madathinal', '686662', '[{"name":"Tshirt","weight":".5"}]')
    ON CONFLICT (phone_number) DO NOTHING;
  `;

  return NextResponse.json({ success: true, message: 'Database initialized and profile inserted!' });
}
