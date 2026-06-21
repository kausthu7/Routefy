import { sql } from '@vercel/postgres';

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS merchants (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        shop_name VARCHAR(255),
        pickup_address TEXT,
        pickup_pincode VARCHAR(10),
        default_product TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Migration for existing table
    try {
      await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS pickup_address TEXT;`;
      await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS default_product TEXT;`;
    } catch (e) {
      console.warn("Migration notice:", e);
    }

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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

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

// Re-export sql for convenience
export { sql };
