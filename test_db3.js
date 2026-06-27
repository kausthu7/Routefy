require('dotenv').config();
const { sql } = require('@vercel/postgres');
async function test() {
  try {
    const id = 7907311124;
    const { rows } = await sql`SELECT id FROM merchants WHERE id = ${id}`;
    console.log(`id ${id}: found ${rows.length} rows`);
  } catch (e) {
    console.log("CAUGHT ERROR:", e.message);
  }
}
test();
