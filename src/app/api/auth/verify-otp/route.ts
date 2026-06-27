import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { signJwtToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, otp, name, phone, isSignup } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Check OTP
    const { rows: otpRows } = await sql`
      SELECT * FROM otps 
      WHERE email = ${email} AND otp = ${otp} AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC LIMIT 1
    `;

    if (otpRows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // Delete used OTP
    await sql`DELETE FROM otps WHERE email = ${email}`;

    let merchant = null;

    // Check if merchant exists
    const { rows: existingUsers } = await sql`
      SELECT * FROM merchants WHERE email = ${email} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      if (isSignup) {
        return NextResponse.json({ error: 'Account already exists. Please log in.' }, { status: 409 });
      }
      merchant = existingUsers[0];
    } else {
      if (!isSignup) {
        return NextResponse.json({ error: 'Account not found. Please sign up.' }, { status: 404 });
      }
      if (!name || !phone) {
        return NextResponse.json({ error: 'Name and Phone are required for signup.' }, { status: 400 });
      }

      // Create new merchant
      const { rows } = await sql`
        INSERT INTO merchants (shop_name, email, phone_number)
        VALUES (${name}, ${email}, ${phone})
        RETURNING *
      `;
      merchant = rows[0];
    }

    // Create session
    const token = await signJwtToken({ 
      merchantId: merchant.id, 
      email: merchant.email, 
      phone: merchant.phone_number 
    });

    cookies().set({
      name: 'merchant_session_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    cookies().set({
      name: 'merchant_session',
      value: merchant.id.toString(),
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true, merchant: { id: merchant.id, email: merchant.email, name: merchant.shop_name } });

  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
