require('dotenv').config();
const { sql } = require('@vercel/postgres');
async function test() {
  const { rows } = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log(rows);
}
test();
