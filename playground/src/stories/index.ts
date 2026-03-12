export type AdapterType = 'mock' | 'supabase' | 'pocketbase' | 'rest';

export interface Story {
  id: string;
  title: string;
  category: string;
  type: 'doc' | 'example';
  adapter?: AdapterType;
  description: string;
  /** Code for example stories */
  code?: string;
  /** Markdown content for doc stories */
  content?: string;
}

export const stories: Story[] = [
  // ── Getting Started ───────────────────────────────
  {
    id: 'doc-intro',
    title: 'Introduction',
    category: 'Getting Started',
    type: 'doc',
    description: 'What is vibecode-db and why use it.',
    content: `# vibecode-db

A universal database SDK that provides a **1:1 Supabase-compatible API** on the frontend, but delegates to swappable backend adapters.

## Why?

Use the familiar Supabase DX while targeting **any** backend:

- **Mock** - In-memory, perfect for dev & testing
- **Supabase** - Passthrough to \`@supabase/supabase-js\`
- **PocketBase** - Translates queries to PocketBase API
- **REST** - Maps to conventional REST endpoints

## How it works

\`\`\`
User code:  client.from('users').select('*').eq('status', 'active')
               ↓
Query Builder:  Accumulates a QueryDescriptor object
               ↓
await / .then():  Dispatches descriptor to adapter
               ↓
Adapter:  Translates QueryDescriptor → backend-native calls
\`\`\`

The query builder implements \`PromiseLike\` - chained methods build up a descriptor, execution happens only on \`await\`.

## Quick Start

\`\`\`typescript
import { createClient } from 'vibecode-db';
import { MockAdapter } from 'vibecode-db/adapters/mock';

const adapter = new MockAdapter();
const client = createClient('', '', { adapter });

const { data, error } = await client
  .from('users')
  .select('*')
  .eq('status', 'active')
  .limit(10);
\`\`\`

> Try the examples in the sidebar to see it in action!
`,
  },
  {
    id: 'doc-install',
    title: 'Installation',
    category: 'Getting Started',
    type: 'doc',
    description: 'How to install and set up vibecode-db.',
    content: `# Installation

## Install the package

\`\`\`bash
npm install vibecode-db
# or
pnpm add vibecode-db
\`\`\`

## Peer dependencies

Install only the adapter(s) you need:

| Adapter | Peer dependency | Install command |
|---------|----------------|-----------------|
| Mock | *none* | - |
| Supabase | \`@supabase/supabase-js ^2.0\` | \`npm i @supabase/supabase-js\` |
| PocketBase | \`pocketbase ^0.21.0\` | \`npm i pocketbase\` |
| REST | *none* | - |

## Module format

The package ships as **ESM + CJS** dual output with full TypeScript declarations:

\`\`\`typescript
// ESM
import { createClient } from 'vibecode-db';
import { MockAdapter } from 'vibecode-db/adapters/mock';

// CJS
const { createClient } = require('vibecode-db');
const { MockAdapter } = require('vibecode-db/adapters/mock');
\`\`\`

## Tree-shakeable adapter imports

Each adapter is a separate entry point, so unused adapters are never bundled:

\`\`\`typescript
import { MockAdapter } from 'vibecode-db/adapters/mock';
import { SupabaseAdapter } from 'vibecode-db/adapters/supabase';
import { PocketBaseAdapter } from 'vibecode-db/adapters/pocketbase';
import { RestAdapter } from 'vibecode-db/adapters/rest';
\`\`\`
`,
  },
  {
    id: 'doc-create-client',
    title: 'Creating a Client',
    category: 'Getting Started',
    type: 'doc',
    description: 'How to create and configure a vibecode-db client.',
    content: `# Creating a Client

## \`createClient(url, key, options)\`

| Parameter | Type | Description |
|-----------|------|-------------|
| \`url\` | \`string\` | Backend URL (ignored by MockAdapter) |
| \`key\` | \`string\` | API key (ignored by MockAdapter) |
| \`options.adapter\` | \`DatabaseAdapter\` | The adapter instance |

\`\`\`typescript
import { createClient } from 'vibecode-db';
import { MockAdapter } from 'vibecode-db/adapters/mock';

const client = createClient('', '', {
  adapter: new MockAdapter()
});
\`\`\`

## Client API

The client exposes the following properties and methods:

| API | Description |
|-----|-------------|
| \`client.from(table)\` | Start a query on a table |
| \`client.rpc(fn, args)\` | Call a server-side function |
| \`client.auth\` | Authentication operations |
| \`client.storage\` | File storage (buckets & files) |
| \`client.realtime\` | Realtime subscriptions |
| \`client.channel(name)\` | Shorthand for realtime channel |
| \`client.functions\` | Edge function invocations |

## Query Builder Chain

All query methods return chainable builders:

\`\`\`typescript
const { data, error } = await client
  .from('users')        // returns QueryBuilderSelect
  .select('id, name')   // returns TransformBuilder
  .eq('status', 'active') // returns TransformBuilder (FilterBuilder)
  .order('name')        // returns TransformBuilder
  .limit(10);           // returns TransformBuilder
  // await triggers execution via adapter
\`\`\`
`,
  },

  // ── Adapters ──────────────────────────────────────
  {
    id: 'doc-mock-adapter',
    title: 'Mock Adapter',
    category: 'Adapters',
    type: 'doc',
    description: 'In-memory adapter for development and testing.',
    content: `# Mock Adapter

The \`MockAdapter\` stores everything in memory. Perfect for frontend development, unit tests, prototyping, and this playground.

## Setup

\`\`\`typescript
import { createClient } from 'vibecode-db';
import { MockAdapter } from 'vibecode-db/adapters/mock';

const adapter = new MockAdapter();
const client = createClient('', '', { adapter });
\`\`\`

## Seeding data

\`\`\`typescript
adapter.seed('users', [
  { id: 1, name: 'Alice', age: 30, status: 'active' },
  { id: 2, name: 'Bob', age: 25, status: 'inactive' },
]);
\`\`\`

## Registering RPC functions

\`\`\`typescript
adapter.registerRpc('add', (args) => args.a + args.b);
adapter.registerRpc('greet', (args) => \`Hello, \${args.name}!\`);
\`\`\`

## Resetting state

\`\`\`typescript
adapter.reset(); // Clears all tables, RPCs, auth, storage, realtime
\`\`\`

## Features

- Full CRUD with in-memory filter/sort/paginate engine
- Auto-generated IDs for inserts without explicit \`id\`
- Auth with in-memory user store (sign up, sign in, sessions)
- Storage with in-memory file store (buckets, upload, download)
- Realtime via EventEmitter (auto-fires on CRUD operations)
- \`.or()\` filter parsing (PostgREST syntax)
- \`.single()\` / \`.maybeSingle()\` semantics matching Supabase
`,
  },
  {
    id: 'doc-supabase-adapter',
    title: 'Supabase Adapter',
    category: 'Adapters',
    type: 'doc',
    description: 'Passthrough adapter for Supabase backends.',
    content: `# Supabase Adapter

A thin passthrough to \`@supabase/supabase-js\`. It translates the \`QueryDescriptor\` back into native Supabase client calls.

## Install peer dependency

\`\`\`bash
npm install @supabase/supabase-js
\`\`\`

## Setup

\`\`\`typescript
import { createClient } from 'vibecode-db';
import { SupabaseAdapter } from 'vibecode-db/adapters/supabase';

const adapter = new SupabaseAdapter({
  supabaseUrl: 'https://xxx.supabase.co',
  supabaseKey: 'your-anon-key',
});

const client = createClient(url, key, { adapter });
\`\`\`

## Using an existing Supabase client

\`\`\`typescript
import { createClient as createSupabase } from '@supabase/supabase-js';

const supabase = createSupabase(url, key);

const adapter = new SupabaseAdapter({
  supabaseUrl: url,
  supabaseKey: key,
  client: supabase, // reuse existing instance
});
\`\`\`

## Options

| Option | Type | Description |
|--------|------|-------------|
| \`supabaseUrl\` | \`string\` | Your Supabase project URL |
| \`supabaseKey\` | \`string\` | Your anon or service role key |
| \`client\` | \`SupabaseClient\` | Optional existing client instance |

> Use the adapter switcher above to try this with a real Supabase project.
`,
  },
  {
    id: 'doc-pocketbase-adapter',
    title: 'PocketBase Adapter',
    category: 'Adapters',
    type: 'doc',
    description: 'Adapter for PocketBase backends.',
    content: `# PocketBase Adapter

Translates vibecode-db queries to PocketBase SDK calls, handling the API differences automatically.

## Install peer dependency

\`\`\`bash
npm install pocketbase
\`\`\`

## Setup

\`\`\`typescript
import { createClient } from 'vibecode-db';
import { PocketBaseAdapter } from 'vibecode-db/adapters/pocketbase';

const adapter = new PocketBaseAdapter({
  url: 'http://127.0.0.1:8090',
});

const client = createClient('', '', { adapter });
\`\`\`

## Using an existing PocketBase client

\`\`\`typescript
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
const adapter = new PocketBaseAdapter({ client: pb });
\`\`\`

## Filter translation

Filters are automatically translated to PocketBase syntax:

| vibecode-db | PocketBase |
|-------------|-----------|
| \`.eq('name', 'Alice')\` | \`name = "Alice"\` |
| \`.neq('status', 'banned')\` | \`status != "banned"\` |
| \`.gt('age', 18)\` | \`age > 18\` |
| \`.gte('age', 18)\` | \`age >= 18\` |
| \`.like('name', '%ali%')\` | \`name ~ "%ali%"\` |
| \`.is('deleted_at', null)\` | \`deleted_at = null\` |

## Important notes

- **Update/Delete**: PocketBase requires record IDs. The adapter first queries matching records, then applies mutations individually.
- **Storage**: PocketBase uses file fields on records rather than a separate storage API. The storage adapter methods return "not supported" errors.
`,
  },
  {
    id: 'doc-rest-adapter',
    title: 'REST Adapter',
    category: 'Adapters',
    type: 'doc',
    description: 'Adapter for conventional REST APIs.',
    content: `# REST Adapter

Maps vibecode-db queries to standard REST endpoint conventions. No peer dependencies required.

## Setup

\`\`\`typescript
import { createClient } from 'vibecode-db';
import { RestAdapter } from 'vibecode-db/adapters/rest';

const adapter = new RestAdapter({
  baseUrl: 'https://api.example.com',
  headers: {
    Authorization: 'Bearer your-token',
  },
});

const client = createClient('', '', { adapter });
\`\`\`

## Endpoint mapping

| Operation | HTTP Method | URL |
|-----------|-------------|-----|
| \`select('*')\` | \`GET\` | \`/table?filters\` |
| \`insert(data)\` | \`POST\` | \`/table\` |
| \`update(data).eq('id', x)\` | \`PATCH\` | \`/table/x\` |
| \`delete().eq('id', x)\` | \`DELETE\` | \`/table/x\` |
| \`upsert(data)\` | \`PUT\` | \`/table\` |
| \`rpc('fn', args)\` | \`POST\` | \`/rpc/fn\` |

## Options

| Option | Type | Description |
|--------|------|-------------|
| \`baseUrl\` | \`string\` | Base URL for the REST API |
| \`headers\` | \`Record<string, string>\` | Default headers for all requests |
| \`fetch\` | \`typeof fetch\` | Custom fetch function (defaults to global) |

## Custom fetch

\`\`\`typescript
const adapter = new RestAdapter({
  baseUrl: 'https://api.example.com',
  fetch: myCustomFetch,
});
\`\`\`
`,
  },

  // ── CRUD ──────────────────────────────────────────
  {
    id: 'select-all',
    title: 'Select All Rows',
    category: 'CRUD',
    type: 'example',
    description: 'Fetch all rows from a table.',
    code: `const { data, error } = await client
  .from('users')
  .select('*');

return { data, error };`,
  },
  {
    id: 'select-columns',
    title: 'Select Specific Columns',
    category: 'CRUD',
    type: 'example',
    description: 'Fetch only specific columns.',
    code: `const { data, error } = await client
  .from('users')
  .select('id, name, email');

return { data, error };`,
  },
  {
    id: 'select-single',
    title: 'Select Single Row',
    category: 'CRUD',
    type: 'example',
    description: 'Fetch a single row by ID.',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .eq('id', 1)
  .single();

return { data, error };`,
  },
  {
    id: 'select-maybe-single',
    title: 'Select Maybe Single',
    category: 'CRUD',
    type: 'example',
    description: 'Fetch a single row, returning null if not found (no error).',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .eq('id', 999)
  .maybeSingle();

return { data, error };`,
  },
  {
    id: 'insert-single',
    title: 'Insert a Row',
    category: 'CRUD',
    type: 'example',
    description: 'Insert a new record into a table.',
    code: `const { data, error } = await client
  .from('users')
  .insert({
    name: 'Diana Prince',
    email: 'diana@example.com',
    age: 30,
    status: 'active',
  });

return { data, error };`,
  },
  {
    id: 'insert-multiple',
    title: 'Insert Multiple Rows',
    category: 'CRUD',
    type: 'example',
    description: 'Batch insert multiple records.',
    code: `const { data, error } = await client
  .from('users')
  .insert([
    { name: 'Eve', email: 'eve@example.com', age: 22, status: 'active' },
    { name: 'Frank', email: 'frank@example.com', age: 45, status: 'inactive' },
  ]);

return { data, error };`,
  },
  {
    id: 'update',
    title: 'Update Rows',
    category: 'CRUD',
    type: 'example',
    description: 'Update records matching a filter.',
    code: `const { data, error } = await client
  .from('users')
  .update({ status: 'suspended' })
  .eq('id', 2);

return { data, error };`,
  },
  {
    id: 'upsert',
    title: 'Upsert a Row',
    category: 'CRUD',
    type: 'example',
    description: 'Insert or update based on conflict column.',
    code: `const { data, error } = await client
  .from('users')
  .upsert(
    { id: 1, name: 'Alice (Updated)', email: 'alice-new@example.com', age: 31, status: 'active' },
    { onConflict: 'id' }
  );

return { data, error };`,
  },
  {
    id: 'delete',
    title: 'Delete Rows',
    category: 'CRUD',
    type: 'example',
    description: 'Delete records matching a filter.',
    code: `const { data, error } = await client
  .from('users')
  .delete()
  .eq('id', 3);

return { data, error };`,
  },

  // ── Filters ───────────────────────────────────────
  {
    id: 'filter-eq',
    title: 'Equal (eq)',
    category: 'Filters',
    type: 'example',
    description: 'Filter rows where a column equals a value.',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .eq('status', 'active');

return { data, error };`,
  },
  {
    id: 'filter-neq',
    title: 'Not Equal (neq)',
    category: 'Filters',
    type: 'example',
    description: 'Filter rows where a column does not equal a value.',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .neq('status', 'active');

return { data, error };`,
  },
  {
    id: 'filter-gt-lt',
    title: 'Greater Than / Less Than',
    category: 'Filters',
    type: 'example',
    description: 'Filter rows with comparison operators.',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .gt('age', 25)
  .lte('age', 35);

return { data, error };`,
  },
  {
    id: 'filter-like',
    title: 'Pattern Match (like)',
    category: 'Filters',
    type: 'example',
    description: 'Filter with SQL LIKE pattern matching.',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .like('name', '%li%');

return { data, error };`,
  },
  {
    id: 'filter-in',
    title: 'In Array (in)',
    category: 'Filters',
    type: 'example',
    description: 'Filter where column value is in a list.',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .in('id', [1, 3]);

return { data, error };`,
  },
  {
    id: 'filter-is-null',
    title: 'Is Null',
    category: 'Filters',
    type: 'example',
    description: 'Filter rows where a column is null.',
    code: `const { data, error } = await client
  .from('posts')
  .select('*')
  .is('deleted_at', null);

return { data, error };`,
  },
  {
    id: 'filter-or',
    title: 'OR Filter',
    category: 'Filters',
    type: 'example',
    description: 'Combine filters with OR logic (PostgREST syntax).',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .or('age.gt.30,status.eq.inactive');

return { data, error };`,
  },
  {
    id: 'filter-not',
    title: 'Negated Filter (not)',
    category: 'Filters',
    type: 'example',
    description: 'Negate a filter condition.',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .not('status', 'eq', 'inactive');

return { data, error };`,
  },
  {
    id: 'filter-match',
    title: 'Match Multiple (match)',
    category: 'Filters',
    type: 'example',
    description: 'Filter by matching multiple column values.',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .match({ status: 'active', age: 30 });

return { data, error };`,
  },
  {
    id: 'filter-contains',
    title: 'Array Contains',
    category: 'Filters',
    type: 'example',
    description: 'Filter where an array column contains all specified values.',
    code: `const { data, error } = await client
  .from('posts')
  .select('*')
  .contains('tags', ['typescript']);

return { data, error };`,
  },

  // ── Transforms ────────────────────────────────────
  {
    id: 'order-asc',
    title: 'Order Ascending',
    category: 'Transforms',
    type: 'example',
    description: 'Sort results by a column in ascending order.',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .order('name', { ascending: true });

return { data, error };`,
  },
  {
    id: 'order-desc',
    title: 'Order Descending',
    category: 'Transforms',
    type: 'example',
    description: 'Sort results by a column in descending order.',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .order('age', { ascending: false });

return { data, error };`,
  },
  {
    id: 'limit',
    title: 'Limit Results',
    category: 'Transforms',
    type: 'example',
    description: 'Limit the number of returned rows.',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .limit(2);

return { data, error };`,
  },
  {
    id: 'range',
    title: 'Range (Pagination)',
    category: 'Transforms',
    type: 'example',
    description: 'Paginate results with range.',
    code: `const { data, error } = await client
  .from('users')
  .select('*')
  .range(1, 2);

return { data, error };`,
  },
  {
    id: 'combined',
    title: 'Combined Query',
    category: 'Transforms',
    type: 'example',
    description: 'Combine filters, ordering, and pagination.',
    code: `const { data, error } = await client
  .from('users')
  .select('id, name, age')
  .eq('status', 'active')
  .order('age', { ascending: false })
  .limit(2);

return { data, error };`,
  },

  // ── Auth ──────────────────────────────────────────
  {
    id: 'auth-signup',
    title: 'Sign Up',
    category: 'Auth',
    type: 'example',
    description: 'Register a new user.',
    code: `const { data, error } = await client.auth.signUp({
  email: 'newuser@example.com',
  password: 'password123',
});

return { data, error };`,
  },
  {
    id: 'auth-signin',
    title: 'Sign In',
    category: 'Auth',
    type: 'example',
    description: 'Sign in and then check the session.',
    code: `// First sign up
await client.auth.signUp({
  email: 'user@example.com',
  password: 'secret123',
});

// Sign out, then sign back in
await client.auth.signOut();

const { data, error } = await client.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secret123',
});

