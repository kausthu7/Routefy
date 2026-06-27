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

    const payload = {
      pickup_location: "RoutefyHQ",
      name: "Kausthu",
      email: email,
      phone: "9876543210",
      address: "123 Main Street",
      address_2: "",
      city: "Kochi",
      state: "Kerala",
      country: "India",
      pin_code: "682001"
    };

    const addRes = await fetch(`${SHIPROCKET_BASE_URL}/settings/company/addpickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const addData = await addRes.json();
    console.log("Response:", addData);

  } catch (e) {
    console.error(e);
  }
}

run();
