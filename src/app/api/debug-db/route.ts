import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM merchants`;
    return NextResponse.json({ success: true, merchants: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}
