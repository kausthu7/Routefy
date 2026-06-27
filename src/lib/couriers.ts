import { getTopCouriers as getShiprocketCouriers, CourierOption } from './shiprocket';
import { getNimbusCouriers } from './nimbuspost';

export async function getAggregatedCouriers(
  pickup_pincode: string,
  delivery_pincode: string,
  weight_kg: number,
  is_cod: boolean
): Promise<CourierOption[]> {
  // Fetch from both aggregators simultaneously
  const results = await Promise.allSettled([
    getShiprocketCouriers(pickup_pincode, delivery_pincode, weight_kg, is_cod),
    getNimbusCouriers(pickup_pincode, delivery_pincode, weight_kg, is_cod)
  ]);

  let combinedCouriers: CourierOption[] = [];

  // Parse Shiprocket
  if (results[0].status === 'fulfilled') {
    const shiprocketCouriers = results[0].value.map(c => ({
      ...c,
      courier_id: `s_${c.courier_id}`
    }));
    combinedCouriers = combinedCouriers.concat(shiprocketCouriers);
  } else {
    console.error('[Aggregator] Shiprocket failed:', results[0].reason);
  }

  // Parse NimbusPost
  if (results[1].status === 'fulfilled') {
    const nimbusCouriers = results[1].value.map(c => ({
      ...c,
      courier_id: `n_${c.courier_id}`
    }));
    combinedCouriers = combinedCouriers.concat(nimbusCouriers);
  } else {
    console.error('[Aggregator] NimbusPost failed:', results[1].reason);
  }

  // If both failed completely, throw an error
  if (combinedCouriers.length === 0) {
    throw new Error('No serviceable couriers found across any aggregators');
  }

  // Sort by price (cheapest first)
  combinedCouriers.sort((a, b) => a.price - b.price);

  // Return all cheapest overall without slicing
  return combinedCouriers;
}

export async function bookCourier(
  orderId: string,
  prefixedCourierId: string,
  order: any,
  pickupNickname: string
): Promise<{ tracking_url: string; awb_code: string }> {
  if (prefixedCourierId.startsWith('s_')) {
    const { createOrderAndGenerateAWB } = await import('./shiprocket');
    return createOrderAndGenerateAWB(orderId, prefixedCourierId.slice(2), order, pickupNickname);
  } else if (prefixedCourierId.startsWith('n_')) {
    const { createNimbusOrderAndAWB } = await import('./nimbuspost');
    return createNimbusOrderAndAWB(orderId, prefixedCourierId.slice(2), order, pickupNickname);
  } else {
    // Fallback if no prefix exists (for backwards compatibility with older stored IDs)
    const { createOrderAndGenerateAWB } = await import('./shiprocket');
    return createOrderAndGenerateAWB(orderId, prefixedCourierId, order, pickupNickname);
  }
}
