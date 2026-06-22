const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_u1kH2oPdsTjZ@ep-noisy-thunder-a8w988d5-pooler.eastus2.azure.neon.tech/neondb?sslmode=require' });
pool.query('SELECT * FROM orders').then(res => { console.log(res.rows); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });
