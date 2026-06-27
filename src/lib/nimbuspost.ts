export interface CourierOption {
  courier_id: string;
  courier_name: string;
  price: number;
  estimated_delivery_days: number;
  aggregator: 'shiprocket' | 'nimbuspost';
}

const NIMBUS_BASE_URL = 'https://api.nimbuspost.com/v1';

export async function getNimbusCouriers(
  pickup_pincode: string,
  delivery_pincode: string,
  weight_kg: number,
  is_cod: boolean
): Promise<CourierOption[]> {
  try {
    const apiKey = process.env.NIMBUSPOST_API_KEY;
    if (!apiKey) {
      console.warn("NimbusPost API key not found. Skipping Nimbus.");
      return [];
    }

    const payload = {
      origin: pickup_pincode,
      destination: delivery_pincode,
      payment_type: is_cod ? "cod" : "prepaid",
      weight: weight_kg
    };

    // Note: We use Authorization: Bearer, but depending on account type, NimbusPost may require 
    // a different header format (e.g., token in body or 'Token ' prefix).
    // If this fails, the catch block will suppress it and fall back to shiprocket.
    const response = await fetch(`${NIMBUS_BASE_URL}/courier/serviceability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // Using Bearer format for static key, modify if needed
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || !data.data) {
      console.warn(`NimbusPost serviceability failed: ${JSON.stringify(data)}`);
      return [];
    }

    const couriers = data.data; // Usually an array of available couriers in Nimbuspost

    if (!Array.isArray(couriers)) return [];

    return couriers.map((c: any) => ({
      courier_id: String(c.id || c.courier_id || c.name),
      courier_name: c.name || c.courier_name || "NimbusPost Courier",
      price: parseFloat(c.total_charge || c.freight_charge || c.rate || 0),
      estimated_delivery_days: parseInt(c.delivery_time || c.estimated_delivery_days || '3', 10),
      aggregator: 'nimbuspost' as const
    }));

  } catch (error) {
    console.error('[NimbusPost API]', error);
    return [];
  }
}

export async function createNimbusOrderAndAWB(
  orderId: string,
  courierId: string,
  order: any,
  pickupNickname: string
): Promise<{ tracking_url: string; awb_code: string }> {
  try {
    const apiKey = process.env.NIMBUSPOST_API_KEY;
    if (!apiKey) throw new Error('NimbusPost API key missing.');

    const orderPayload = {
      order_number: `RTFY_${orderId}_${Date.now()}`,
      payment_type: order.is_cod ? "cod" : "prepaid",
      amount: order.is_cod ? order.cod_amount : 100,
      consignee: {
        name: order.customer_name || "Customer",
        address: order.delivery_address || "Address",
        city: "City",
        state: "State",
        pincode: order.pincode,
        phone: order.customer_phone
      },
      pickup: {
        warehouse_name: pickupNickname
      },
      products: [
        {
          name: order.product_name || "Item",
          quantity: 1,
          weight: order.weight_kg ? (parseFloat(order.weight_kg) * 1000).toString() : "1000",
          length: order.length_cm ? order.length_cm.toString() : "10",
          breadth: order.breadth_cm ? order.breadth_cm.toString() : "10",
          height: order.height_cm ? order.height_cm.toString() : "10"
        }
      ],
      weight: parseFloat(order.weight_kg) || 1,
      courier_id: courierId // Assuming we can pass it directly to auto-assign
    };

    const res = await fetch(`${NIMBUS_BASE_URL}/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();
    
    if (!data.status) {
      throw new Error(`NimbusPost order failed: ${JSON.stringify(data)}`);
    }

    return {
      tracking_url: data.data.tracking_url || `https://nimbuspost.com/tracking/${data.data.awb_number}`,
      awb_code: data.data.awb_number
    };

  } catch (error: any) {
    console.error('[NimbusPost API Error]', error);
    throw new Error(error.message || 'Failed to create order via NimbusPost API.');
  }
}
