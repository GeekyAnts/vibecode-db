import { describe, it, expect, vi } from 'vitest';
import { QueryBuilderSelect } from '../../src/query-builder/QueryBuilderSelect';
import type { DatabaseAdapter } from '../../src/adapters/types';
import type { QueryDescriptor } from '../../src/types';

function createMockAdapter() {
  const captured: QueryDescriptor[] = [];
  const adapter: DatabaseAdapter = {
    executeQuery: vi.fn(async (descriptor: QueryDescriptor) => {
      captured.push(descriptor);
      return { data: [], error: null, status: 200, statusText: 'OK' };
    }),
    executeRpc: vi.fn(async () => ({ data: null, error: null, status: 200, statusText: 'OK' })),
    auth: {} as any,
    storage: {} as any,
    realtime: {} as any,
    functions: {} as any,
  };
  return { adapter, captured };
}

describe('FilterBuilder', () => {
  it('chains eq filter', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().eq('status', 'active');
    expect(captured[0].filters).toEqual([{ column: 'status', operator: 'eq', value: 'active' }]);
  });

  it('chains neq filter', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().neq('role', 'admin');
    expect(captured[0].filters[0].operator).toBe('neq');
  });

  it('chains gt/gte/lt/lte filters', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().gt('age', 18).lte('age', 65);
    expect(captured[0].filters).toHaveLength(2);
    expect(captured[0].filters[0]).toEqual({ column: 'age', operator: 'gt', value: 18 });
    expect(captured[0].filters[1]).toEqual({ column: 'age', operator: 'lte', value: 65 });
  });

  it('chains like and ilike filters', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().like('name', '%alice%');
    expect(captured[0].filters[0]).toEqual({ column: 'name', operator: 'like', value: '%alice%' });
  });

  it('chains is filter', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().is('deleted_at', null);
    expect(captured[0].filters[0]).toEqual({ column: 'deleted_at', operator: 'is', value: null });
  });

  it('chains in filter', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().in('id', [1, 2, 3]);
    expect(captured[0].filters[0]).toEqual({ column: 'id', operator: 'in', value: [1, 2, 3] });
  });

  it('chains not filter', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().not('status', 'eq', 'banned');
    expect(captured[0].filters[0]).toEqual({ column: 'status', operator: 'eq', value: 'banned', negate: true });
  });

  it('chains or filter', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().or('age.gt.18,name.eq.admin');
    expect(captured[0].filters[0]).toEqual({ column: 'or', operator: 'or', value: 'age.gt.18,name.eq.admin' });
  });

  it('chains match filter', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().match({ status: 'active', role: 'admin' });
    expect(captured[0].filters).toHaveLength(2);
    expect(captured[0].filters[0]).toEqual({ column: 'status', operator: 'eq', value: 'active' });
    expect(captured[0].filters[1]).toEqual({ column: 'role', operator: 'eq', value: 'admin' });
  });

  it('chains contains filter', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().contains('tags', ['a', 'b']);
    expect(captured[0].filters[0]).toEqual({ column: 'tags', operator: 'contains', value: ['a', 'b'] });
  });

  it('chains multiple filters', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users')
      .select()
      .eq('status', 'active')
      .gt('age', 18)
      .like('name', '%john%')
      .limit(10);

    expect(captured[0].filters).toHaveLength(3);
    expect(captured[0].modifiers.limit).toBe(10);
  });
});
