'use server';

import { quoteDeliveryForBranch, type DeliveryQuoteServerResult } from '@/lib/deliveryQuoteServer';

export type DeliveryQuoteResponse = DeliveryQuoteServerResult;

export async function getDeliveryQuote(
  branchId: string,
  destLat: number,
  destLng: number
): Promise<DeliveryQuoteResponse> {
  return quoteDeliveryForBranch(branchId, destLat, destLng);
}
