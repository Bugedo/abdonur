import { Branch } from '@/types';
import {
  resolveCustomerWhatsappNumber,
  routesNuevaCordobaWhatsappToSanVicente,
} from '@/lib/branchCustomerContact.helpers';

export { resolveCustomerWhatsappNumber, routesNuevaCordobaWhatsappToSanVicente };

export function withCustomerWhatsappNumber(
  branch: Branch,
  operatorBranch: Branch | null
): Branch {
  return {
    ...branch,
    whatsapp_number: resolveCustomerWhatsappNumber(branch, operatorBranch),
  };
}
