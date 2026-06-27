import { getSessionMerchantId } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const merchantId = await getSessionMerchantId();
    if (!merchantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const id = Number(merchantId);
    if (isNaN(id) || id > 2147483647) {
      cookies().delete('merchant_session');
    cookies().delete('merchant_session_token');
      return NextResponse.json({ error: 'Invalid session. Please login again.' }, { status: 401 });
    }
    const { amount } = await request.json();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const topupAmount = parseFloat(amount);

    // In a real production app, this would be a Razorpay webhook verification endpoint.
    // For this MVP, we simulate a successful topup.

    // 1. Insert transaction
    const referenceId = `UPI/SIMULATED/${Math.floor(Math.random() * 1000000)}`;
    await sql`
      INSERT INTO wallet_transactions (merchant_id, amount, type, reference_id, description)
      VALUES (${id}, ${topupAmount}, 'Wallet Topup', ${referenceId}, 'Simulated Topup')
    `;

    // 2. Update wallet balance
    await sql`
      UPDATE merchants 
      SET wallet_balance = wallet_balance + ${topupAmount}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, message: 'Topup successful', balanceAdded: topupAmount });
  } catch (error) {
    console.error('Wallet topup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
