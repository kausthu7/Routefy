import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const sessionToken = cookies().get('merchant_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const merchantId = parseInt(sessionToken, 10);
    if (isNaN(merchantId) || merchantId > 2147483647) {
      cookies().delete('merchant_session');
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify Razorpay Signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'YourKeySecret';
    const bodyString = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(bodyString.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Update Wallet Balance
    await sql`
      UPDATE merchants 
      SET wallet_balance = COALESCE(wallet_balance, 0) + ${amount} 
      WHERE id = ${merchantId}
    `;

    // Record Transaction
    await sql`
      INSERT INTO wallet_transactions (merchant_id, amount, type, reference_id, description)
      VALUES (${merchantId}, ${amount}, 'recharge', ${razorpay_payment_id}, 'Razorpay Wallet Topup')
    `;

    return NextResponse.json({ success: true, message: 'Payment verified successfully' });

  } catch (error) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
