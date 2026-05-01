'use strict';

/**
 * Aplica la migración 011 (coords sucursales + delivery_fee en pedidos).
 *
 * Obtener URI: Supabase Dashboard → Project Settings → Database → Connection string (Postgres).
 *
 *   DATABASE_URL='postgresql://...' npm run db:apply-delivery-migration
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url || !/^postgres(ql)?:\/\//i.test(url)) {
    console.error(
      'Definí DATABASE_URL con la cadena Postgres del proyecto.'
    );
    process.exit(1);
  }

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '011_delivery_distance_pricing.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log('Migración 011 aplicada correctamente.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
