import { supabaseAdmin } from '@/lib/supabaseServer';
import { haversineKm, quoteDelivery, isRoughlyCordobaRegion } from '@/lib/deliveryPricing';

export type DeliveryQuoteServerResult =
  | { ok: true; distanceKm: number; feeARS: number }
  | { ok: false; error: string };

export async function quoteDeliveryForBranch(
  branchId: string,
  destLat: number,
  destLng: number
): Promise<DeliveryQuoteServerResult> {
  if (!Number.isFinite(destLat) || !Number.isFinite(destLng)) {
    return { ok: false, error: 'Coordenadas inválidas.' };
  }

  if (!isRoughlyCordobaRegion(destLat, destLng)) {
    return { ok: false, error: 'La ubicación debe estar en la zona de Córdoba.' };
  }

  const { data: branch, error } = await supabaseAdmin
    .from('branches')
    .select('latitude, longitude')
    .eq('id', branchId)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !branch || branch.latitude == null || branch.longitude == null) {
    return { ok: false, error: 'Envío no disponible para esta sucursal.' };
  }

  const originLat = Number(branch.latitude);
  const originLng = Number(branch.longitude);
  if (!Number.isFinite(originLat) || !Number.isFinite(originLng)) {
    return { ok: false, error: 'Envío no disponible para esta sucursal.' };
  }

  const km = haversineKm(originLat, originLng, destLat, destLng);
  const tier = quoteDelivery(km);

  if (!tier.ok) {
    return {
      ok: false,
      error: `Tu dirección está a ${tier.distanceKm.toFixed(1)} km del local (máximo 5 km).`,
    };
  }

  return { ok: true, distanceKm: tier.distanceKm, feeARS: tier.feeARS };
}