return { data, error };`,
  },
  {
    id: 'auth-session',
    title: 'Get Session',
    category: 'Auth',
    type: 'example',
    description: 'Get the current auth session.',
    code: `await client.auth.signUp({
  email: 'session@example.com',
  password: 'pass',
});

const { data, error } = await client.auth.getSession();

return { data, error };`,
  },
  {
    id: 'auth-signout',
    title: 'Sign Out',
    category: 'Auth',
    type: 'example',
    description: 'Sign out the current user.',
    code: `await client.auth.signUp({
  email: 'bye@example.com',
  password: 'pass',
});

await client.auth.signOut();

const { data } = await client.auth.getSession();

return { signedOut: data.session === null };`,
  },

  // ── Storage ───────────────────────────────────────
  {
    id: 'storage-bucket',
    title: 'Create & List Buckets',
    category: 'Storage',
    type: 'example',
    description: 'Create buckets and list them.',
    code: `await client.storage.createBucket('avatars', { public: true });
await client.storage.createBucket('documents');

const { data, error } = await client.storage.listBuckets();

return { data, error };`,
  },
  {
    id: 'storage-upload',
    title: 'Upload & Download',
    category: 'Storage',
    type: 'example',
    description: 'Upload a file and download it back.',
    code: `await client.storage.createBucket('files');

