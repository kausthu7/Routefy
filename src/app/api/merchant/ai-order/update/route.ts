import { getSessionMerchantId } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { getAggregatedCouriers } from '@/lib/couriers';

export async function POST(request: Request) {
  try {
    const merchantIdCookie = await getSessionMerchantId();
    if (!merchantIdCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const merchantId = Number(merchantIdCookie);
    if (isNaN(merchantId)) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, customer_name, customer_phone, delivery_address, pincode, is_cod, cod_amount, weight_kg } = body;
    
    if (!orderId || !customer_name || !customer_phone || !delivery_address || !pincode) {
      return NextResponse.json({ error: 'Missing mandatory fields' }, { status: 400 });
    }

    // Update the order in the database
    const { rows: orderRows } = await sql`
      UPDATE orders 
      SET 
        customer_name = ${customer_name},
        customer_phone = ${customer_phone},
        delivery_address = ${delivery_address},
        pincode = ${pincode},
        is_cod = ${!!is_cod},
        cod_amount = ${cod_amount || 0},
        weight_kg = ${weight_kg || 1}
      WHERE id = ${orderId} AND merchant_id = ${merchantId} AND status IN ('pending', 'draft')
      RETURNING *
    `;

    if (orderRows.length === 0) {
      return NextResponse.json({ error: 'Order not found or cannot be modified' }, { status: 404 });
    }

    const orderData = orderRows[0];

    // Fetch the merchant to get the pickup pincode for couriers
    const { rows: merchantRows } = await sql`
      SELECT pickup_pincode FROM merchants WHERE id = ${merchantId} LIMIT 1
    `;
    const pickupPincode = merchantRows[0]?.pickup_pincode || '110001';

    // Fetch new couriers
    const couriers = await getAggregatedCouriers(
      pickupPincode,
      orderData.pincode,
      orderData.weight_kg,
      orderData.is_cod
    );

    if (couriers && couriers.length > 0) {
      await sql`UPDATE orders SET price = ${couriers[0].price} WHERE id = ${orderData.id}`;
    }

    return NextResponse.json({ 
      success: true,
      order: orderData, 
      couriers: couriers 
    });

  } catch (error: any) {
    console.error("AI Order Update Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
