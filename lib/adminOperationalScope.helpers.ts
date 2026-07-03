export const NUEVA_CORDOBA_SLUG = 'nueva-cordoba';
export const NUEVA_CORDOBA_OPERATOR_SLUG = 'san-vicente';

export type BranchAdminSession = {
  role: 'branch_admin';
  username: string;
  branchId: string;
  branchSlug: string;
};

export type OperationalScopeSession =
  | { role: 'super_admin'; username: 'admin' }
  | BranchAdminSession;

export function getNuevaCordobaOperatorSlug(): string {
  return NUEVA_CORDOBA_OPERATOR_SLUG;
}

export function getMergedOperatorBranchSlugs(): string[] {
  return [NUEVA_CORDOBA_OPERATOR_SLUG, NUEVA_CORDOBA_SLUG];
}

export function isNuevaCordobaMergedOperator(slug: string): boolean {
  return slug === NUEVA_CORDOBA_OPERATOR_SLUG;
}

export function getMergedPanelTitle(operatorName: string): string {
  return `${operatorName} + Nueva Córdoba`;
}

export function canAccessMergedOperatorPanel(
  session: OperationalScopeSession,
  panelSlug: string
): boolean {
  if (session.role === 'super_admin') return true;
  if (!isNuevaCordobaMergedOperator(panelSlug)) return session.branchSlug === panelSlug;
  return (
    session.branchSlug === NUEVA_CORDOBA_OPERATOR_SLUG ||
    session.branchSlug === NUEVA_CORDOBA_SLUG
  );
}

export function resolveOperationalBranchIds(
  session: OperationalScopeSession,
  mergedBranchIds: string[]
): string[] {
  if (session.role === 'super_admin') return [];
  if (session.branchSlug !== NUEVA_CORDOBA_OPERATOR_SLUG) {
    return session.branchId ? [session.branchId] : [];
  }
  return mergedBranchIds.length > 0
    ? mergedBranchIds
    : session.branchId
      ? [session.branchId]
      : [];
}
