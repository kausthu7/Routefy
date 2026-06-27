import dotenv from 'dotenv';
dotenv.config();

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

async function run() {
  try {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    const authRes = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const authData = await authRes.json();
    const token = authData.token;

    console.log("Token received.");

    const balRes = await fetch(`${SHIPROCKET_BASE_URL}/account/details`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const balData = await balRes.json();
    console.log("Wallet Balance:", balData);

  } catch (e) {
    console.error(e);
  }
}

run();
