import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signJwtToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json(); // identifier can be email or phone

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Email/Phone and Password are required.' }, { status: 400 });
    }

    // Find user by email or phone
    const { rows } = await sql`
      SELECT id, email, phone_number, password_hash 
      FROM merchants 
      WHERE email = ${identifier} OR phone_number = ${identifier}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const merchant = rows[0];

    // Check if user has password_hash (might be an old account from OTP days)
    if (!merchant.password_hash) {
      return NextResponse.json({ error: 'Please sign up again to set a password.' }, { status: 401 });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, merchant.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
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

    // Backwards compatibility for frontend check
    cookies().set({
      name: 'merchant_session',
      value: merchant.id.toString(),
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true, merchant: { id: merchant.id, email: merchant.email, phone: merchant.phone_number } });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
