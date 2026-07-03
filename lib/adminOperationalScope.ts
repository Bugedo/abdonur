import type { AdminSession } from '@/lib/adminSession';
import { supabaseAdmin } from '@/lib/supabaseServer';
import {
  canAccessMergedOperatorPanel,
  getMergedOperatorBranchSlugs,
  getMergedPanelTitle,
  getNuevaCordobaOperatorSlug,
  isNuevaCordobaMergedOperator,
  NUEVA_CORDOBA_OPERATOR_SLUG,
  NUEVA_CORDOBA_SLUG,
  resolveOperationalBranchIds,
} from '@/lib/adminOperationalScope.helpers';

export {
  canAccessMergedOperatorPanel,
  getMergedOperatorBranchSlugs,
  getMergedPanelTitle,
  getNuevaCordobaOperatorSlug,
  isNuevaCordobaMergedOperator,
  NUEVA_CORDOBA_OPERATOR_SLUG,
  NUEVA_CORDOBA_SLUG,
};

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
  if (session.role === 'super_admin') {
    return resolveOperationalBranchIds(session, []);
  }

  const mergedBranchIds =
    session.branchSlug === NUEVA_CORDOBA_OPERATOR_SLUG
      ? (await getBranchIdsBySlugs(getMergedOperatorBranchSlugs())).map((row) => row.id)
      : [];

  return resolveOperationalBranchIds(session, mergedBranchIds);
}

export async function getMergedOperatorBranchIds(): Promise<string[]> {
  const rows = await getBranchIdsBySlugs(getMergedOperatorBranchSlugs());
  return rows.map((row) => row.id);
}

export async function canOperateOrderBranch(session: AdminSession, targetBranchId: string): Promise<boolean> {
  if (session.role === 'super_admin') return true;
  const operationalIds = await getOperationalBranchIdsForSession(session);
  return operationalIds.includes(targetBranchId);
}
