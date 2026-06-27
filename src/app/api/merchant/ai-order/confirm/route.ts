import { getSessionMerchantId } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { createOrderAndGenerateAWB } from '@/lib/shiprocket';

export const maxDuration = 30;

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

    const body = await request.json();
    const { orderId, courierId, price } = body;
    
    if (!orderId || !courierId || !price) {
      return NextResponse.json({ error: 'Missing orderId, courierId, or price' }, { status: 400 });
    }

    const shipmentCost = parseFloat(price);

    // 1. Fetch Order and Verify Ownership
    const { rows: orderRows } = await sql`SELECT * FROM orders WHERE id = ${orderId} AND merchant_id = ${merchantId} LIMIT 1`;
    if (orderRows.length === 0) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }
    const order = orderRows[0];

    // 2. Fetch Merchant Data (Balance & Address)
    const { rows: merchantRows } = await sql`
      SELECT wallet_balance, pickup_address, pickup_pincode 
      FROM merchants 
      WHERE id = ${merchantId} 
      LIMIT 1
    `;
    const merchant = merchantRows[0];
    const balance = parseFloat(merchant.wallet_balance) || 0;

    if (!merchant.pickup_address || !merchant.pickup_pincode) {
      return NextResponse.json({ error: 'You must set up your pickup address in Settings before booking shipments.' }, { status: 400 });
    }

    // 3. Check Wallet Balance
    if (balance < shipmentCost) {
      return NextResponse.json({ error: `Insufficient balance. Required: ₹${shipmentCost}, Available: ₹${balance}` }, { status: 400 });
    }

    // 4. Book via Orchestrator
    const pickupNickname = `RTF_${merchantId}`;
    let shipmentDetails;
    try {
      const { bookCourier } = await import('@/lib/couriers');
      shipmentDetails = await bookCourier(orderId.toString(), courierId.toString(), order, pickupNickname);
    } catch (e: any) {
      console.error("Shiprocket Booking Error:", e);
      return NextResponse.json({ error: `Shiprocket Error: ${e.message}` }, { status: 500 });
    }

    // 5. Deduct Balance & Update Order
    await sql`UPDATE merchants SET wallet_balance = wallet_balance - ${shipmentCost} WHERE id = ${merchantId}`;
    
    const refId = `RTF${orderId.toString().substring(0, 8).toUpperCase()}`;
    await sql`
      INSERT INTO wallet_transactions (merchant_id, amount, type, reference_id, description)
      VALUES (${merchantId}, -${shipmentCost}, 'shipping_deduction', ${refId}, 'Smart Booking Deduction')
    `;

    await sql`
      UPDATE orders 
      SET status = 'dispatched', 
          awb_code = ${shipmentDetails.awb_code}, 
          tracking_url = ${shipmentDetails.tracking_url},
          price = ${shipmentCost}
      WHERE id = ${orderId}
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Shipment booked successfully!',
      trackingUrl: shipmentDetails.tracking_url
    });

  } catch (error: any) {
    console.error("Confirm AI Order API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
