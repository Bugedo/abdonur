'use strict';

/**
 * Borra todos los pedidos de prueba (orders + order_items por CASCADE).
 *
 *   npm run db:clear-orders
 *
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
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

async function main() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  const { count: ordersBefore, error: countError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
  if (countError) throw countError;

  const { count: itemsBefore, error: itemsCountError } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true });
  if (itemsCountError) throw itemsCountError;

  console.log(`Pedidos actuales: ${ordersBefore ?? 0}`);
  console.log(`Ítems actuales: ${itemsBefore ?? 0}`);

  if (!ordersBefore) {
    console.log('No hay pedidos para borrar.');
    return;
  }

  const { error: deleteError } = await supabase
    .from('orders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) throw deleteError;

  const { count: ordersAfter } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
  const { count: itemsAfter } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true });

  console.log(`Listo. Pedidos: ${ordersAfter ?? 0}, ítems: ${itemsAfter ?? 0}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
