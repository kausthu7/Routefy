require('dotenv').config();
const { sql } = require('@vercel/postgres');
async function run() {
  try {
    await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`;
    console.log("Added password_hash column");
  } catch(e) {
    console.log("Failed:", e.message);
  }
}
run();
