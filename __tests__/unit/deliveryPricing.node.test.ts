import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DELIVERY_NEAR_KM,
  DELIVERY_MAX_KM,
  DELIVERY_FEE_NEAR_ARS,
  DELIVERY_FEE_MID_ARS,
  haversineKm,
  quoteDelivery,
  isRoughlyCordobaRegion,
} from '../../lib/deliveryPricing.ts';

test('haversineKm same point zero', () => {
  assert.equal(haversineKm(-31.42, -64.18, -31.42, -64.18), 0);
});

test('haversineKm symmetric', () => {
  const d = haversineKm(-31.42, -64.18, -31.43, -64.19);
  assert.ok(Math.abs(haversineKm(-31.43, -64.19, -31.42, -64.18) - d) < 1e-9);
});

test('quoteDelivery tiers', () => {
  const near = quoteDelivery(DELIVERY_NEAR_KM - 0.001);
  assert.equal(near.ok, true);
  assert.equal(near.ok ? near.feeARS : null, DELIVERY_FEE_NEAR_ARS);

  const mid = quoteDelivery((DELIVERY_NEAR_KM + DELIVERY_MAX_KM) / 2);
  assert.equal(mid.ok, true);
  assert.equal(mid.ok ? mid.feeARS : null, DELIVERY_FEE_MID_ARS);

  const far = quoteDelivery(DELIVERY_MAX_KM + 1);
  assert.equal(far.ok, false);
});

test('Cordoba bbox', () => {
  assert.equal(isRoughlyCordobaRegion(-31.42, -64.18), true);
  assert.equal(isRoughlyCordobaRegion(-34.9, -57.95), false);
});
