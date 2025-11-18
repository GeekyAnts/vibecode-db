
import { vibecodeTable, col, references, defineSchema, createClient, type DBSpec } from '@vibecode-db/client'
import { SupabaseAdapter } from '@vibecode-db/client'
import { SQLiteWebAdapter, type SQLiteWebAdapterOptions } from '@vibecode-db/sqlite-web'
import { CustomAdapter, createRESTHandlers } from '@vibecode-db/client'

export const users = vibecodeTable('users', {
  id: col.integer(),
  name: col.varchar(),
  email: col.varchar(),
})

export const todos = vibecodeTable('todos', {
  id: col.varchar(),
  title: col.varchar({ length: 256 }),
  completed: col.boolean(),
  created_at: col.timestamp(),
  updated_at: col.timestamp(),
  user_id: references(col.integer('user_id'), () => users.id),
})

export const db = defineSchema({ users, todos })

export const dbSpec: DBSpec<typeof db.zodBundle.shape> = {
  schema: db.zodBundle,
  relations: db.relations,
  seed: {
    users: [
      { id: 1, name: 'Ada', email: 'ada@example.com' },
      { id: 2, name: 'Alan', email: 'alan@example.com' },
    ],
    todos: [
      {
        id: 't1',
        title: 'Wire the UI',
        completed: false,
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  },
}


const which = import.meta.env.VITE_VIBECODE_ADAPTER as 'sqlite' | 'supabase' | 'custom'

// SQLite migrations (DDL) — run once in the WASM DB
const migrations: string[] = [
  // users
  `CREATE TABLE IF NOT EXISTS "users" (
     "id"      INTEGER PRIMARY KEY,
     "name"    TEXT,
     "email"   TEXT
   );`,

  // todos + FK → users.id
  `CREATE TABLE IF NOT EXISTS "todos" (
     "id"          TEXT PRIMARY KEY,
     "title"       TEXT,
     "completed"   INTEGER,
     "created_at"  TEXT,
     "updated_at"  TEXT,
     "user_id"     INTEGER, 
     FOREIGN KEY("user_id") REFERENCES "users"("id")
   );`,

  // (optional) helpful index
  `CREATE INDEX IF NOT EXISTS "todos_created_at_idx" ON "todos" ("created_at");`
]

// Shared options for SQLite WASM
const sqliteOpts: SQLiteWebAdapterOptions = {
  wasmUrl: 'node_modules/sql.js/dist/sql-wasm.wasm',  // served from /public
  migrations,
  enableForeignKeys: true,
  seedBehavior: 'upsert',     // upsert seeds on first load
}

// Build the client
export const vibecode = createClient({
  dbSpec,
  adapter: (ctx) => {
    if (which === 'supabase') {
      return new SupabaseAdapter(ctx, {
        url: import.meta.env.VITE_SUPABASE_URL as string,
        key: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      })
    } else if (which === 'custom') {
      // CustomAdapter: Connect to your own REST API backend
      return new CustomAdapter(ctx, {
        handlers: createRESTHandlers({
          baseUrl: import.meta.env.VITE_CUSTOM_API_BASE_URL as string || 'https://jsonplaceholder.typicode.com',
          headers: () => ({
            'Content-Type': 'application/json'
          })
        }),
        onInit: async () => {
          console.log('✅ CustomAdapter connected to:', import.meta.env.VITE_CUSTOM_API_BASE_URL || 'JSONPlaceholder API')
        }
      })
    } else {
      // SQLite (browser) — sql.js in-memory
      const adapter = new SQLiteWebAdapter(ctx, sqliteOpts)

      // (Optional) expose for quick dev/debug:
      // @ts-expect-error dev-only
      window.__vcode_sqlite = adapter
      return adapter
    }
  },
})

