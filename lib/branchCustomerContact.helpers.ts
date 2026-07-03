// Slugs mirror lib/adminOperationalScope.helpers.ts (shared operational rule).
const NUEVA_CORDOBA_SLUG = 'nueva-cordoba';
const NUEVA_CORDOBA_OPERATOR_SLUG = 'san-vicente';

type BranchWhatsapp = {
  slug: string;
  whatsapp_number: string;
};

export function routesNuevaCordobaWhatsappToSanVicente(branchSlug: string): boolean {
  return branchSlug === NUEVA_CORDOBA_SLUG;
}

export function resolveCustomerWhatsappNumber(
  branch: BranchWhatsapp,
  operatorBranch: BranchWhatsapp | null
): string {
  if (!routesNuevaCordobaWhatsappToSanVicente(branch.slug)) {
    return branch.whatsapp_number;
  }
  if (operatorBranch?.slug === NUEVA_CORDOBA_OPERATOR_SLUG) {
    return operatorBranch.whatsapp_number;
  }
  return branch.whatsapp_number;
}
