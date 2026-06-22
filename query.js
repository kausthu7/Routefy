const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_PuvjC4zeJ1rV@ep-still-moon-aobg97u7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
});
client.connect().then(async () => {
  const res = await client.query('SELECT * FROM merchants');
  console.log('MERCHANTS:');
  console.log(JSON.stringify(res.rows, null, 2));
  client.end();
}).catch(console.error);
