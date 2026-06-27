require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function migrate() {
  try {
    console.log("Creating products table...");
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER REFERENCES merchants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        weight_kg NUMERIC DEFAULT 1,
        length_cm NUMERIC DEFAULT 10,
        breadth_cm NUMERIC DEFAULT 10,
        height_cm NUMERIC DEFAULT 10,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("Adding dimensions to orders table...");
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS length_cm NUMERIC DEFAULT 10`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS breadth_cm NUMERIC DEFAULT 10`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS height_cm NUMERIC DEFAULT 10`;

    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error.message);
  }
}

migrate();
