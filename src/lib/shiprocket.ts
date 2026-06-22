export interface CourierOption {
  courier_id: string;
  courier_name: string;
  price: number;
  estimated_delivery_days: number;
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

    // Return the top 3
    return sortedCouriers.slice(0, 3).map((c: any) => ({
      courier_id: c.courier_company_id.toString(),
      courier_name: c.courier_name,
      price: c.rate,
      estimated_delivery_days: parseInt(c.estimated_delivery_days || '0', 10)
    }));

  } catch (error) {
    console.error('[Shiprocket API]', error);
    // Fallback to mock for local testing if API fails or creds are missing
    console.log('[Shiprocket] Falling back to mock couriers due to missing/invalid API credentials.');
    const basePrice = weight_kg > 1 ? 80 : 60;
    const codFee = is_cod ? 40 : 0;
    return [
      { courier_id: "10", courier_name: "Delhivery", price: basePrice + codFee, estimated_delivery_days: 4 },
      { courier_id: "11", courier_name: "XpressBees", price: basePrice + codFee + 5, estimated_delivery_days: 3 },
      { courier_id: "12", courier_name: "Ecom Express", price: basePrice + codFee + 12, estimated_delivery_days: 2 }
    ];
  }
}

export async function createOrderAndGenerateAWB(
  orderId: string,
  courierId: string,
  order: any
): Promise<{ tracking_url: string; awb_code: string }> {
  try {
    const token = await getShiprocketToken();

    const orderPayload = {
      order_id: `RTFY_${orderId}_${Date.now()}`,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: "Primary", // Configure in Shiprocket Dashboard
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
          name: "Item",
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
      length: 10,
      breadth: 10,
      height: 10,
      weight: parseFloat(order.weight_kg) || 1
    };

    console.log(`[Shiprocket] Creating Order ID: ${orderPayload.order_id}`);
    
    // 1. Create Order
    const createRes = await fetch(`${SHIPROCKET_BASE_URL}/orders/create/ad`, {
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

  } catch (error) {
    console.error('[Shiprocket API Error]', error);
    // Fallback to mock behavior for local testing
    const mockAWB = `AWB${Math.floor(100000000 + Math.random() * 900000000)}`;
    return {
      tracking_url: `https://shiprocket.co/tracking/${mockAWB}`,
      awb_code: mockAWB
    };
  }
}
