import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development mode' }, { status: 403 });
  }

  await initializeDatabase();
  return NextResponse.json({ success: true, message: 'Vercel Postgres tables initialized successfully!' });
}
