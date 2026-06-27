require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function migrate() {
  try {
    await sql`ALTER TABLE orders ADD COLUMN product_name VARCHAR(255);`;
    console.log("Migration successful: added product_name to orders.");
  } catch (e) {
    console.error("Migration failed:", e.message);
  }
}

migrate();
