/**
 * Tests all playground queries against the Mock adapter.
 * Seed data matches the Supabase migrations exactly.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createClient, defineTable, hasMany, belongsTo } from '../../src/index';
import { MockAdapter } from '../../src/adapters/mock/index';

// ── UUIDs matching Supabase seed data ────────────────

const U1 = '11111111-1111-1111-1111-111111111111';
const U2 = '22222222-2222-2222-2222-222222222222';
const U3 = '33333333-3333-3333-3333-333333333333';
const U4 = '44444444-4444-4444-4444-444444444444';
const U5 = '55555555-5555-5555-5555-555555555555';
const U6 = '66666666-6666-6666-6666-666666666666';

const P1 = 'aaaa1111-1111-1111-1111-111111111111';
const P2 = 'aaaa2222-2222-2222-2222-222222222222';

const T1 = 'bbbb1111-1111-1111-1111-111111111111';
const T2 = 'bbbb2222-2222-2222-2222-222222222222';
const T3 = 'bbbb3333-3333-3333-3333-333333333333';
const T4 = 'bbbb4444-4444-4444-4444-444444444444';

const C1 = 'cccc1111-1111-1111-1111-111111111111';
const C2 = 'cccc2222-2222-2222-2222-222222222222';
const C3 = 'cccc3333-3333-3333-3333-333333333333';

// ── Table definitions ────────────────────────────────

const usersTable = defineTable('users', {
  id: 'uuid', email: 'text', name: 'text', created_at: 'timestamptz',
  profiles: hasMany(() => profilesTable, 'user_id'),
  projects: hasMany(() => projectsTable, 'owner_id'),
  comments: hasMany(() => commentsTable, 'user_id'),
});

const profilesTable = defineTable('profiles', {
  id: 'uuid', user_id: 'uuid', avatar_url: 'text', bio: 'text', created_at: 'timestamptz',
  user: belongsTo(() => usersTable, 'user_id'),
});

const projectsTable = defineTable('projects', {
  id: 'uuid', owner_id: 'uuid', name: 'text', description: 'text', created_at: 'timestamptz',
  owner: belongsTo(() => usersTable, 'owner_id'),
  tasks: hasMany(() => tasksTable, 'project_id'),
  project_members: hasMany(() => projectMembersTable, 'project_id'),
});

const tasksTable = defineTable('tasks', {
  id: 'uuid', project_id: 'uuid', title: 'text', status: 'text', created_at: 'timestamptz',
  project: belongsTo(() => projectsTable, 'project_id'),
  comments: hasMany(() => commentsTable, 'task_id'),
});

const projectMembersTable = defineTable('project_members', {
  id: 'uuid', user_id: 'uuid', project_id: 'uuid', role: 'text', joined_at: 'timestamptz',
  user: belongsTo(() => usersTable, 'user_id'),
  project: belongsTo(() => projectsTable, 'project_id'),
});

const commentsTable = defineTable('comments', {
  id: 'uuid', user_id: 'uuid', task_id: 'uuid', parent_comment_id: 'uuid', content: 'text', created_at: 'timestamptz',
  user: belongsTo(() => usersTable, 'user_id'),
  task: belongsTo(() => tasksTable, 'task_id'),
});

const activityLogsTable = defineTable('activity_logs', {
  id: 'uuid', user_id: 'uuid', entity_type: 'text', entity_id: 'uuid', action: 'text', created_at: 'timestamptz',
  user: belongsTo(() => usersTable, 'user_id'),
});

// ── Test suite ───────────────────────────────────────

describe('Playground queries — Mock adapter', () => {
  let adapter: MockAdapter;
  let client: ReturnType<typeof createClient>;
  const now = '2026-03-17T13:37:21.067619+00';

  beforeEach(() => {
    adapter = new MockAdapter();

    adapter.seed('users', [
      { id: U1, email: 'alice@test.com', name: 'Alice', created_at: now },
      { id: U2, email: 'bob@test.com', name: 'Bob', created_at: now },
      { id: U3, email: 'charlie@test.com', name: 'Charlie', created_at: now },
      { id: U4, email: 'david@test.com', name: 'David', created_at: now },
      { id: U5, email: 'emma@test.com', name: 'Emma', created_at: now },
      { id: U6, email: 'frank@test.com', name: 'Frank', created_at: now },
    ]);

    adapter.seed('profiles', [
      { id: 'prof-1', user_id: U1, avatar_url: null, bio: 'Full-stack developer', created_at: now },
      { id: 'prof-2', user_id: U2, avatar_url: null, bio: 'Designer & frontend dev', created_at: now },
      { id: 'prof-3', user_id: U3, avatar_url: null, bio: 'Backend engineer', created_at: now },
    ]);

    adapter.seed('projects', [
      { id: P1, owner_id: U1, name: 'Website Redesign', description: 'Redesign the company website', created_at: now },
      { id: P2, owner_id: U2, name: 'Mobile App', description: 'Build a React Native app', created_at: now },
    ]);

    adapter.seed('tasks', [
      { id: T1, project_id: P1, title: 'Design homepage', status: 'done', created_at: now },
      { id: T2, project_id: P1, title: 'Implement auth', status: 'in_progress', created_at: now },
      { id: T3, project_id: P2, title: 'Setup Expo project', status: 'done', created_at: now },
      { id: T4, project_id: P2, title: 'Build navigation', status: 'todo', created_at: now },
    ]);

    adapter.seed('project_members', [
      { id: 'pm-1', user_id: U1, project_id: P1, role: 'owner', joined_at: now },
      { id: 'pm-2', user_id: U2, project_id: P1, role: 'member', joined_at: now },
      { id: 'pm-3', user_id: U3, project_id: P1, role: 'member', joined_at: now },
      { id: 'pm-4', user_id: U2, project_id: P2, role: 'owner', joined_at: now },
      { id: 'pm-5', user_id: U4, project_id: P2, role: 'member', joined_at: now },
    ]);

    adapter.seed('comments', [
      { id: C1, user_id: U2, task_id: T1, parent_comment_id: null, content: 'Looks great!', created_at: now },
      { id: C2, user_id: U3, task_id: T2, parent_comment_id: null, content: 'Should we use OAuth?', created_at: now },
      { id: C3, user_id: U1, task_id: T2, parent_comment_id: C2, content: 'Yes, OAuth2 with PKCE', created_at: now },
    ]);

    adapter.seed('activity_logs', [
      { id: 'al-1', user_id: U1, entity_type: 'project', entity_id: P1, action: 'created', created_at: now },
      { id: 'al-2', user_id: U2, entity_type: 'task', entity_id: T1, action: 'completed', created_at: now },
      { id: 'al-3', user_id: U3, entity_type: 'comment', entity_id: C2, action: 'created', created_at: now },
    ]);

    adapter.seed('messages', []);

    adapter.registerRpc('add', (args) => (args?.a ?? 0) + (args?.b ?? 0));
    adapter.registerRpc('greet', (args) => `Hello, ${args?.name ?? 'stranger'}!`);

    adapter.setSchema(
      usersTable, profilesTable, projectsTable, tasksTable,
      projectMembersTable, commentsTable, activityLogsTable,
    );

    client = createClient('', '', { adapter });
  });

  // ── CRUD ─────────────────────────────────────────

  describe('CRUD', () => {
    it('select all users', async () => {
      const { data, error } = await client.from('users').select('*');
      expect(error).toBeNull();
      expect(data).toHaveLength(6);
    });

    it('select specific columns', async () => {
      const { data } = await client.from('users').select('id, name, email');
      expect(data).toHaveLength(6);
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

    it('insert into activity_logs', async () => {
      const { error } = await client.from('activity_logs').insert({
        user_id: U1, entity_type: 'project', entity_id: P1, action: 'viewed',
      });
      expect(error).toBeNull();
      const { data: all } = await client.from('activity_logs').select('*');
      expect(all).toHaveLength(4);
    });

    it('insert multiple activity_logs', async () => {
      const { error } = await client.from('activity_logs').insert([
        { user_id: U1, entity_type: 'task', entity_id: T1, action: 'viewed' },
        { user_id: U2, entity_type: 'task', entity_id: T2, action: 'updated' },
      ]);
      expect(error).toBeNull();
      const { data: all } = await client.from('activity_logs').select('*');
      expect(all).toHaveLength(5);
    });

    it('update task status', async () => {
      await client.from('tasks').update({ status: 'in_progress' }).eq('status', 'todo');
      const { data } = await client.from('tasks').select('*').eq('status', 'todo');
      expect(data).toHaveLength(0);
    });

    it('upsert user', async () => {
      await client.from('users').upsert(
        { id: U1, name: 'Alice (Updated)', email: 'alice@test.com' },
        { onConflict: 'id' },
      );
      const { data } = await client.from('users').select('*').eq('id', U1).single();
      expect((data as any).name).toBe('Alice (Updated)');
    });

    it('delete activity_logs by action', async () => {
      await client.from('activity_logs').delete().eq('action', 'created');
      const { data } = await client.from('activity_logs').select('*');
      expect(data).toHaveLength(1);
      expect((data as any[])[0].action).toBe('completed');
    });
  });

  // ── Filters ──────────────────────────────────────

  describe('Filters', () => {
    it('eq: tasks with status done', async () => {
      const { data } = await client.from('tasks').select('*').eq('status', 'done');
      expect(data).toHaveLength(2);
    });

    it('neq: tasks not done', async () => {
      const { data } = await client.from('tasks').select('*').neq('status', 'done');
      expect(data).toHaveLength(2);
    });

    it('like: users matching pattern', async () => {
      const { data } = await client.from('users').select('*').like('name', '%li%');
      expect(data).toHaveLength(2);
    });

    it('ilike: case-insensitive match', async () => {
      const { data } = await client.from('users').select('*').ilike('name', '%ALICE%');
      expect(data).toHaveLength(1);
      expect((data as any[])[0].name).toBe('Alice');
    });

    it('in: tasks with specific statuses', async () => {
      const { data } = await client.from('tasks').select('*').in('status', ['todo', 'in_progress']);
      expect(data).toHaveLength(2);
    });

    it('is null: comments without parent', async () => {
      const { data } = await client.from('comments').select('*').is('parent_comment_id', null);
      expect(data).toHaveLength(2);
    });

    it('or: tasks done or in_progress', async () => {
      const { data } = await client.from('tasks').select('*').or('status.eq.done,status.eq.in_progress');
      expect(data).toHaveLength(3);
    });

    it('not: tasks not todo', async () => {
      const { data } = await client.from('tasks').select('*').not('status', 'eq', 'todo');
      expect(data).toHaveLength(3);
    });

    it('match: project_members with role owner', async () => {
      const { data } = await client.from('project_members').select('*').match({ role: 'owner' });
      expect(data).toHaveLength(2);
    });

    it('gt: users created after 2026-01-01', async () => {
      const { data } = await client.from('users').select('*').gt('created_at', '2026-01-01');
      expect(data).toHaveLength(6);
    });
  });

  // ── Transforms ───────────────────────────────────

  describe('Transforms', () => {
    it('order ascending by name', async () => {
      const { data } = await client.from('users').select('*').order('name', { ascending: true });
      expect((data as any[])[0].name).toBe('Alice');
      expect((data as any[])[5].name).toBe('Frank');
    });

    it('order descending by created_at', async () => {
      const { data } = await client.from('users').select('*').order('created_at', { ascending: false });
      expect(data).toHaveLength(6);
    });

    it('limit results', async () => {
      const { data } = await client.from('users').select('*').limit(3);
      expect(data).toHaveLength(3);
    });

    it('range pagination', async () => {
      const { data } = await client.from('users').select('*').range(2, 4);
      expect(data).toHaveLength(3);
    });

    it('combined: filter + order + limit', async () => {
      const { data } = await client.from('tasks').select('id, title, status')
        .neq('status', 'done')
        .order('title', { ascending: true })
        .limit(2);
      expect(data).toHaveLength(2);
      expect((data as any[])[0]).not.toHaveProperty('project_id');
    });
  });

  // ── Relational ───────────────────────────────────

  describe('Relational', () => {
    it('one-to-many: projects with tasks', async () => {
      const { data } = await client.from('projects').select(`
        id, name, tasks ( id, title, status )
      `);
      expect(data).toHaveLength(2);
      const website = (data as any[]).find(p => p.name === 'Website Redesign');
      expect(website.tasks).toHaveLength(2);
    });

    it('many-to-one: projects with owner', async () => {
      const { data } = await client.from('projects').select(`
        id, name, description, owner:users ( name, email )
      `);
      expect(data).toHaveLength(2);
      const website = (data as any[]).find(p => p.name === 'Website Redesign');
      expect(website.owner).toEqual({ name: 'Alice', email: 'alice@test.com' });
    });

    it('nested: projects → tasks → comments', async () => {
      const { data } = await client.from('projects').select(`
        id, name, tasks ( id, title, status, comments ( id, content ) )
      `);
      const website = (data as any[]).find(p => p.name === 'Website Redesign');
      const authTask = website.tasks.find((t: any) => t.title === 'Implement auth');
      expect(authTask.comments).toHaveLength(2);
    });

    it('relations + filter: single project with tasks and members', async () => {
      const { data } = await client.from('projects').select(`
        id, name,
        tasks ( title, status ),
        project_members ( role, user:users ( name ) )
      `).eq('name', 'Website Redesign').single();
      expect((data as any).tasks).toHaveLength(2);
      expect((data as any).project_members).toHaveLength(3);
      const owner = (data as any).project_members.find((m: any) => m.role === 'owner');
      expect(owner.user).toEqual({ name: 'Alice' });
    });

    it('deep nesting: users → projects → tasks → comments', async () => {
      const { data } = await client.from('users').select(`
        id, name, projects ( id, name, tasks ( id, title, comments ( content ) ) )
      `).eq('name', 'Alice');
      expect(data).toHaveLength(1);
      expect((data as any[])[0].projects).toHaveLength(1);
      expect((data as any[])[0].projects[0].tasks).toHaveLength(2);
    });

    it('comments with task and user', async () => {
      const { data } = await client.from('comments').select(`
        id, content, task:tasks ( title, status ), user:users ( name, email )
      `);
      expect(data).toHaveLength(3);
      const c1 = (data as any[]).find(c => c.id === C1);
      expect(c1.task).toEqual({ title: 'Design homepage', status: 'done' });
      expect(c1.user).toEqual({ name: 'Bob', email: 'bob@test.com' });
    });
  });

  // ── Auth ─────────────────────────────────────────

  describe('Auth', () => {
    it('signs up a new user', async () => {
      const { data, error } = await client.auth.signUp({ email: 'newuser@example.com', password: 'password123' });
      expect(error).toBeNull();
      expect(data.user).not.toBeNull();
      expect(data.user!.email).toBe('newuser@example.com');
    });

    it('signs in with password', async () => {
      await client.auth.signUp({ email: 'signin@example.com', password: 'secret123' });
      await client.auth.signOut();
      const { data, error } = await client.auth.signInWithPassword({ email: 'signin@example.com', password: 'secret123' });
      expect(error).toBeNull();
      expect(data.user!.email).toBe('signin@example.com');
    });

    it('gets session after signup', async () => {
      await client.auth.signUp({ email: 'session@example.com', password: 'pass' });
      const { data, error } = await client.auth.getSession();
      expect(error).toBeNull();
      expect(data.session).not.toBeNull();
    });

    it('signs out', async () => {
      await client.auth.signUp({ email: 'bye@example.com', password: 'pass' });
      await client.auth.signOut();
      const { data } = await client.auth.getSession();
      expect(data.session).toBeNull();
    });
  });

  // ── Storage ──────────────────────────────────────

  describe('Storage', () => {
    it('creates and lists buckets', async () => {
      await client.storage.createBucket('test-avatars', { public: true });
      await client.storage.createBucket('test-documents');
      const { data, error } = await client.storage.listBuckets();
      expect(error).toBeNull();
      expect((data as any[]).length).toBeGreaterThanOrEqual(2);
    });

    it('uploads and downloads a file', async () => {
      await client.storage.createBucket('test-files');
      await client.storage.from('test-files').upload('hello.txt', 'Hello, World!');
      const { data, error } = await client.storage.from('test-files').download('hello.txt');
      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Blob);
    });

    it('lists files in bucket', async () => {
      await client.storage.createBucket('test-docs');
      await client.storage.from('test-docs').upload('a.md', '# A');
      await client.storage.from('test-docs').upload('b.md', '# B');
      const { data } = await client.storage.from('test-docs').list();
      expect(data).toHaveLength(2);
    });

    it('gets public URL', async () => {
      await client.storage.createBucket('test-images', { public: true });
      await client.storage.from('test-images').upload('photo.jpg', 'binary');
      const { data } = client.storage.from('test-images').getPublicUrl('photo.jpg');
      expect(data.publicUrl).toBeDefined();
    });
  });

  // ── RPC ──────────────────────────────────────────

  describe('RPC', () => {
    it('calls add function', async () => {
      const { data, error } = await client.rpc('add', { a: 10, b: 25 });
      expect(error).toBeNull();
      expect(data).toBe(35);
    });

    it('calls greet function', async () => {
      const { data, error } = await client.rpc('greet', { name: 'World' });
      expect(error).toBeNull();
      expect(data).toBe('Hello, World!');
    });

    it('returns error for unknown function', async () => {
      const { error } = await client.rpc('nonexistent_fn');
      expect(error).not.toBeNull();
    });
  });
});
