import { describe, it, expect } from 'vitest';
import { createClient } from '../../src/index';
import { MockAdapter } from '../../src/adapters/mock/index';

describe('Repro: insert().select().single()', () => {
  it('chains insert -> select -> single (Supabase pattern)', async () => {
    const adapter = new MockAdapter();
    const client = createClient('', '', { adapter });

    const { data, error } = await client
      .from('credit_cards')
      .insert({
        id: `card-${Date.now()}`,
        user_id: 'u1',
        bank_name: 'Chase',
        last_4: '1234',
        balance: 100,
      })
      .select()
      .single();

    // eslint-disable-next-line no-console
    console.log('data:', data, 'error:', error);
    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect((data as any).bank_name).toBe('Chase');
  });

  it('plain insert without .select() returns null data (Supabase parity)', async () => {
    const adapter = new MockAdapter();
    const client = createClient('', '', { adapter });

    const { data, error } = await client
      .from('credit_cards')
      .insert({ id: 'card-1', bank_name: 'Chase' });

    expect(error).toBeNull();
    expect(data).toBeNull();

    // Row is still in the table — only the response body is empty
    const { data: rows } = await client.from('credit_cards').select('*');
    expect(rows).toHaveLength(1);
  });

  it('insert().select(columns) projects only listed columns', async () => {
    const adapter = new MockAdapter();
    const client = createClient('', '', { adapter });

    const { data } = await client
      .from('credit_cards')
      .insert({ id: 'c2', bank_name: 'Amex', balance: 50 })
      .select('id, bank_name')
      .single();

    expect(data).toEqual({ id: 'c2', bank_name: 'Amex' });
  });

  it('update().select().single() returns updated row', async () => {
    const adapter = new MockAdapter();
    adapter.seed('cards', [{ id: 'a', name: 'old' }]);
    const client = createClient('', '', { adapter });

    const { data, error } = await client
      .from('cards')
      .update({ name: 'new' })
      .eq('id', 'a')
      .select()
      .single();

    expect(error).toBeNull();
    expect((data as any).name).toBe('new');
  });

  it('upsert().select().single() returns row', async () => {
    const adapter = new MockAdapter();
    const client = createClient('', '', { adapter });

    const { data, error } = await client
      .from('cards')
      .upsert({ id: 'a', name: 'new' }, { onConflict: 'id' })
      .select()
      .single();

    expect(error).toBeNull();
    expect((data as any).id).toBe('a');
  });

  it('delete().select() returns deleted rows', async () => {
    const adapter = new MockAdapter();
    adapter.seed('cards', [{ id: 'a', name: 'x' }, { id: 'b', name: 'y' }]);
    const client = createClient('', '', { adapter });

    const { data } = await client
      .from('cards')
      .delete()
      .eq('id', 'a')
      .select();

    expect(data).toHaveLength(1);
    expect((data as any[])[0].id).toBe('a');
  });
});
