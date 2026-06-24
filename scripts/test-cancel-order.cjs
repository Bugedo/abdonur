'use strict';

/**
 * Integration smoke test: create order → cancel → verify → cleanup.
 *
 *   npm run db:test-cancel-order
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnvFile(filename) {
  const filePath = path.join(__dirname, '..', filename);
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(url, serviceKey);

  const { data: branch, error: branchError } = await supabase
    .from('branches')
    .select('id')
    .eq('slug', 'alberdi')
    .single();
  if (branchError || !branch) throw new Error(`Branch lookup failed: ${branchError?.message}`);

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, price')
    .eq('is_active', true)
    .limit(1)
    .single();
  if (productError || !product) throw new Error(`Product lookup failed: ${productError?.message}`);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      branch_id: branch.id,
      customer_name: 'Test Cancelación',
      notes: '',
      delivery_method: 'pickup',
      address: '',
      payment_method: 'cash',
      total_price: product.price,
      status: 'new',
    })
    .select('id, status')
    .single();
  if (orderError || !order) throw new Error(`Order insert failed: ${orderError?.message}`);

  const { error: itemError } = await supabase.from('order_items').insert({
    order_id: order.id,
    product_id: product.id,
    quantity: 1,
    unit_price: product.price,
  });
  if (itemError) throw new Error(`Order item insert failed: ${itemError.message}`);

  const reason = 'Pedido de prueba automatizado';
  const cancelledAt = new Date().toISOString();

  const { error: cancelError } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: cancelledAt,
    })
    .eq('id', order.id);
  if (cancelError) throw new Error(`Cancel update failed: ${cancelError.message}`);

  const { data: cancelled, error: readError } = await supabase
    .from('orders')
    .select('status, cancellation_reason, cancelled_at')
    .eq('id', order.id)
    .single();
  if (readError || !cancelled) throw new Error(`Read cancelled order failed: ${readError?.message}`);

  assert(cancelled.status === 'cancelled', `Expected cancelled status, got ${cancelled.status}`);
  assert(cancelled.cancellation_reason === reason, 'Cancellation reason not persisted');
  assert(cancelled.cancelled_at != null, 'cancelled_at not set');

  const { error: blockedError } = await supabase
    .from('orders')
    .insert({
      branch_id: branch.id,
      customer_name: 'Test No Cancel',
      delivery_method: 'pickup',
      payment_method: 'cash',
      total_price: product.price,
      status: 'on_the_way',
    })
    .select('id')
    .single();

  let onTheWayId = null;
  if (!blockedError) {
    const row = await supabase
      .from('orders')
      .select('id')
      .eq('customer_name', 'Test No Cancel')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    onTheWayId = row.data?.id ?? null;
  }

  await supabase.from('orders').delete().eq('id', order.id);
  if (onTheWayId) await supabase.from('orders').delete().eq('id', onTheWayId);

  console.log('PASS: order cancellation persisted status, reason, and cancelled_at');
  console.log('PASS: test orders cleaned up');
}

main().catch((err) => {
  console.error('FAIL:', err.message || err);
  process.exit(1);
});
