import { getSessionMerchantId } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

    // Get orders for this merchant with pickup details
    const { rows: orders } = await sql`
      SELECT 
        o.id, o.customer_name, o.customer_phone, o.delivery_address, o.pincode, 
        o.price, o.status, o.is_cod, o.created_at,
        m.pickup_address, m.pickup_pincode
      FROM orders o
      JOIN merchants m ON o.merchant_id = m.id
      WHERE o.merchant_id = ${id} 
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const merchantId = await getSessionMerchantId();
  if (!merchantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(merchantId);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Only allow deleting pending, draft, or failed orders
    const { rowCount } = await sql`
      DELETE FROM orders 
      WHERE id = ${orderId} 
        AND merchant_id = ${id} 
        AND status IN ('pending', 'draft', 'failed', 'unsuccessful')
    `;

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Order not found or cannot be deleted' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
