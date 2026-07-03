import assert from 'node:assert/strict';
import test from 'node:test';
import {
  resolveCustomerWhatsappNumber,
  routesNuevaCordobaWhatsappToSanVicente,
} from '../../lib/branchCustomerContact.helpers.ts';

const sanVicente = {
  slug: 'san-vicente',
  whatsapp_number: '5493517061970',
};

const nuevaCordoba = {
  slug: 'nueva-cordoba',
  whatsapp_number: '5493517619358',
};

const altaCordoba = {
  slug: 'alta-cordoba',
  whatsapp_number: '5493517619358',
};

test('routesNuevaCordobaWhatsappToSanVicente is true only for Nueva Cordoba', () => {
  assert.equal(routesNuevaCordobaWhatsappToSanVicente('nueva-cordoba'), true);
  assert.equal(routesNuevaCordobaWhatsappToSanVicente('san-vicente'), false);
  assert.equal(routesNuevaCordobaWhatsappToSanVicente('alta-cordoba'), false);
});

test('resolveCustomerWhatsappNumber keeps Alta Cordoba on its own line', () => {
  assert.equal(
    resolveCustomerWhatsappNumber(altaCordoba, sanVicente),
    '5493517619358'
  );
});

test('resolveCustomerWhatsappNumber routes Nueva Cordoba to San Vicente', () => {
  assert.equal(
    resolveCustomerWhatsappNumber(nuevaCordoba, sanVicente),
    '5493517061970'
  );
});

test('resolveCustomerWhatsappNumber falls back when operator branch is missing', () => {
  assert.equal(resolveCustomerWhatsappNumber(nuevaCordoba, null), '5493517619358');
});
