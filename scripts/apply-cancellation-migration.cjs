'use strict';

/**
 * Apply migration 013 (cancellation_reason, cancelled_at, status CHECK).
 *
 * Preferred (linked project):
 *   supabase db push --linked
 *
 * Alternative (direct Postgres):
 *   DATABASE_URL='postgresql://...' node scripts/apply-cancellation-migration.cjs
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

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

  const url = process.env.DATABASE_URL;
  if (!url || !/^postgres(ql)?:\/\//i.test(url)) {
    console.error('Set DATABASE_URL to the project Postgres connection string.');
    process.exit(1);
  }

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '013_order_cancellation.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log('Migration 013 applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
