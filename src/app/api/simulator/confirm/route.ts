import { NextResponse } from 'next/server';
import { createOrderAndGenerateAWB } from '@/lib/shiprocket';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { buttonId } = await request.json();

    if (!buttonId || !buttonId.startsWith('confirm_')) {
      return NextResponse.json({ error: 'Invalid button ID' }, { status: 400 });
    }

    const parts = buttonId.split('_');
    const orderId = parts[1];
    const courierId = parts.slice(2).join('_'); 

    // Fetch the real order data from the database
    const { rows: orderRows } = await sql`SELECT * FROM orders WHERE id = ${orderId} LIMIT 1`;
    const order = orderRows[0];
    
    if (!order) {
      return NextResponse.json({
        messages: [{ text: "❌ Error: Order not found in database." }]
      });
    }

    // Generate AWB via Shiprocket using real data
    const shipmentDetails = await createOrderAndGenerateAWB(orderId, courierId, order, 'Primary');

    // Update DB
    await sql`UPDATE orders SET status = 'dispatched' WHERE id = ${orderId}`;
    
    // Reply with Tracking Link
    return NextResponse.json({
      messages: [{
        text: `✅ Shipment officially booked! The agent will arrive tomorrow.\n\nTrack here: ${shipmentDetails.tracking_url}`
      }]
    });

  } catch (error) {
    console.error("Simulator Confirm Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
