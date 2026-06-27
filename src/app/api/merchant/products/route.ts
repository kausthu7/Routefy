import { getSessionMerchantId } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const merchantIdCookie = await getSessionMerchantId();
  if (!merchantIdCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const merchantId = Number(merchantIdCookie);
  if (isNaN(merchantId)) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  try {
    const { rows } = await sql`SELECT * FROM products WHERE merchant_id = ${merchantId} ORDER BY created_at ASC`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const merchantIdCookie = await getSessionMerchantId();
  if (!merchantIdCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const merchantId = Number(merchantIdCookie);
  if (isNaN(merchantId)) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, weight_kg, length_cm, breadth_cm, height_cm } = body;

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const { rows } = await sql`
      INSERT INTO products (merchant_id, name, weight_kg, length_cm, breadth_cm, height_cm)
      VALUES (${merchantId}, ${name}, ${weight_kg || 1}, ${length_cm || 10}, ${breadth_cm || 10}, ${height_cm || 10})
      RETURNING *
    `;

    return NextResponse.json({ success: true, product: rows[0] });
  } catch (error) {
    console.error("Add product error:", error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const merchantIdCookie = await getSessionMerchantId();
  if (!merchantIdCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const merchantId = Number(merchantIdCookie);
  if (isNaN(merchantId)) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    await sql`DELETE FROM products WHERE id = ${productId} AND merchant_id = ${merchantId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
