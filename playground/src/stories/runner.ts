import { createClient } from '@vibecode-db/client';
import { MockAdapter } from '@vibecode-db/client/adapters/mock';
import type { AdapterType } from './index';

interface AdapterConfig {
  type: AdapterType;
  supabaseUrl?: string;
  supabaseKey?: string;
  pocketbaseUrl?: string;
  restBaseUrl?: string;
}

function createSeededMockClient() {
  const adapter = new MockAdapter();

  adapter.seed('users', [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 30, status: 'active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 25, status: 'inactive' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', age: 35, status: 'active' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', age: 28, status: 'active' },
    { id: 5, name: 'Eve Wilson', email: 'eve@example.com', age: 42, status: 'inactive' },
  ]);

  adapter.seed('posts', [
    { id: 1, title: 'Getting Started with TypeScript', author_id: 1, tags: ['typescript', 'tutorial'], deleted_at: null },
    { id: 2, title: 'Advanced React Patterns', author_id: 1, tags: ['react', 'advanced'], deleted_at: null },
    { id: 3, title: 'Database Design Tips', author_id: 3, tags: ['database', 'sql'], deleted_at: '2024-01-15' },
    { id: 4, title: 'REST API Best Practices', author_id: 2, tags: ['api', 'rest', 'typescript'], deleted_at: null },
  ]);

  adapter.seed('messages', []);

  adapter.registerRpc('add', (args) => (args?.a ?? 0) + (args?.b ?? 0));
  adapter.registerRpc('greet', (args) => `Hello, ${args?.name ?? 'stranger'}!`);

  return createClient('', '', { adapter });
}

async function createAdapterClient(config: AdapterConfig) {
  if (config.type === 'mock') {
    return createSeededMockClient();
  }

  if (config.type === 'supabase') {
    const { SupabaseAdapter } = await import('@vibecode-db/client/adapters/supabase');
    const adapter = new SupabaseAdapter({
      supabaseUrl: config.supabaseUrl!,
      supabaseKey: config.supabaseKey!,
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
