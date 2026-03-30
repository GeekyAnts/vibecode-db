import { describe, it, expect, beforeEach } from 'vitest';
import { createClient } from '../../src';
import { MockAdapter } from '../../src/adapters/mock';

const DEMO_USER_ID = 'demo-user-001';

describe('seedUsers saves users into the users table', () => {
  let adapter: MockAdapter;
  let client: ReturnType<typeof createClient>;

  beforeEach(() => {
    adapter = new MockAdapter();
    adapter.seedUsers([
      { id: DEMO_USER_ID, email: 'demo@example.com', password: 'password123' },
    ]);
    client = createClient('', '', { adapter });
  });

  it('seeded user appears in users table via from("users").select()', async () => {
    const { data, error } = await client.from('users').select('*');
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].id).toBe(DEMO_USER_ID);
    expect(data![0].email).toBe('demo@example.com');
  });

  it('seeded user can sign in via auth', async () => {
    const { data, error } = await client.auth.signInWithPassword({
      email: 'demo@example.com',
      password: 'password123',
    });
    expect(error).toBeNull();
    expect(data.user!.id).toBe(DEMO_USER_ID);
  });

  it('seeded user can be queried by id with eq filter', async () => {
    const { data, error } = await client.from('users').select('*').eq('id', DEMO_USER_ID);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].email).toBe('demo@example.com');
  });

  it('seeded user has created_at and user_metadata fields', async () => {
    const { data } = await client.from('users').select('*').eq('id', DEMO_USER_ID);
    expect(data![0]).toHaveProperty('created_at');
    expect(data![0]).toHaveProperty('user_metadata');
  });

  it('multiple seeded users all appear in users table', async () => {
    // Fresh adapter with multiple users
    const adapter2 = new MockAdapter();
    adapter2.seedUsers([
      { id: 'user-1', email: 'alice@test.com', password: 'pass1' },
      { id: 'user-2', email: 'bob@test.com', password: 'pass2' },
      { id: 'user-3', email: 'charlie@test.com', password: 'pass3' },
    ]);
    const client2 = createClient('', '', { adapter: adapter2 });

    const { data } = await client2.from('users').select('*');
    expect(data).toHaveLength(3);
    const emails = data!.map((u: any) => u.email).sort();
    expect(emails).toEqual(['alice@test.com', 'bob@test.com', 'charlie@test.com']);
  });

  it('does not duplicate users if seedUsers is called twice', async () => {
    // Call seedUsers again with same user
    adapter.seedUsers([
      { id: DEMO_USER_ID, email: 'demo@example.com', password: 'password123' },
    ]);

    const { data } = await client.from('users').select('*');
    expect(data).toHaveLength(1);
  });
});
