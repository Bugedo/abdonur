import type { CartItem, PaymentMethod } from '@/types';

function stripPresentationFromFlavorName(name: string): string {
  return name
    .replace(/\s+por\s+unidad$/i, '')
    .replace(/\s+x\s+unidad$/i, '')
    .trim();
}

function formatComboDetailPart(part: string): string {
  const trimmed = part.trim();
  if (!trimmed) return trimmed;
  const match = trimmed.match(/^(\d+x)\s+(.+)$/i);
  if (!match) return stripPresentationFromFlavorName(trimmed);
  return `${match[1]} ${stripPresentationFromFlavorName(match[2])}`;
}

export interface WhatsappOrderMessageInput {
  branchName: string;
  orderId: string;
  customerName: string;
  items: CartItem[];
  formattedTotal: string;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryLabel: string;
  address: string;
  paymentMethod: PaymentMethod;
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
  );

  if (input.deliveryMethod === 'delivery') {
    lines.push(
      'Al total se suma el costo de envío.',
      'El local confirmará el precio del delivery por WhatsApp.',
    );
  }

  lines.push(
    '────────────────',
    '',
    'ENTREGA',
    `Modo: ${input.deliveryLabel}`,
  );

  if (input.deliveryMethod === 'delivery') {
    lines.push(`Dirección: ${input.address.trim()}`);
  }

  lines.push('', 'PAGO', input.paymentLabel);

  if (input.paymentMethod === 'transfer') {
    lines.push('Antes de transferir, esperá la confirmación del local.');
  }

  if (input.notes.trim()) {
    lines.push('', 'OBSERVACIONES', input.notes.trim());
  }

  return lines.join('\n');
}
