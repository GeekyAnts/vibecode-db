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

describe('TransformBuilder', () => {
  it('applies order ascending', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().order('name');
    expect(captured[0].modifiers.order).toEqual([{ column: 'name', ascending: true }]);
  });

  it('applies order descending', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().order('created_at', { ascending: false });
    expect(captured[0].modifiers.order).toEqual([{ column: 'created_at', ascending: false }]);
  });

  it('applies multiple orders', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users')
      .select()
      .order('name')
      .order('age', { ascending: false });
    expect(captured[0].modifiers.order).toHaveLength(2);
  });

  it('applies limit', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().limit(10);
    expect(captured[0].modifiers.limit).toBe(10);
  });

  it('applies range', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().range(0, 9);
    expect(captured[0].modifiers.range).toEqual({ from: 0, to: 9 });
  });

  it('applies single', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().eq('id', 1).single();
    expect(captured[0].modifiers.single).toBe(true);
  });

  it('applies maybeSingle', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users').select().eq('id', 999).maybeSingle();
    expect(captured[0].modifiers.maybeSingle).toBe(true);
  });

  it('chains filter and transform methods', async () => {
    const { adapter, captured } = createMockAdapter();
    await new QueryBuilderSelect(adapter, 'users')
      .select('id, name')
      .eq('status', 'active')
      .order('name')
      .limit(5);

    const d = captured[0];
    expect(d.columns).toBe('id, name');
    expect(d.filters).toHaveLength(1);
    expect(d.modifiers.order).toHaveLength(1);
    expect(d.modifiers.limit).toBe(5);
  });
});
