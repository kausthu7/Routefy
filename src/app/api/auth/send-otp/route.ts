import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const otp = generateOTP();
    // 10 minutes expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Invalidate old OTPs for this email
    await sql`DELETE FROM otps WHERE email = ${email}`;

    // Insert new OTP
    await sql`
      INSERT INTO otps (email, otp, expires_at)
      VALUES (${email}, ${otp}, ${expiresAt})
    `;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Routefy <onboarding@resend.dev>', // Or verified domain
      to: email,
      subject: 'Your Routefy Login Code',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6D4AFF;">Welcome to Routefy</h2>
          <p>Your one-time login code is:</p>
          <h1 style="font-size: 40px; letter-spacing: 4px; color: #1e293b; background: #f8fafc; padding: 20px; text-align: center; border-radius: 12px;">${otp}</h1>
          <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
      `
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: 'Failed to send OTP email. Please check configuration.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
