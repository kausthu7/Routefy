import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { phone, otp, name } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    const storedOtp = cookies().get('mock_otp_storage')?.value;

    if (!storedOtp || storedOtp !== otp) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // Ensure merchant exists in Postgres
    const { rows } = await sql`
      SELECT id FROM merchants WHERE phone_number = ${phone}
    `;
    const existingMerchant = rows[0];

    if (!existingMerchant) {
      await sql`
        INSERT INTO merchants (phone_number, shop_name)
        VALUES (${phone}, ${name || null})
      `;
    } else if (name) {
      // Optional: Update name if they enter a new one during login
      await sql`
        UPDATE merchants SET shop_name = ${name} WHERE phone_number = ${phone}
      `;
    }

    // Create an auth session cookie for the dashboard
    cookies().set('merchant_session', phone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // Clear the OTP cookie
    cookies().delete('mock_otp_storage');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
