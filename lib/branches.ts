import { Branch } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { NUEVA_CORDOBA_OPERATOR_SLUG, NUEVA_CORDOBA_SLUG } from '@/lib/adminOperationalScope.helpers';
import { withCustomerWhatsappNumber } from '@/lib/branchCustomerContact';

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

/** Customer-facing branch data; Nueva Córdoba WhatsApp routes to San Vicente. */
export async function getCustomerFacingBranch(idOrSlug: string): Promise<Branch | null> {
  const branch = await getActiveBranchByIdOrSlug(idOrSlug);
  if (!branch || branch.slug !== NUEVA_CORDOBA_SLUG) {
    return branch;
  }

  const operator = await getActiveBranchByIdOrSlug(NUEVA_CORDOBA_OPERATOR_SLUG);
  return withCustomerWhatsappNumber(branch, operator);
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
