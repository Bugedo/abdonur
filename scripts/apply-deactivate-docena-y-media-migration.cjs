'use strict';

/**
 * Apply migration 015: deactivate docena y media empanada products via Supabase API.
 *
 *   npm run db:apply-deactivate-docena-y-media
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const EXACT_RETIRED_NAMES = [
  '1 Docena y Media de Árabes',
  '1 Docena y Media de Jamón y Queso',
  '1 Docena y Media de Cebolla y Queso',
  '1 Docena y Media de Bondiola al Disco',
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

function isDocenaYMediaProduct(name) {
  if (EXACT_RETIRED_NAMES.includes(name)) return true;
  const normalized = normalizeName(name);
  return normalized.includes('docena y media') || normalized.includes('media docena');
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

  const toDeactivate = (activeEmpanadas ?? []).filter((row) => isDocenaYMediaProduct(row.name));
  if (toDeactivate.length === 0) {
    console.log('No active docena y media empanada products found (migration already applied?).');
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
    .or('name.ilike.%docena y media%,name.ilike.%media docena%');

  if (verifyError) throw verifyError;
  if ((stillActive ?? []).length > 0) {
    console.warn('\nWarning: some docena y media products are still active:');
    for (const row of stillActive) console.warn(`  - ${row.name}`);
    process.exit(1);
  }

  console.log('\nVerification OK: no active docena y media empanada products remain.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
