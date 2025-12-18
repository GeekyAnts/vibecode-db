import { vibecodeTable, col, defineSchema, createClient, type DBSpec } from '@vibecode-db/client'
import { supabaseAdapter, CustomAdapter, createRESTHandlers } from '@vibecode-db/client'
import { sqliteWebAdapter } from '@vibecode-db/sqlite-web'

// Define schema - just todos, users come from auth
export const todos = vibecodeTable('todos', {
  id: col.varchar().primaryKey().comment('Unique todo identifier (UUID)'),
  title: col.varchar({ length: 256 }).notNull().comment('Todo title'),
  completed: col.boolean().notNull().comment('Completion status'),
  created_at: col.timestamp().notNull().index().comment('Creation timestamp'),
  updated_at: col.timestamp().notNull().index().comment('Last update timestamp'),
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

// Build the client with unified adapter
export const vibecode = createClient({
  dbSpec,
  adapter: which === 'supabase'
    ? supabaseAdapter({
        url: import.meta.env.VITE_SUPABASE_URL as string,
        key: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        auth: {}, // Enable auth (uses browser localStorage by default)
      })
    : which === 'custom'
    ? (ctx) => new CustomAdapter(ctx, {
        handlers: createRESTHandlers({
          baseUrl: import.meta.env.VITE_CUSTOM_API_BASE_URL as string || 'https://jsonplaceholder.typicode.com',
          headers: () => ({ 'Content-Type': 'application/json' })
        }),
        onInit: async () => {
          console.log('✅ CustomAdapter connected')
        }
      })
    : // SQLite (browser) — sql.js with auth
      sqliteWebAdapter({
        wasmUrl: '/sql-wasm.wasm',
        migrations: db.migrations,
        enableForeignKeys: true,
        seedBehavior: 'upsert',
        auth: {
          jwtSecret: import.meta.env.VITE_JWT_SECRET || 'dev-secret-key-change-in-production',
        }
      })
})