await client.storage.from('files').upload(
  'hello.txt',
  'Hello, World!'
);

const { data: blob } = await client.storage
  .from('files')
  .download('hello.txt');

const text = blob ? await blob.text() : null;

return { downloadedContent: text };`,
  },
  {
    id: 'storage-list',
    title: 'List Files',
    category: 'Storage',
    type: 'example',
    description: 'Upload files and list them.',
    code: `await client.storage.createBucket('docs');

await client.storage.from('docs').upload('readme.md', '# Hello');
await client.storage.from('docs').upload('guide.md', '# Guide');
await client.storage.from('docs').upload('api.md', '# API');

const { data, error } = await client.storage.from('docs').list();

return { data, error };`,
  },
  {
    id: 'storage-public-url',
    title: 'Get Public URL',
    category: 'Storage',
    type: 'example',
    description: 'Get the public URL for a file.',
    code: `await client.storage.createBucket('images', { public: true });
await client.storage.from('images').upload('photo.jpg', 'binary-data');

const { data } = client.storage.from('images').getPublicUrl('photo.jpg');

return { publicUrl: data.publicUrl };`,
  },

  // ── Realtime ──────────────────────────────────────
  {
    id: 'realtime-insert',
    title: 'Listen for Inserts',
    category: 'Realtime',
    type: 'example',
    description: 'Subscribe to INSERT events and trigger one.',
    code: `const events = [];

