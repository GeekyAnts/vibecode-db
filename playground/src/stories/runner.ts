import { createClient, defineTable, hasMany, belongsTo } from '@vibecode-db/client';
import type { TableDefinition } from '@vibecode-db/client';
import { MockAdapter } from '@vibecode-db/client/adapters/mock';
import type { AdapterType } from './index';

interface AdapterConfig {
  type: AdapterType;
  supabaseUrl?: string;
  supabaseKey?: string;
  pocketbaseUrl?: string;
  restBaseUrl?: string;
}

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

// ── Table definitions (matches Supabase migrations) ──

const usersTable: TableDefinition = defineTable('users', {
  id: 'uuid',
  email: 'text',
  name: 'text',
  created_at: 'timestamptz',
  profiles: hasMany(() => profilesTable, 'user_id'),
  projects: hasMany(() => projectsTable, 'owner_id'),
  comments: hasMany(() => commentsTable, 'user_id'),
  activity_logs: hasMany(() => activityLogsTable, 'user_id'),
});

const profilesTable: TableDefinition = defineTable('profiles', {
  id: 'uuid',
  user_id: 'uuid',
  avatar_url: 'text',
  bio: 'text',
  created_at: 'timestamptz',
  user: belongsTo(() => usersTable, 'user_id'),
});

const projectsTable: TableDefinition = defineTable('projects', {
  id: 'uuid',
  owner_id: 'uuid',
  name: 'text',
  description: 'text',
  created_at: 'timestamptz',
  owner: belongsTo(() => usersTable, 'owner_id'),
  tasks: hasMany(() => tasksTable, 'project_id'),
  project_members: hasMany(() => projectMembersTable, 'project_id'),
});

const tasksTable: TableDefinition = defineTable('tasks', {
  id: 'uuid',
  project_id: 'uuid',
  title: 'text',
  status: 'text',
  created_at: 'timestamptz',
  project: belongsTo(() => projectsTable, 'project_id'),
  comments: hasMany(() => commentsTable, 'task_id'),
});

const projectMembersTable: TableDefinition = defineTable('project_members', {
  id: 'uuid',
  user_id: 'uuid',
  project_id: 'uuid',
  role: 'text',
  joined_at: 'timestamptz',
  user: belongsTo(() => usersTable, 'user_id'),
  project: belongsTo(() => projectsTable, 'project_id'),
});

const commentsTable: TableDefinition = defineTable('comments', {
  id: 'uuid',
  user_id: 'uuid',
  task_id: 'uuid',
  parent_comment_id: 'uuid',
  content: 'text',
  created_at: 'timestamptz',
  user: belongsTo(() => usersTable, 'user_id'),
  task: belongsTo(() => tasksTable, 'task_id'),
});

const activityLogsTable: TableDefinition = defineTable('activity_logs', {
  id: 'uuid',
  user_id: 'uuid',
  entity_type: 'text',
  entity_id: 'uuid',
  action: 'text',
  created_at: 'timestamptz',
  user: belongsTo(() => usersTable, 'user_id'),
});

// ── Mock client with seed data matching Supabase ─────

function createSeededMockClient() {
  const adapter = new MockAdapter();

  const now = '2026-03-17T13:37:21.067619+00';

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

  adapter.setSchema(
    usersTable, profilesTable, projectsTable, tasksTable,
    projectMembersTable, commentsTable, activityLogsTable,
  );

  adapter.registerRpc('add', (args) => (args?.a ?? 0) + (args?.b ?? 0));
  adapter.registerRpc('greet', (args) => `Hello, ${args?.name ?? 'stranger'}!`);

  return createClient('', '', { adapter });
}

async function createAdapterClient(config: AdapterConfig) {
  if (config.type === 'mock') {
    return createSeededMockClient();
  }

  if (config.type === 'supabase') {
    const { createClient: createSupabase } = await import('@supabase/supabase-js');
    const { SupabaseAdapter } = await import('@vibecode-db/client/adapters/supabase');
    const supabaseClient = createSupabase(config.supabaseUrl!, config.supabaseKey!);
    const adapter = new SupabaseAdapter({
      supabaseUrl: config.supabaseUrl!,
      supabaseKey: config.supabaseKey!,
      client: supabaseClient,
    });
    return createClient(config.supabaseUrl!, config.supabaseKey!, { adapter });
  }

  if (config.type === 'pocketbase') {
    const { PocketBaseAdapter } = await import('@vibecode-db/client/adapters/pocketbase');
    const adapter = new PocketBaseAdapter({
      url: config.pocketbaseUrl!,
    });
    return createClient(config.pocketbaseUrl!, '', { adapter });
  }

  if (config.type === 'rest') {
    const { RestAdapter } = await import('@vibecode-db/client/adapters/rest');
    const adapter = new RestAdapter({
      baseUrl: config.restBaseUrl!,
    });
    return createClient(config.restBaseUrl!, '', { adapter });
  }

  return createSeededMockClient();
}

export interface RunResult {
  data: unknown;
  error: string | null;
  duration: number;
}

export async function runStory(code: string, adapterConfig: AdapterConfig): Promise<RunResult> {
  const start = performance.now();

  try {
    const client = await createAdapterClient(adapterConfig);

    const fn = new Function('client', `return (async () => { ${code} })()`) as (
      client: ReturnType<typeof createClient>,
    ) => Promise<unknown>;

    const result = await fn(client);
    const duration = performance.now() - start;

    return {
      data: result,
      error: null,
      duration,
    };
  } catch (err: unknown) {
    const duration = performance.now() - start;
    return {
      data: null,
      error: err instanceof Error ? err.message : String(err),
      duration,
    };
  }
}
