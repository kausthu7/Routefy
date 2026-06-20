import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Generate a mock 6-digit OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // In a real app, we would store this OTP in a database or Redis with an expiration time
    // For MVP, we will store the correct OTP in a secure, HTTP-only cookie to verify later
    cookies().set('mock_otp_storage', mockOtp, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5 minutes
      path: '/',
    });

    // We return the OTP in the response solely for the "Zero-Interface" MVP local testing
    return NextResponse.json({ 
      success: true, 
      message: 'OTP generated', 
      otp: mockOtp 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
