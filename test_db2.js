require('dotenv').config();
const { sql } = require('@vercel/postgres');
async function test() {
  const ids = [1, 4, 5, 14, 18, 27, 30];
  for (const id of ids) {
    const { rows } = await sql`
      SELECT id, shop_name, pickup_pincode, default_product
      FROM merchants
      WHERE id = ${id}
      LIMIT 1
    `;
    console.log(`id ${id}: found ${rows.length} rows`);
  }
}
test();
