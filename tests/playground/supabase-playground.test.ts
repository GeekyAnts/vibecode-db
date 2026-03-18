/**
 * Tests all playground queries against a real Supabase instance.
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from playground/.env
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '../../src/index';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Load env from playground/.env ─────────────────────

function loadEnv(): Record<string, string> {
  try {
    const envPath = resolve(__dirname, '../../playground/.env');
    const content = readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.substring(0, eqIdx);
      let val = trimmed.substring(eqIdx + 1);
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
    return env;
  } catch {
    return {};
  }
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';
const hasCredentials = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// ── Tests ─────────────────────────────────────────────

describe.skipIf(!hasCredentials)('Playground queries — Supabase adapter', () => {
  let client: ReturnType<typeof createClient>;

  beforeAll(async () => {
    const { createClient: createSupabase } = await import('@supabase/supabase-js');
    const { SupabaseAdapter } = await import('../../src/adapters/supabase/index');
    const supabaseClient = createSupabase(SUPABASE_URL, SUPABASE_ANON_KEY);
    const adapter = new SupabaseAdapter({
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_ANON_KEY,
      client: supabaseClient,
    });
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { adapter });
  });

  // ── CRUD ─────────────────────────────────────────

  describe('CRUD — Select', () => {
    it('select all users', async () => {
      const { data, error } = await client.from('users').select('*');
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect((data as any[]).length).toBeGreaterThanOrEqual(1);
    });

    it('select specific columns', async () => {
      const { data, error } = await client.from('users').select('id, name, email');
      expect(error).toBeNull();
      expect(data![0]).toHaveProperty('name');
      expect(data![0]).toHaveProperty('email');
      expect(data![0]).not.toHaveProperty('created_at');
    });

    it('select single by email', async () => {
      const { data, error } = await client.from('users').select('*').eq('email', 'alice@test.com').single();
      expect(error).toBeNull();
      expect((data as any).name).toBe('Alice');
    });

    it('maybeSingle returns null for nonexistent', async () => {
      const { data, error } = await client.from('users').select('*').eq('email', 'nonexistent@test.com').maybeSingle();
      expect(error).toBeNull();
      expect(data).toBeNull();
    });
  });

  // ── Filters ──────────────────────────────────────

  describe('Filters', () => {
    it('eq: tasks with status todo', async () => {
      const { data, error } = await client.from('tasks').select('*').eq('status', 'todo');
      expect(error).toBeNull();
      expect((data as any[]).length).toBeGreaterThanOrEqual(1);
      expect((data as any[]).every((t: any) => t.status === 'todo')).toBe(true);
    });

    it('neq: tasks not todo', async () => {
      const { data, error } = await client.from('tasks').select('*').neq('status', 'todo');
      expect(error).toBeNull();
      expect((data as any[]).every((t: any) => t.status !== 'todo')).toBe(true);
    });

    it('like: users matching pattern', async () => {
      const { data, error } = await client.from('users').select('*').like('name', '%li%');
      expect(error).toBeNull();
      expect((data as any[]).length).toBeGreaterThanOrEqual(1);
    });

    it('ilike: case-insensitive match', async () => {
      const { data, error } = await client.from('users').select('*').ilike('name', '%ALICE%');
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect((data as any[])[0].name).toBe('Alice');
    });

    it('in: tasks with specific statuses', async () => {
      const { data, error } = await client.from('tasks').select('*').in('status', ['todo', 'in_progress']);
      expect(error).toBeNull();
      expect((data as any[]).every((t: any) => ['todo', 'in_progress'].includes(t.status))).toBe(true);
    });

    it('is null: comments without parent', async () => {
      const { data, error } = await client.from('comments').select('*').is('parent_comment_id', null);
      expect(error).toBeNull();
      expect((data as any[]).every((c: any) => c.parent_comment_id === null)).toBe(true);
    });

    it('or: tasks todo or in_progress', async () => {
      const { data, error } = await client.from('tasks').select('*').or('status.eq.todo,status.eq.in_progress');
      expect(error).toBeNull();
      expect((data as any[]).every((t: any) => ['todo', 'in_progress'].includes(t.status))).toBe(true);
    });

    it('not: tasks not done', async () => {
      const { data, error } = await client.from('tasks').select('*').not('status', 'eq', 'done');
      expect(error).toBeNull();
      expect((data as any[]).every((t: any) => t.status !== 'done')).toBe(true);
    });

    it('match: project_members with role owner', async () => {
      const { data, error } = await client.from('project_members').select('*').match({ role: 'owner' });
      expect(error).toBeNull();
      expect((data as any[]).every((m: any) => m.role === 'owner')).toBe(true);
    });
  });

  // ── Transforms ───────────────────────────────────

  describe('Transforms', () => {
    it('order ascending by name', async () => {
      const { data, error } = await client.from('users').select('*').order('name', { ascending: true });
      expect(error).toBeNull();
      const names = (data as any[]).map(u => u.name);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it('limit results', async () => {
      const { data, error } = await client.from('users').select('*').limit(3);
      expect(error).toBeNull();
      expect(data).toHaveLength(3);
    });

    it('range pagination', async () => {
      const { data, error } = await client.from('users').select('*').range(2, 4);
      expect(error).toBeNull();
      expect(data).toHaveLength(3);
    });

    it('combined: filter + order + limit', async () => {
      const { data, error } = await client.from('tasks').select('id, title, status')
        .neq('status', 'done')
        .order('title', { ascending: true })
        .limit(2);
      expect(error).toBeNull();
      expect((data as any[]).length).toBeLessThanOrEqual(2);
      expect((data as any[])[0]).not.toHaveProperty('project_id');
    });
  });

  // ── Relational ───────────────────────────────────

  describe('Relational', () => {
    it('one-to-many: projects with tasks', async () => {
      const { data, error } = await client.from('projects').select('id, name, tasks ( id, title, status )');
      expect(error).toBeNull();
      expect((data as any[]).length).toBeGreaterThanOrEqual(1);
      expect(Array.isArray((data as any[])[0].tasks)).toBe(true);
    });

    it('many-to-one: projects with owner', async () => {
      const { data, error } = await client.from('projects').select('id, name, owner:users!owner_id ( name, email )');
      expect(error).toBeNull();
      expect((data as any[])[0].owner).toHaveProperty('name');
    });

    it('nested: projects → tasks → comments', async () => {
      const { data, error } = await client.from('projects').select(`
        id, name, tasks ( id, title, status, comments ( id, content ) )
      `);
      expect(error).toBeNull();
      for (const project of data as any[]) {
        expect(Array.isArray(project.tasks)).toBe(true);
        for (const task of project.tasks) {
          expect(Array.isArray(task.comments)).toBe(true);
        }
      }
    });

    it('comments with task and user', async () => {
      const { data, error } = await client.from('comments').select(`
        id, content, task:tasks!task_id ( title, status ), user:users!user_id ( name, email )
      `);
      expect(error).toBeNull();
      expect((data as any[]).length).toBeGreaterThanOrEqual(1);
      expect((data as any[])[0].task).toHaveProperty('title');
      expect((data as any[])[0].user).toHaveProperty('name');
    });

    it('deep: users → projects → tasks → comments', async () => {
      const { data, error } = await client.from('users').select(`
        id, name, projects ( id, name, tasks ( id, title, comments ( content ) ) )
      `);
      expect(error).toBeNull();
      expect((data as any[]).length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Auth ─────────────────────────────────────────

  describe('Auth', () => {
    it('signUp returns a structured response', async () => {
      const { data, error } = await client.auth.signUp({
        email: `test-${Date.now()}@gmail.com`,
        password: 'TestPassword123!',
      });
      if (error) {
        expect(error).toHaveProperty('message');
      } else {
        expect(data.user).not.toBeNull();
      }
    });

    it('getSession returns without throwing', async () => {
      const { error } = await client.auth.getSession();
      expect(error).toBeNull();
    });

    it('signOut returns without throwing', async () => {
      const { error } = await client.auth.signOut();
      expect(error).toBeNull();
    });
  });

  // ── Storage ──────────────────────────────────────

  describe('Storage', () => {
    it('listBuckets returns a response', async () => {
      const { data, error } = await client.storage.listBuckets();
      if (!error) {
        expect(Array.isArray(data)).toBe(true);
      }
    });

    it('getPublicUrl returns a URL string', async () => {
      const { data } = client.storage.from('avatars').getPublicUrl('test.jpg');
      expect(typeof data.publicUrl).toBe('string');
      expect(data.publicUrl.length).toBeGreaterThan(0);
    });
  });

  // ── RPC ──────────────────────────────────────────

  describe('RPC', () => {
    it('returns error for unknown function', async () => {
      const { error } = await client.rpc('nonexistent_function_xyz');
      expect(error).not.toBeNull();
    });
  });
});
