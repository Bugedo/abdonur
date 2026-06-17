import { supabaseAdmin } from '@/lib/supabaseServer';
import { AdminSession } from '@/lib/adminSession';
import { getOperationalBranchIdsForSession } from '@/lib/adminOperationalScope';
import { Branch, Product } from '@/types';

export interface BranchOption {
  id: string;
  slug: string;
  name: string;
}

export async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('name');

  if (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
  return (data ?? []) as Product[];
}

export async function getAllActiveBranchOptions(): Promise<BranchOption[]> {
  const { data } = await supabaseAdmin
    .from('branches')
    .select('id, slug, name')
    .eq('is_active', true)
    .order('name');

  return ((data ?? []) as BranchOption[]).filter((branch) => branch.slug !== 'nueva-cordoba');
}

export async function getBranchOptionsForSession(
  session: AdminSession,
  currentBranch: Branch
): Promise<BranchOption[]> {
  if (session.role === 'super_admin') {
    return getAllActiveBranchOptions();
  }

  const operationalIds = await getOperationalBranchIdsForSession(session);
  const { data } = await supabaseAdmin
    .from('branches')
    .select('id, slug, name')
    .in('id', operationalIds)
    .eq('is_active', true)
    .order('name');

  const options = (data ?? []) as BranchOption[];
  if (options.length > 0) return options;

  return [{ id: currentBranch.id, slug: currentBranch.slug, name: currentBranch.name }];
}
