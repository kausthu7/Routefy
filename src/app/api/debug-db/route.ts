import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { rows: merchants } = await sql`SELECT * FROM merchants`;
    const { rows: ai_messages } = await sql`SELECT * FROM ai_messages ORDER BY created_at DESC LIMIT 10`;
    return NextResponse.json({ 
      success: true, 
      postgresUrl: process.env.POSTGRES_URL,
      whatsappToken: process.env.WHATSAPP_TOKEN,
      merchants, 
      ai_messages 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}
