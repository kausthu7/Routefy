import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signJwtToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Check if user already exists
    const { rows: existingUsers } = await sql`
      SELECT id FROM merchants WHERE email = ${email} OR phone_number = ${phone} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'An account with this email or phone number already exists.' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert new merchant
    const { rows } = await sql`
      INSERT INTO merchants (shop_name, email, phone_number, password_hash)
      VALUES (${name}, ${email}, ${phone}, ${passwordHash})
      RETURNING id, shop_name, email, phone_number
    `;

    const newMerchant = rows[0];

    // Create session
    const token = await signJwtToken({ 
      merchantId: newMerchant.id, 
      email: newMerchant.email, 
      phone: newMerchant.phone_number 
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
      value: newMerchant.id.toString(),
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true, merchant: newMerchant });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
