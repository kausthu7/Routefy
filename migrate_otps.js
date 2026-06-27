require('dotenv').config();
const { sql } = require('@vercel/postgres');
async function run() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Created otps table");
  } catch(e) {
    console.log("Failed:", e.message);
  }
}
run();
