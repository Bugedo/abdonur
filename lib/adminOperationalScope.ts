import { AdminSession } from '@/lib/adminSession';
import { supabaseAdmin } from '@/lib/supabaseServer';

async function getBranchIdsBySlugs(slugs: string[]) {
  const { data, error } = await supabaseAdmin
    .from('branches')
    .select('id, slug')
    .in('slug', slugs)
    .eq('is_active', true);

  if (error || !data) return [] as { id: string; slug: string }[];
  return data as { id: string; slug: string }[];
}

export async function getOperationalBranchIdsForSession(session: AdminSession): Promise<string[]> {
  if (session.role === 'super_admin') return [];
  if (session.branchSlug !== 'alta-cordoba') {
    return [session.branchId];
  }

  const rows = await getBranchIdsBySlugs(['alta-cordoba', 'nueva-cordoba']);
  const ids = rows.map((row) => row.id);
  return ids.length > 0 ? ids : [session.branchId];
}

export async function canOperateOrderBranch(session: AdminSession, targetBranchId: string): Promise<boolean> {
  if (session.role === 'super_admin') return true;
  const operationalIds = await getOperationalBranchIdsForSession(session);
  return operationalIds.includes(targetBranchId);
}
