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

describe('QueryBuilderSelect', () => {
  it('builds a select descriptor', async () => {
    const { adapter, captured } = createMockAdapter();
    const qb = new QueryBuilderSelect(adapter, 'users');

    await qb.select('id, name');

    expect(captured).toHaveLength(1);
    expect(captured[0].table).toBe('users');
    expect(captured[0].operation).toBe('select');
    expect(captured[0].columns).toBe('id, name');
  });

  it('builds a select * descriptor by default', async () => {
    const { adapter, captured } = createMockAdapter();
    const qb = new QueryBuilderSelect(adapter, 'posts');

    await qb.select();

    expect(captured[0].columns).toBe('*');
  });

  it('builds an insert descriptor', async () => {
    const { adapter, captured } = createMockAdapter();
    const qb = new QueryBuilderSelect(adapter, 'users');

    await qb.insert({ name: 'Alice', email: 'alice@test.com' });

    expect(captured[0].operation).toBe('insert');
    expect(captured[0].values).toEqual({ name: 'Alice', email: 'alice@test.com' });
  });

  it('builds an update descriptor', async () => {
    const { adapter, captured } = createMockAdapter();
    const qb = new QueryBuilderSelect(adapter, 'users');

    await qb.update({ name: 'Bob' }).eq('id', 1);

    expect(captured[0].operation).toBe('update');
    expect(captured[0].values).toEqual({ name: 'Bob' });
    expect(captured[0].filters).toHaveLength(1);
    expect(captured[0].filters[0]).toEqual({ column: 'id', operator: 'eq', value: 1 });
  });

  it('builds a delete descriptor', async () => {
    const { adapter, captured } = createMockAdapter();
    const qb = new QueryBuilderSelect(adapter, 'users');

    await qb.delete().eq('id', 1);

    expect(captured[0].operation).toBe('delete');
    expect(captured[0].filters[0]).toEqual({ column: 'id', operator: 'eq', value: 1 });
  });

  it('builds an upsert descriptor', async () => {
    const { adapter, captured } = createMockAdapter();
    const qb = new QueryBuilderSelect(adapter, 'users');

    await qb.upsert({ id: 1, name: 'Charlie' }, { onConflict: 'id' });

    expect(captured[0].operation).toBe('upsert');
    expect(captured[0].onConflict).toBe('id');
  });

  it('supports count option on select', async () => {
    const { adapter, captured } = createMockAdapter();
    const qb = new QueryBuilderSelect(adapter, 'users');

    await qb.select('*', { count: 'exact' });

    expect(captured[0].modifiers.count).toBe('exact');
  });
});
