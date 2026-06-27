import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const merchantId = cookies().get('merchant_session')?.value;
    if (!merchantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await request.json();
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);

    // Add balance to merchant
    await sql`
      UPDATE merchants 
      SET wallet_balance = COALESCE(wallet_balance, 0) + ${numericAmount} 
      WHERE id = ${merchantId}
    `;

    // Create a transaction record
    const refId = 'mock_tx_' + Date.now();
    await sql`
      INSERT INTO wallet_transactions (merchant_id, amount, type, reference_id, description)
      VALUES (${merchantId}, ${numericAmount}, 'recharge', ${refId}, 'Mock Wallet Recharge')
    `;

    return NextResponse.json({ success: true, message: `Successfully added ₹${numericAmount} to wallet` });
  } catch (error) {
    console.error('Wallet recharge error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