client
  .channel('test')
  .on('postgres_changes',
    { event: 'INSERT', table: 'messages' },
    (payload) => events.push(payload)
  )
  .subscribe();

await client.from('messages').insert({ text: 'Hello realtime!' });
await client.from('messages').insert({ text: 'Second message' });

return { receivedEvents: events.length, events };`,
  },
  {
    id: 'realtime-all',
    title: 'Listen for All Changes',
    category: 'Realtime',
    type: 'example',
    description: 'Subscribe to all change events on a table.',
    code: `const events = [];

client
  .channel('all-changes')
  .on('postgres_changes',
    { event: '*', table: 'messages' },
    (payload) => events.push({
      type: payload.eventType,
      new: payload.new,
      old: payload.old,
    })
  )
  .subscribe();

await client.from('messages').insert({ id: 1, text: 'created' });
await client.from('messages').update({ text: 'updated' }).eq('id', 1);
await client.from('messages').delete().eq('id', 1);

return { events };`,
  },

  // ── RPC ───────────────────────────────────────────
  {
    id: 'rpc-call',
    title: 'Call RPC Function',
    category: 'RPC',
    type: 'example',
    description: 'Call a registered server-side function.',
    code: `// The mock adapter has a pre-registered "add" function
const { data, error } = await client.rpc('add', { a: 10, b: 25 });

return { data, error };`,
  },
  {
    id: 'rpc-greeting',
    title: 'RPC with String Result',
    category: 'RPC',
    type: 'example',
    description: 'Call an RPC that returns a greeting string.',
    code: `// The mock adapter has a pre-registered "greet" function
const { data, error } = await client.rpc('greet', { name: 'World' });

return { data, error };`,
  },
];

export const categories = [...new Set(stories.map((s) => s.category))];
