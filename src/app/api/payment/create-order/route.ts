import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import crypto from 'crypto';

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

    const { amount } = await req.json();
    if (!amount || amount < 10) {
      return NextResponse.json({ error: 'Invalid amount (min INR 10)' }, { status: 400 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyId',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourKeySecret',
    });

    // Create a receipt ID based on time + random hex to avoid collisions
    const receiptId = `rcpt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Create an order in Razorpay
    // Razorpay amount is in smallest currency unit (paise for INR), so multiply by 100
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: receiptId,
      payment_capture: 1 // Auto-capture the payment
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
    }

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID // Front-end needs the key ID to init checkout
    });

  } catch (error) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
