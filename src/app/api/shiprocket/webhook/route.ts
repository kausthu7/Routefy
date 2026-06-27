import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Shiprocket sends POST requests here when a shipment status changes
export async function POST(request: Request) {
  try {
    // Check for authorization header if you configure one in Shiprocket webhook settings
    const authHeader = request.headers.get('x-shiprocket-signature') || request.headers.get('authorization');
    
    // In a real production app, verify the signature. 
    // For now, we will parse the payload and update the database if we find a matching AWB.

    const body = await request.json();

    // Shiprocket's tracking webhook payload format:
    // {
    //   "awb": "1234567890",
    //   "current_status": "DELIVERED",
    //   ...
    // }

    const awb = body.awb;
    let status = body.current_status;

    if (!awb || !status) {
      return NextResponse.json({ success: false, message: 'Invalid payload missing AWB or status' }, { status: 400 });
    }

    // Standardize status
    status = status.toLowerCase();
    
    // Some common shiprocket statuses: 'pickup scheduled', 'in transit', 'out for delivery', 'delivered', 'rto'
    let dbStatus = 'dispatched';
    if (status.includes('transit')) dbStatus = 'in transit';
    if (status.includes('out for delivery')) dbStatus = 'out for delivery';
    if (status.includes('delivered')) dbStatus = 'delivered';
    if (status.includes('rto') || status.includes('returned')) dbStatus = 'rto';
    if (status.includes('cancel')) dbStatus = 'cancelled';

    // Update the DB
    const { rowCount } = await sql`
      UPDATE orders 
      SET status = ${dbStatus} 
      WHERE awb_code = ${awb}
    `;

    if (rowCount === 0) {
      console.warn(`[Shiprocket Webhook] Received update for unknown AWB: ${awb}`);
      return NextResponse.json({ success: true, message: 'AWB not found, but webhook accepted' });
    }

    console.log(`[Shiprocket Webhook] Updated AWB ${awb} to status ${dbStatus}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Shiprocket webhook error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
