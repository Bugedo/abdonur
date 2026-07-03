import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsappOrderMessage,
  formatWhatsappOrderItemLines,
} from '../../lib/buildWhatsappOrderMessage.ts';
import type { CartItem, Product } from '../../types/index.ts';

const baseProduct: Product = {
  id: 'p1',
  name: 'Armá tu Docena',
  description: '',
  price: 24000,
  category: 'empanadas',
  image_url: '',
  is_active: true,
};

const flavorProduct: Product = {
  id: 'p2',
  name: 'FATAY - Árabes',
  description: '',
  price: 2000,
  category: 'empanadas',
  image_url: '',
  is_active: true,
};

test('formatWhatsappOrderItemLines expands combo flavors on separate lines', () => {
  const item: CartItem = {
    product: baseProduct,
    quantity: 1,
    comboDetail: '4x FATAY - Árabes, 8x SFIHAS - jamón y queso',
  };
  const lines = formatWhatsappOrderItemLines(item);
  assert.equal(lines[0], '1x Armá tu Docena — $24.000');
  assert.equal(lines[1], '   4x FATAY - Árabes');
  assert.equal(lines[2], '   8x SFIHAS - jamón y queso');
});

test('formatWhatsappOrderItemLines strips por Unidad from combo flavor lines', () => {
  const item: CartItem = {
    product: baseProduct,
    quantity: 1,
    comboDetail:
      '3x Árabe por Unidad, 3x Jamón y Queso por Unidad, 3x Cebolla y Queso por Unidad, 3x Bondiola al Disco por Unidad',
  };
  const lines = formatWhatsappOrderItemLines(item);
  assert.equal(lines[1], '   3x Árabe');
  assert.equal(lines[2], '   3x Jamón y Queso');
  assert.equal(lines[3], '   3x Cebolla y Queso');
  assert.equal(lines[4], '   3x Bondiola al Disco');
});

test('buildWhatsappOrderMessage has no emojis and grouped sections', () => {
  const message = buildWhatsappOrderMessage({
    branchName: 'Abdonur San Vicente',
    orderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    customerName: 'Juan Pérez',
    items: [
      {
        product: baseProduct,
        quantity: 1,
        comboDetail: '4x FATAY - Árabes, 8x SFIHAS - jamón y queso',
      },
      { product: flavorProduct, quantity: 2 },
    ],
    formattedTotal: '$ 28.000',
    deliveryMethod: 'delivery',
    deliveryLabel: 'Envío a domicilio',
    address: 'Av. Colón 1234, Córdoba',
    paymentMethod: 'cash',
    paymentLabel: 'Efectivo al recibir',
    notes: 'Sin picante',
  });

  assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(message));
  assert.match(message, /\*NUEVO PEDIDO — Abdonur San Vicente\*/);
  assert.match(message, /PRODUCTOS/);
  assert.match(message, /   4x FATAY - Árabes/);
  assert.match(message, /2x FATAY - Árabes — \$4\.000/);
  assert.match(message, /ENTREGA/);
  assert.match(message, /Dirección: Av\. Colón 1234/);
  assert.match(message, /Al total se suma el costo de envío\./);
  assert.match(message, /El local confirmará el precio del delivery por WhatsApp\./);
  assert.match(message, /OBSERVACIONES\nSin picante/);
});

test('buildWhatsappOrderMessage adds transfer confirmation note', () => {
  const message = buildWhatsappOrderMessage({
    branchName: 'Abdonur San Vicente',
    orderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    customerName: 'Juan Pérez',
    items: [{ product: flavorProduct, quantity: 1 }],
    formattedTotal: '$ 2.000',
    deliveryMethod: 'pickup',
    deliveryLabel: 'Retira en local',
    address: '',
    paymentMethod: 'transfer',
    paymentLabel: 'Transferencia / MercadoPago',
    notes: '',
  });

  assert.match(message, /Antes de transferir, esperá la confirmación del local\./);
  assert.doesNotMatch(message, /Al total se suma el costo de envío\./);
});
