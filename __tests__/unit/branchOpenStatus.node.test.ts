import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getBranchClosedCustomerMessage,
  isBranchOpenAt,
} from '../../lib/branchOpenStatus.ts';

const lunchDinnerHours = '11:30 a 14:30 | 19:30 a 23:30 hs';
const dayRangeHours = 'Lun a Dom 10:00 - 23:00';

test('isBranchOpenAt is open during lunch window', () => {
  // Monday 12:00
  assert.equal(isBranchOpenAt(lunchDinnerHours, 1, 12 * 60), true);
});

test('isBranchOpenAt is closed between lunch and dinner', () => {
  // Monday 16:00
  assert.equal(isBranchOpenAt(lunchDinnerHours, 1, 16 * 60), false);
});

test('isBranchOpenAt is open during dinner window', () => {
  // Monday 20:00
  assert.equal(isBranchOpenAt(lunchDinnerHours, 1, 20 * 60), true);
});

test('isBranchOpenAt is closed after dinner', () => {
  // Monday 23:45
  assert.equal(isBranchOpenAt(lunchDinnerHours, 1, 23 * 60 + 45), false);
});

test('isBranchOpenAt is closed before lunch', () => {
  // Monday 10:00
  assert.equal(isBranchOpenAt(lunchDinnerHours, 1, 10 * 60), false);
});

test('isBranchOpenAt respects day-range format', () => {
  // Tuesday 15:00 within Lun-Dom 10-23
  assert.equal(isBranchOpenAt(dayRangeHours, 2, 15 * 60), true);
  // Tuesday 09:00 before open
  assert.equal(isBranchOpenAt(dayRangeHours, 2, 9 * 60), false);
});

test('getBranchClosedCustomerMessage includes hours', () => {
  const message = getBranchClosedCustomerMessage(lunchDinnerHours);
  assert.match(message, /cerrado/i);
  assert.match(message, /armar el pedido/i);
  assert.ok(message.includes(lunchDinnerHours));
});
