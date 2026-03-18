import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createClient } from '../../src/index';
import { MockAdapter } from '../../src/adapters/mock/index';

describe('Mock Auth', () => {
  let adapter: MockAdapter;
  let client: ReturnType<typeof createClient>;

  beforeEach(() => {
    adapter = new MockAdapter();
    client = createClient('', '', { adapter });
  });

  it('signs up a new user', async () => {
    const { data, error } = await client.auth.signUp({ email: 'alice@test.com', password: 'password123' });
    expect(error).toBeNull();
    expect(data.user).not.toBeNull();
    expect(data.user!.email).toBe('alice@test.com');
    expect(data.session).not.toBeNull();
  });

  it('prevents duplicate signup', async () => {
    await client.auth.signUp({ email: 'alice@test.com', password: 'password123' });
    const { error } = await client.auth.signUp({ email: 'alice@test.com', password: 'password456' });
    expect(error).not.toBeNull();
  });

  it('signs in with correct credentials', async () => {
    await client.auth.signUp({ email: 'bob@test.com', password: 'secret' });
    await client.auth.signOut();

    const { data, error } = await client.auth.signInWithPassword({ email: 'bob@test.com', password: 'secret' });
    expect(error).toBeNull();
    expect(data.user!.email).toBe('bob@test.com');
    expect(data.session).not.toBeNull();
  });

  it('rejects wrong password', async () => {
    await client.auth.signUp({ email: 'bob@test.com', password: 'secret' });
    await client.auth.signOut();

    const { error } = await client.auth.signInWithPassword({ email: 'bob@test.com', password: 'wrong' });
    expect(error).not.toBeNull();
  });

  it('gets current user', async () => {
    await client.auth.signUp({ email: 'alice@test.com', password: 'pass' });
    const { data } = await client.auth.getUser();
    expect(data.user!.email).toBe('alice@test.com');
  });

  it('returns null user when not authenticated', async () => {
    const { data, error } = await client.auth.getUser();
    expect(data.user).toBeNull();
    expect(error).not.toBeNull();
  });

  it('gets current session', async () => {
    await client.auth.signUp({ email: 'alice@test.com', password: 'pass' });
    const { data } = await client.auth.getSession();
    expect(data.session).not.toBeNull();
    expect(data.session!.access_token).toBeTruthy();
  });

  it('signs out', async () => {
    await client.auth.signUp({ email: 'alice@test.com', password: 'pass' });
    await client.auth.signOut();
    const { data } = await client.auth.getSession();
    expect(data.session).toBeNull();
  });

  it('fires auth state change on sign in', async () => {
    const callback = vi.fn();
    client.auth.onAuthStateChange(callback);

    await client.auth.signUp({ email: 'alice@test.com', password: 'pass' });
    expect(callback).toHaveBeenCalledWith('SIGNED_IN', expect.any(Object));
  });

  it('fires auth state change on sign out', async () => {
    const callback = vi.fn();
    await client.auth.signUp({ email: 'alice@test.com', password: 'pass' });

    client.auth.onAuthStateChange(callback);
    await client.auth.signOut();
    expect(callback).toHaveBeenCalledWith('SIGNED_OUT', null);
  });

  it('unsubscribes from auth state changes', async () => {
    const callback = vi.fn();
    const { data: { subscription } } = client.auth.onAuthStateChange(callback);

    subscription.unsubscribe();
    await client.auth.signUp({ email: 'alice@test.com', password: 'pass' });
    expect(callback).not.toHaveBeenCalled();
  });

  it('updates user metadata', async () => {
    await client.auth.signUp({ email: 'alice@test.com', password: 'pass' });
    const { data } = await client.auth.updateUser({ data: { name: 'Alice' } });
    expect(data.user!.user_metadata.name).toBe('Alice');
  });

  it('resets password for email (no-op)', async () => {
    const { error } = await client.auth.resetPasswordForEmail('alice@test.com');
    expect(error).toBeNull();
  });

  describe('seedUser', () => {
    it('allows sign in with seeded credentials', async () => {
      adapter.auth.seedUser('seeded@test.com', 'seedpass');
      const { data, error } = await client.auth.signInWithPassword({ email: 'seeded@test.com', password: 'seedpass' });
      expect(error).toBeNull();
      expect(data.user!.email).toBe('seeded@test.com');
    });

    it('does not set current session', async () => {
      adapter.auth.seedUser('seeded@test.com', 'seedpass');
      const { data } = await client.auth.getSession();
      expect(data.session).toBeNull();
    });

    it('does not fire auth listeners', () => {
      const callback = vi.fn();
      client.auth.onAuthStateChange(callback);
      adapter.auth.seedUser('seeded@test.com', 'seedpass');
      expect(callback).not.toHaveBeenCalled();
    });

    it('accepts a custom id', () => {
      const user = adapter.auth.seedUser('seeded@test.com', 'seedpass', { id: 'custom-id-123' });
      expect(user.id).toBe('custom-id-123');
    });

    it('accepts user_metadata', () => {
      const user = adapter.auth.seedUser('seeded@test.com', 'seedpass', { user_metadata: { name: 'Seed' } });
      expect(user.user_metadata.name).toBe('Seed');
    });
  });

  describe('seedUsers (via MockAdapter)', () => {
    it('seeds multiple users and returns adapter for chaining', async () => {
      const result = adapter.seedUsers([
        { email: 'a@test.com', password: 'pass1' },
        { email: 'b@test.com', password: 'pass2', id: 'user-b' },
      ]);
      expect(result).toBe(adapter);

      const { error: e1 } = await client.auth.signInWithPassword({ email: 'a@test.com', password: 'pass1' });
      expect(e1).toBeNull();

      await client.auth.signOut();
      const { data, error: e2 } = await client.auth.signInWithPassword({ email: 'b@test.com', password: 'pass2' });
      expect(e2).toBeNull();
      expect(data.user!.id).toBe('user-b');
    });
  });
});
