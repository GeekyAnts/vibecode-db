import { describe, it, expect, beforeEach } from 'vitest';
import { createClient } from '../../src/index';
import { MockAdapter } from '../../src/adapters/mock/index';

describe('Mock Adapter CRUD', () => {
  let adapter: MockAdapter;
  let client: ReturnType<typeof createClient>;

  beforeEach(() => {
    adapter = new MockAdapter();
    adapter.seed('users', [
      { id: 1, name: 'Alice', age: 30, status: 'active' },
      { id: 2, name: 'Bob', age: 25, status: 'inactive' },
      { id: 3, name: 'Charlie', age: 35, status: 'active' },
    ]);
    client = createClient('', '', { adapter });
  });

  describe('SELECT', () => {
    it('selects all rows', async () => {
      const { data, error } = await client.from('users').select('*');
      expect(error).toBeNull();
      expect(data).toHaveLength(3);
    });

    it('selects with eq filter', async () => {
      const { data } = await client.from('users').select('*').eq('status', 'active');
      expect(data).toHaveLength(2);
    });

    it('selects with multiple filters', async () => {
      const { data } = await client.from('users').select('*').eq('status', 'active').gt('age', 30);
      expect(data).toHaveLength(1);
      expect((data as any[])[0].name).toBe('Charlie');
    });

    it('selects specific columns', async () => {
      const { data } = await client.from('users').select('id, name');
      expect((data as any[])[0]).toHaveProperty('id');
      expect((data as any[])[0]).toHaveProperty('name');
      expect((data as any[])[0]).not.toHaveProperty('age');
    });

    it('selects with order', async () => {
      const { data } = await client.from('users').select('*').order('age', { ascending: false });
      expect((data as any[])[0].name).toBe('Charlie');
    });

    it('selects with limit', async () => {
      const { data } = await client.from('users').select('*').limit(1);
      expect(data).toHaveLength(1);
    });

    it('selects with range', async () => {
      const { data } = await client.from('users').select('*').range(1, 2);
      expect(data).toHaveLength(2);
    });

    it('selects single row', async () => {
      const { data, error } = await client.from('users').select('*').eq('id', 1).single();
      expect(error).toBeNull();
      expect((data as any).name).toBe('Alice');
    });

    it('single returns error when no rows match', async () => {
      const { data, error } = await client.from('users').select('*').eq('id', 999).single();
      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('maybeSingle returns null when no rows match', async () => {
      const { data, error } = await client.from('users').select('*').eq('id', 999).maybeSingle();
      expect(error).toBeNull();
      expect(data).toBeNull();
    });

    it('selects with or filter', async () => {
      const { data } = await client.from('users').select('*').or('age.gt.30,name.eq.Bob');
      expect(data).toHaveLength(2);
    });

    it('selects with in filter', async () => {
      const { data } = await client.from('users').select('*').in('id', [1, 3]);
      expect(data).toHaveLength(2);
    });

    it('selects with like filter', async () => {
      const { data } = await client.from('users').select('*').like('name', '%li%');
      expect(data).toHaveLength(2); // Alice, Charlie
    });

    it('selects with is null filter', async () => {
      adapter.seed('posts', [
        { id: 1, title: 'Post 1', deleted_at: null },
        { id: 2, title: 'Post 2', deleted_at: '2024-01-01' },
      ]);
      const { data } = await client.from('posts').select('*').is('deleted_at', null);
      expect(data).toHaveLength(1);
    });
  });

  describe('INSERT', () => {
    it('inserts a single record', async () => {
      const { data, error } = await client.from('users').insert({ name: 'Diana', age: 28, status: 'active' });
      expect(error).toBeNull();
      expect((data as any[])[0].name).toBe('Diana');

      const { data: all } = await client.from('users').select('*');
      expect(all).toHaveLength(4);
    });

    it('inserts multiple records', async () => {
      const { data } = await client.from('users').insert([
        { name: 'Diana', age: 28, status: 'active' },
        { name: 'Eve', age: 22, status: 'active' },
      ]);
      expect(data).toHaveLength(2);

      const { data: all } = await client.from('users').select('*');
      expect(all).toHaveLength(5);
    });

    it('auto-generates id if not provided', async () => {
      const { data } = await client.from('users').insert({ name: 'Frank', age: 40, status: 'active' });
      expect((data as any[])[0].id).toBeDefined();
    });
  });

  describe('UPDATE', () => {
    it('updates matching records', async () => {
      await client.from('users').update({ status: 'banned' }).eq('id', 2);

      const { data } = await client.from('users').select('*').eq('id', 2).single();
      expect((data as any).status).toBe('banned');
    });

    it('updates multiple matching records', async () => {
      await client.from('users').update({ status: 'suspended' }).eq('status', 'active');

      const { data } = await client.from('users').select('*').eq('status', 'suspended');
      expect(data).toHaveLength(2);
    });
  });

  describe('UPSERT', () => {
    it('updates existing record on conflict', async () => {
      await client.from('users').upsert({ id: 1, name: 'Alice Updated', age: 31, status: 'active' }, { onConflict: 'id' });

      const { data } = await client.from('users').select('*').eq('id', 1).single();
      expect((data as any).name).toBe('Alice Updated');
    });

    it('inserts new record if no conflict', async () => {
      await client.from('users').upsert({ id: 99, name: 'New User', age: 20, status: 'active' }, { onConflict: 'id' });

      const { data } = await client.from('users').select('*');
      expect(data).toHaveLength(4);
    });
  });

  describe('DELETE', () => {
    it('deletes matching records', async () => {
      await client.from('users').delete().eq('id', 2);

      const { data } = await client.from('users').select('*');
      expect(data).toHaveLength(2);
    });

    it('deletes multiple matching records', async () => {
      await client.from('users').delete().eq('status', 'active');

      const { data } = await client.from('users').select('*');
      expect(data).toHaveLength(1);
      expect((data as any[])[0].name).toBe('Bob');
    });
  });

  describe('RPC', () => {
    it('calls registered rpc function', async () => {
      adapter.registerRpc('add', (args) => (args?.a ?? 0) + (args?.b ?? 0));

      const { data } = await client.rpc('add', { a: 2, b: 3 });
      expect(data).toBe(5);
    });

    it('returns error for unregistered rpc', async () => {
      const { error } = await client.rpc('unknown');
      expect(error).not.toBeNull();
    });
  });

  describe('reset', () => {
    it('clears all data', async () => {
      adapter.reset();
      const { data } = await client.from('users').select('*');
      expect(data).toHaveLength(0);
    });
  });
});
