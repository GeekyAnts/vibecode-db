import { vibecodeTable, col, defineSchema, createClient, type DBSpec } from '@vibecode-db/client'
import { SupabaseAdapter, CustomAdapter, createRESTHandlers } from '@vibecode-db/client'
import { SQLiteWebAdapter, type SQLiteWebAdapterOptions } from '@vibecode-db/sqlite-web'

// Define schema - just todos, users come from auth
export const todos = vibecodeTable('todos', {
  id: col.varchar().primaryKey().comment('Unique todo identifier (UUID)'),
  title: col.varchar({ length: 256 }).notNull().comment('Todo title'),
  completed: col.boolean().default(false).notNull().comment('Completion status'),
  created_at: col.timestamp().notNull().index().comment('Creation timestamp'),
  updated_at: col.timestamp().notNull().comment('Last update timestamp'),
  user_id: col.varchar().notNull().index().comment('Auth user ID (UUID)'),
})

export const db = defineSchema({ todos })

export const dbSpec: DBSpec<typeof db.zodBundle.shape> = {
  schema: db.zodBundle,
  relations: db.relations,
  seed: {
    todos: [],
  },
}

const which = import.meta.env.VITE_VIBECODE_ADAPTER as 'sqlite' | 'supabase' | 'custom'

// SQLite options
const sqliteOpts: SQLiteWebAdapterOptions = {
  wasmUrl: '/sql-wasm.wasm',
  migrations: db.migrations,
  enableForeignKeys: true,
  seedBehavior: 'upsert',
}

// Store DB adapter for auth to use
export let dbAdapter: SQLiteWebAdapter | null = null

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
      return new CustomAdapter(ctx, {
        handlers: createRESTHandlers({
          baseUrl: import.meta.env.VITE_CUSTOM_API_BASE_URL as string || 'https://jsonplaceholder.typicode.com',
          headers: () => ({ 'Content-Type': 'application/json' })
        }),
        onInit: async () => {
          console.log('✅ CustomAdapter connected')
        }
      })
    } else {
      // SQLite (browser) — sql.js
      dbAdapter = new SQLiteWebAdapter(ctx, sqliteOpts)
      return dbAdapter
    }
  },
})
