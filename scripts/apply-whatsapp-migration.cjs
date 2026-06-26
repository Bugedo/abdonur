'use strict';

/**
 * Update branch mobile WhatsApp numbers via Supabase API.
 *
 *   npm run db:apply-whatsapp-migration
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BRANCH_NUMBERS = {
  'san-vicente': '5493517061970',
  'alta-cordoba': '5493517619358',
  'nueva-cordoba': '5493517619358',
  alberdi: '5493512052055',
  marques: '5493512404046',
  pueyrredon: '5493518176818',
};

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
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  for (const [slug, whatsapp_number] of Object.entries(BRANCH_NUMBERS)) {
    const { error } = await supabase.from('branches').update({ whatsapp_number }).eq('slug', slug);
    if (error) throw new Error(`${slug}: ${error.message}`);
    console.log(`  ${slug}: ${whatsapp_number}`);
  }

  const { data, error } = await supabase
    .from('branches')
    .select('slug, whatsapp_number')
    .order('slug');
  if (error) throw error;

  console.log('\nSupabase verification:');
  for (const row of data) {
    console.log(`  ${row.slug}: ${row.whatsapp_number}`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
