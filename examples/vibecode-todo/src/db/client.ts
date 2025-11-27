
import { vibecodeTable, col, references, defineSchema, createClient, type DBSpec } from '@vibecode-db/client'
import { SupabaseAdapter } from '@vibecode-db/client'
import { SQLiteWebAdapter, type SQLiteWebAdapterOptions } from '@vibecode-db/sqlite-web'
import { CustomAdapter, createRESTHandlers } from '@vibecode-db/client'

export const users = vibecodeTable('users', {
  id: col.integer().primaryKey().autoIncrement().comment('Unique user identifier'),
  name: col.varchar().notNull().comment('User full name'),
  email: col.varchar().unique().notNull().comment('User email address'),
})

export const todos = vibecodeTable('todos', {
  id: col.varchar().primaryKey().comment('Unique todo identifier (UUID)'),
  title: col.varchar({ length: 256 }).notNull().comment('Todo title'),
  completed: col.boolean().default(false).notNull().comment('Completion status'),
  created_at: col.timestamp().notNull().index().comment('Creation timestamp'),
  updated_at: col.timestamp().notNull().comment('Last update timestamp'),
  user_id: references(
    col.integer('user_id').notNull().onDelete('CASCADE').index(),
    () => users.id
  ),
})

export const db = defineSchema({ users, todos })

export const dbSpec: DBSpec<typeof db.zodBundle.shape> = {
  schema: db.zodBundle,
  relations: db.relations,
  // Removed hardcoded users - they'll come from auth
  seed: {
    todos: [],
  },
}


const which = import.meta.env.VITE_VIBECODE_ADAPTER as 'sqlite' | 'supabase' | 'custom'

// Shared options for SQLite WASM
const sqliteOpts: SQLiteWebAdapterOptions = {
  wasmUrl: 'node_modules/sql.js/dist/sql-wasm.wasm',  // served from /public
  migrations: db.migrations,  // Auto-generated from schema!
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

