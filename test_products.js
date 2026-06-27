require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function test() {
  try {
    const { rows } = await sql`
      INSERT INTO products (merchant_id, name, weight_kg, length_cm, breadth_cm, height_cm)
      VALUES (1, 'Test', 1, 10, 10, 10)
      RETURNING *
    `;
    console.log("Inserted Product:", rows);
  } catch (e) {
    console.error(e.message);
  }
}
test();
