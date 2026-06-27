export interface CourierOption {
  courier_id: string;
  courier_name: string;
  price: number;
  estimated_delivery_days: number;
  aggregator: 'shiprocket' | 'nimbuspost';
}

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

async function getShiprocketToken(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD is not set in .env');
  }

  const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Shiprocket');
  }

  const data = await response.json();
  return data.token;
}

export async function getTopCouriers(
  pickup_pincode: string,
  delivery_pincode: string,
  weight_kg: number,
  is_cod: boolean
): Promise<CourierOption[]> {
  try {
    const token = await getShiprocketToken();
    
    const params = new URLSearchParams({
      pickup_postcode: pickup_pincode,
      delivery_postcode: delivery_pincode,
      weight: weight_kg.toString(),
      cod: is_cod ? '1' : '0'
    });

    const response = await fetch(`${SHIPROCKET_BASE_URL}/courier/serviceability/?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (data.status !== 200 || !data.data || !data.data.available_courier_companies) {
      console.warn('Shiprocket API error or no couriers found:', data);
      throw new Error('No serviceable couriers found');
    }

    const couriers = data.data.available_courier_companies;

    // Sort by cheapest rate
    const sortedCouriers = couriers.sort((a: any, b: any) => a.rate - b.rate);

    // Return all available couriers
    return sortedCouriers.map((c: any) => ({
      courier_id: c.courier_company_id.toString(),
      courier_name: c.courier_name,
      price: c.rate,
      estimated_delivery_days: parseInt(c.estimated_delivery_days || '0', 10),
      aggregator: 'shiprocket' as const
    }));

  } catch (error) {
    console.error('[Shiprocket API]', error);
    throw new Error('Failed to fetch couriers from Shiprocket API. Check credentials.');
  }
}

export async function addPickupLocation(pickupNickname: string, merchantName: string, phone: string, address: string, pincode: string, city: string, state: string) {
  try {
    const token = await getShiprocketToken();
    const email = process.env.SHIPROCKET_EMAIL;

    const payload = {
      pickup_location: pickupNickname, // Dynamic name instead of hardcoded
      name: merchantName || "Routefy Merchant",
      email: email, // Must match the Shiprocket account email
      phone: phone || "9876543210",
      address: address || "Default Address",
      address_2: "",
      city: city || "City",
      state: state || "State",
      country: "India",
      pin_code: pincode || "110001"
    };

    console.log(`[Shiprocket] Adding Pickup Location '${pickupNickname}' for ${merchantName}`);

    const res = await fetch(`${SHIPROCKET_BASE_URL}/settings/company/addpickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log(`[Shiprocket] Add Pickup Response:`, data);
    
    // Sometimes it might return a success or an error if the location already exists
    // We won't throw an error if it fails because it might just mean the location already exists.
    return data;
  } catch (error) {
    console.error('[Shiprocket API Error] Failed to add pickup location', error);
    // Silent fail so we don't crash the profile save
  }
}

export async function createOrderAndGenerateAWB(
  orderId: string,
  courierId: string,
  order: any,
  pickupNickname: string
): Promise<{ tracking_url: string; awb_code: string }> {
  try {
    const token = await getShiprocketToken();

    const orderPayload = {
      order_id: `RTFY_${orderId}_${Date.now()}`,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: pickupNickname || "Primary", // Use the dynamic nickname
      billing_customer_name: order.customer_name || "Customer",
      billing_last_name: "",
      billing_address: order.delivery_address || "Delivery Address",
      billing_city: "City", // Extracted dynamically in a real app, mock for now
      billing_pincode: order.pincode || "110001",
      billing_state: "State", // Extracted dynamically in a real app
      billing_country: "India",
      billing_email: "test@routefy.com",
      billing_phone: order.customer_phone || "9876543210",
      shipping_is_billing: true,
      order_items: [
        {
          name: order.product_name || "Item",
          sku: "ITEM-1",
          units: 1,
          selling_price: order.is_cod ? order.cod_amount : 100,
          discount: 0,
          tax: 0,
          hsn: 4412
        }
      ],
      payment_method: order.is_cod ? "COD" : "Prepaid",
      sub_total: order.is_cod ? order.cod_amount : 100,
      length: parseFloat(order.length_cm) || 10,
      breadth: parseFloat(order.breadth_cm) || 10,
      height: parseFloat(order.height_cm) || 10,
      weight: parseFloat(order.weight_kg) || 1
    };

    console.log(`[Shiprocket] Creating Order ID: ${orderPayload.order_id}`);
    
    // 1. Create Order
    const createRes = await fetch(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderPayload)
    });
    
    const createData = await createRes.json();
    if (!createData.order_id) {
      throw new Error(`Order creation failed: ${JSON.stringify(createData)}`);
    }
    const shiprocketOrderId = createData.order_id;

    console.log(`[Shiprocket] Assigning Courier ${courierId} to Order ${shiprocketOrderId}`);
    
    // 2. Assign AWB
    const awbRes = await fetch(`${SHIPROCKET_BASE_URL}/courier/assign/awb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        shipment_id: createData.shipment_id,
        courier_id: courierId
      })
    });
    const awbData = await awbRes.json();
    
    if (awbData.awb_assign_status !== 1) {
      throw new Error(`AWB Assignment failed: ${JSON.stringify(awbData)}`);
    }

    // 3. Generate Pickup
    console.log(`[Shiprocket] Generating Pickup for Shipment ${createData.shipment_id}`);
    await fetch(`${SHIPROCKET_BASE_URL}/courier/generate/pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        shipment_id: [createData.shipment_id]
      })
    });

    return {
      tracking_url: awbData.response.data.tracking_url || `https://shiprocket.co/tracking/${awbData.response.data.awb_code}`,
      awb_code: awbData.response.data.awb_code
    };

  } catch (error: any) {
    console.error('[Shiprocket API Error]', error);
    throw new Error(error.message || 'Failed to create order and assign AWB via Shiprocket API.');
  }
}
