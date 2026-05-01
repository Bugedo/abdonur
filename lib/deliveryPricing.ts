/** Distancia geodésica (km), no km de calle */

const EARTH_RADIUS_KM = 6371;

export const DELIVERY_MAX_KM = 5;
export const DELIVERY_NEAR_KM = 3;
export const DELIVERY_FEE_NEAR_ARS = 3000;
export const DELIVERY_FEE_MID_ARS = 5000;

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 1000) / 1000;
}

export type DeliveryQuoteResult =
  | { ok: true; distanceKm: number; feeARS: number }
  | { ok: false; code: 'OUT_OF_RANGE'; distanceKm: number };

export function quoteDelivery(distanceKm: number): DeliveryQuoteResult {
  if (distanceKm <= DELIVERY_NEAR_KM) {
    return { ok: true, distanceKm, feeARS: DELIVERY_FEE_NEAR_ARS };
  }
  if (distanceKm <= DELIVERY_MAX_KM) {
    return { ok: true, distanceKm, feeARS: DELIVERY_FEE_MID_ARS };
  }
  return { ok: false, code: 'OUT_OF_RANGE', distanceKm };
}

export function isRoughlyCordobaRegion(lat: number, lng: number): boolean {
  return lat >= -31.65 && lat <= -31.25 && lng >= -64.4 && lng <= -63.9;
}
