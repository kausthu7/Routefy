import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!TELEGRAM_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is missing in .env" }, { status: 400 });
  }

  // Use the host of the current request as the base URL for the webhook
  const url = new URL(request.url);
  const webhookUrl = `${url.protocol}//${url.host}/api/telegram/webhook`;

  const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${webhookUrl}`;

  try {
    const res = await fetch(telegramApiUrl);
    const data = await res.json();
    return NextResponse.json({
      success: true,
      webhookUrl: webhookUrl,
      telegramResponse: data
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
