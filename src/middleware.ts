import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('merchant_session')?.value;
  
  // A session is only valid if it exists and is a valid number
  const isValidSession = sessionCookie && !isNaN(parseInt(sessionCookie, 10));

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!isValidSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (request.nextUrl.pathname === '/login' && isValidSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
