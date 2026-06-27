require('dotenv').config();
const { sql } = require('@vercel/postgres');
async function run() {
  try {
    const { rows } = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'merchants'`;
    console.log(rows.map(r => r.column_name));
  } catch(e) {
    console.log(e.message);
  }
}
run();
