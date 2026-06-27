import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  cookies().set('merchant_session_token', '', { maxAge: 0, path: '/' });
  cookies().set('merchant_session', '', { maxAge: 0, path: '/' });
  
  // also try delete
  cookies().delete({ name: 'merchant_session_token', path: '/' });
  cookies().delete({ name: 'merchant_session', path: '/' });
  return NextResponse.json({ success: true });
}
