'use strict';

/**
 * Apply migration 014: deactivate retired empanada products via Supabase API.
 *
 *   npm run db:apply-deactivate-empanada-products
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const EXACT_RETIRED_NAMES = [
  '2 Docenas de Árabes',
  '2 Docenas de Jamón y Queso',
  '2 Docenas de Cebolla y Queso',
  '2 Docenas de Bondiola al Disco',
  'Dos Docenas de Árabes',
  'Dos Docenas de Jamón y Queso',
  'Dos Docenas de Cebolla y Queso',
  'Dos Docenas de Bondiola al Disco',
  'Armá tu x8',
  'Arma tu x8 de empanadas',
  'Arma tu x6 de empanadas',
  'Arma tu x6',
];

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

function normalizeName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isRetiredEmpanadaProduct(name) {
  if (EXACT_RETIRED_NAMES.includes(name)) return true;
  const normalized = normalizeName(name);
  return (
    normalized.includes('2 docenas') ||
    normalized.includes('dos docenas') ||
    normalized.includes('arma tu x8') ||
    normalized.includes('arma tu x6')
  );
}

async function main() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  const { data: activeEmpanadas, error: fetchError } = await supabase
    .from('products')
    .select('id, name')
    .eq('category', 'empanadas')
    .eq('is_active', true);

  if (fetchError) throw fetchError;

  const toDeactivate = (activeEmpanadas ?? []).filter((row) => isRetiredEmpanadaProduct(row.name));
  if (toDeactivate.length === 0) {
    console.log('No active retired empanada products found (migration already applied?).');
    return;
  }

  const ids = toDeactivate.map((row) => row.id);
  const { error: updateError } = await supabase.from('products').update({ is_active: false }).in('id', ids);
  if (updateError) throw updateError;

  console.log(`Deactivated ${toDeactivate.length} product(s):`);
  for (const row of toDeactivate.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  - ${row.name}`);
  }

  const { data: stillActive, error: verifyError } = await supabase
    .from('products')
    .select('name')
    .eq('category', 'empanadas')
    .eq('is_active', true)
    .or(
      'name.ilike.%2 docenas%,name.ilike.%dos docenas%,name.ilike.%arma tu x8%,name.ilike.%arma tu x6%'
    );

  if (verifyError) throw verifyError;
  if ((stillActive ?? []).length > 0) {
    console.warn('\nWarning: some retired-pattern products are still active:');
    for (const row of stillActive) console.warn(`  - ${row.name}`);
    process.exit(1);
  }

  console.log('\nVerification OK: no active 2-docena or x8/x6 empanada products remain.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
