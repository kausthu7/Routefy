import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const phone = cookies().get('merchant_session')?.value;
  if (!phone) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get merchant ID
    const { rows: merchantRows } = await sql`SELECT id FROM merchants WHERE phone_number = ${phone} LIMIT 1`;
    const merchantId = merchantRows[0]?.id;

    if (!merchantId) {
      return NextResponse.json([]);
    }

    // Get orders for this merchant
    const { rows: orders } = await sql`
      SELECT id, customer_name, customer_phone, delivery_address, pincode, price, status, is_cod, created_at 
      FROM orders 
      WHERE merchant_id = ${merchantId} 
      ORDER BY created_at DESC
    `;

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
