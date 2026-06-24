import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canCancelOrder,
  canTransitionStatus,
  getNextStatuses,
} from '../../lib/orderStatusWorkflow.ts';

test('getNextStatuses includes cancelled from new and confirmed', () => {
  assert.deepEqual(getNextStatuses('new'), ['confirmed', 'cancelled']);
  assert.deepEqual(getNextStatuses('confirmed'), ['on_the_way', 'ready', 'cancelled']);
});

test('cannot cancel from on_the_way, ready, completed or cancelled', () => {
  assert.equal(canCancelOrder('new'), true);
  assert.equal(canCancelOrder('confirmed'), true);
  assert.equal(canCancelOrder('on_the_way'), false);
  assert.equal(canCancelOrder('ready'), false);
  assert.equal(canCancelOrder('completed'), false);
  assert.equal(canCancelOrder('cancelled'), false);
});

test('canTransitionStatus allows cancellation paths only when valid', () => {
  assert.equal(canTransitionStatus('new', 'cancelled'), true);
  assert.equal(canTransitionStatus('confirmed', 'cancelled'), true);
  assert.equal(canTransitionStatus('on_the_way', 'cancelled'), false);
  assert.equal(canTransitionStatus('completed', 'cancelled'), false);
});
