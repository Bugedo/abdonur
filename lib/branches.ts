import { Branch } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseServer';

function resolveLookupColumn(idOrSlug: string): 'id' | 'slug' {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  return isUuid ? 'id' : 'slug';
}

export async function getActiveBranchByIdOrSlug(idOrSlug: string): Promise<Branch | null> {
  const column = resolveLookupColumn(idOrSlug);
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq(column, idOrSlug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as Branch;
}

export async function getBranchByIdOrSlugAdmin(idOrSlug: string): Promise<Branch | null> {
  const column = resolveLookupColumn(idOrSlug);
  const { data } = await supabaseAdmin
    .from('branches')
    .select('*')
    .eq(column, idOrSlug)
    .single();

  return (data as Branch | null) ?? null;
}
