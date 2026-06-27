import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  let text = strings[0];
  for (let i = 1; i < strings.length; i++) {
    text += '$' + i + strings[i];
  }
  return pool.query(text, values);
}

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS merchants (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        phone_number VARCHAR(20) UNIQUE,
        shop_name VARCHAR(255),
        password_hash VARCHAR(255),
        pickup_address TEXT,
        pickup_pincode VARCHAR(10),
        default_product TEXT,
        telegram_chat_id VARCHAR(50),
        wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Migration for existing table
    try {
      await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;`;
      await sql`ALTER TABLE merchants ALTER COLUMN phone_number DROP NOT NULL;`;
      await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);`;
      await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS pickup_address TEXT;`;
      await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS pickup_pincode VARCHAR(10);`;
      await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS default_product TEXT;`;
      await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(50);`;
      await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10, 2) DEFAULT 0.00;`;
      
      // Add indexes for authentication queries
      await sql`CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_merchants_phone ON merchants(phone_number);`;
    } catch (e) {
      console.warn("Migration notice:", e);
    }

    await sql`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER REFERENCES merchants(id),
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'recharge' or 'shipping_deduction'
        reference_id VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER REFERENCES merchants(id),
        customer_name VARCHAR(255),
        customer_phone VARCHAR(20),
        delivery_address TEXT,
        pincode VARCHAR(10),
        is_cod BOOLEAN DEFAULT FALSE,
        cod_amount DECIMAL(10, 2),
        weight_kg DECIMAL(5, 2),
        price DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'pending',
        awb_code VARCHAR(100),
        tracking_url TEXT,
        courier_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Migration for existing orders table
    try {
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_code VARCHAR(100);`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name VARCHAR(255);`;
    } catch (e) {
      console.warn("Orders Migration notice:", e);
    }

    await sql`
      CREATE TABLE IF NOT EXISTS ai_messages (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER REFERENCES merchants(id),
        sender VARCHAR(50) NOT NULL,
        text_content TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
}

