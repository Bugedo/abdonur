import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canAccessMergedOperatorPanel,
  getMergedOperatorBranchSlugs,
  getMergedPanelTitle,
  getNuevaCordobaOperatorSlug,
  isNuevaCordobaMergedOperator,
  NUEVA_CORDOBA_OPERATOR_SLUG,
  NUEVA_CORDOBA_SLUG,
  resolveOperationalBranchIds,
} from '../../lib/adminOperationalScope.helpers.ts';

test('merged operator constants point to San Vicente + Nueva Cordoba', () => {
  assert.equal(getNuevaCordobaOperatorSlug(), 'san-vicente');
  assert.equal(NUEVA_CORDOBA_OPERATOR_SLUG, 'san-vicente');
  assert.equal(NUEVA_CORDOBA_SLUG, 'nueva-cordoba');
  assert.deepEqual(getMergedOperatorBranchSlugs(), ['san-vicente', 'nueva-cordoba']);
});

test('isNuevaCordobaMergedOperator is true only for San Vicente', () => {
  assert.equal(isNuevaCordobaMergedOperator('san-vicente'), true);
  assert.equal(isNuevaCordobaMergedOperator('alta-cordoba'), false);
  assert.equal(isNuevaCordobaMergedOperator('nueva-cordoba'), false);
});

test('getMergedPanelTitle appends Nueva Cordoba label', () => {
  assert.equal(getMergedPanelTitle('Abdonur San Vicente'), 'Abdonur San Vicente + Nueva Córdoba');
});

test('canAccessMergedOperatorPanel allows San Vicente admins on merged panel', () => {
  const sanVicenteSession = {
    role: 'branch_admin' as const,
    username: 'sanvicente',
    branchId: 'sv-id',
    branchSlug: 'san-vicente',
  };
  assert.equal(canAccessMergedOperatorPanel(sanVicenteSession, 'san-vicente'), true);
});

test('canAccessMergedOperatorPanel allows legacy Nueva Cordoba session on merged panel', () => {
  const nuevaSession = {
    role: 'branch_admin' as const,
    username: 'nuevacordoba',
    branchId: 'nc-id',
    branchSlug: 'nueva-cordoba',
  };
  assert.equal(canAccessMergedOperatorPanel(nuevaSession, 'san-vicente'), true);
});

test('canAccessMergedOperatorPanel denies Alta Cordoba on San Vicente merged panel', () => {
  const altaSession = {
    role: 'branch_admin' as const,
    username: 'altacordoba',
    branchId: 'alta-id',
    branchSlug: 'alta-cordoba',
  };
  assert.equal(canAccessMergedOperatorPanel(altaSession, 'san-vicente'), false);
});

test('canAccessMergedOperatorPanel allows branch admin only on own standalone panel', () => {
  const alberdiSession = {
    role: 'branch_admin' as const,
    username: 'alberdi',
    branchId: 'alberdi-id',
    branchSlug: 'alberdi',
  };
  assert.equal(canAccessMergedOperatorPanel(alberdiSession, 'alberdi'), true);
  assert.equal(canAccessMergedOperatorPanel(alberdiSession, 'san-vicente'), false);
});

test('resolveOperationalBranchIds returns empty for super admin', () => {
  assert.deepEqual(resolveOperationalBranchIds({ role: 'super_admin', username: 'admin' }, []), []);
});

test('resolveOperationalBranchIds returns single id for Alta Cordoba', () => {
  assert.deepEqual(
    resolveOperationalBranchIds(
      {
        role: 'branch_admin',
        username: 'altacordoba',
        branchId: 'alta-id',
        branchSlug: 'alta-cordoba',
      },
      ['ignored']
    ),
    ['alta-id']
  );
});

test('resolveOperationalBranchIds returns both ids for San Vicente operator', () => {
  assert.deepEqual(
    resolveOperationalBranchIds(
      {
        role: 'branch_admin',
        username: 'sanvicente',
        branchId: 'sv-id',
        branchSlug: 'san-vicente',
      },
      ['sv-id', 'nc-id']
    ),
    ['sv-id', 'nc-id']
  );
});

test('resolveOperationalBranchIds falls back to operator id when merge lookup is empty', () => {
  assert.deepEqual(
    resolveOperationalBranchIds(
      {
        role: 'branch_admin',
        username: 'sanvicente',
        branchId: 'sv-id',
        branchSlug: 'san-vicente',
      },
      []
    ),
    ['sv-id']
  );
});
