import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con acceso TOTAL a la DB (bypasea RLS).
// SOLO usar en el servidor (API routes, server components, server actions).
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);





