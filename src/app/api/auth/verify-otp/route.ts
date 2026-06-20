import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client';

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

    // OTP verified successfully.
    // Ensure merchant exists in Supabase
    const { data: existingMerchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('phone_number', phone)
      .single();

    if (!existingMerchant) {
      await supabase.from('merchants').insert([{ phone_number: phone, shop_name: name || null }]);
    } else if (name) {
      // Optional: Update name if they enter a new one during login
      await supabase.from('merchants').update({ shop_name: name }).eq('phone_number', phone);
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
