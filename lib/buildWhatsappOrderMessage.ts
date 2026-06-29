import { formatComboDetailPart } from '../lib/empanadaMenu.ts';
import type { CartItem } from '../types/index.ts';

export interface WhatsappOrderMessageInput {
  branchName: string;
  orderId: string;
  customerName: string;
  items: CartItem[];
  formattedTotal: string;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryLabel: string;
  address: string;
  paymentLabel: string;
  notes: string;
}

export function formatWhatsappOrderItemLines(item: CartItem): string[] {
  const lineTotal = (item.unitPrice ?? item.product.price) * item.quantity;
  const formattedPrice = lineTotal.toLocaleString('es-AR');

  if (item.comboDetail?.trim()) {
    const lines = [`${item.quantity}x ${item.product.name} — $${formattedPrice}`];
    for (const part of item.comboDetail.split(', ')) {
      const trimmed = part.trim();
      if (trimmed) lines.push(`   ${formatComboDetailPart(trimmed)}`);
    }
    return lines;
  }

  return [`${item.quantity}x ${item.displayName ?? item.product.name} — $${formattedPrice}`];
}

export function buildWhatsappOrderMessage(input: WhatsappOrderMessageInput): string {
  const lines: string[] = [
    `*NUEVO PEDIDO — ${input.branchName}*`,
    '',
    `Pedido: #${input.orderId.slice(0, 8).toUpperCase()}`,
    `Cliente: ${input.customerName.trim()}`,
    '',
    '────────────────',
    'PRODUCTOS',
    '────────────────',
    '',
  ];

  input.items.forEach((item, index) => {
    lines.push(...formatWhatsappOrderItemLines(item));
    if (index < input.items.length - 1) lines.push('');
  });

  lines.push(
    '',
    '────────────────',
    `*TOTAL: ${input.formattedTotal}*`,
    '────────────────',
    '',
    'ENTREGA',
    `Modo: ${input.deliveryLabel}`,
  );

  if (input.deliveryMethod === 'delivery') {
    lines.push(`Dirección: ${input.address.trim()}`);
  }

  lines.push('', 'PAGO', input.paymentLabel);

  if (input.notes.trim()) {
    lines.push('', 'OBSERVACIONES', input.notes.trim());
  }

  return lines.join('\n');
}
