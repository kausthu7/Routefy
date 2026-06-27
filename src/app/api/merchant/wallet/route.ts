import { getSessionMerchantId } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export async function GET() {
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

    // Get balance
    const { rows: merchantRows } = await sql`
      SELECT wallet_balance FROM merchants WHERE id = ${id}
    `;

    if (merchantRows.length === 0) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    const balance = merchantRows[0].wallet_balance || 0;

    // Get latest transactions
    const { rows: transactions } = await sql`
      SELECT id, amount, type, reference_id, description, created_at
      FROM wallet_transactions
      WHERE merchant_id = ${id}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({ balance, transactions });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
