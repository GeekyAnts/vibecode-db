
import { vibecodeTable, col, references, defineSchema, createClient, RuntimeAdapter, SupabaseAdapter, type DBSpec } from '@vibecode-db/client'


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


const which = import.meta.env.VITE_VIBECODE_ADAPTER as 'runtime' | 'supabase'

export const vibecode = createClient({
  dbSpec,
  adapter: (ctx: any) =>
    which === 'supabase'
      ? new SupabaseAdapter(ctx, {
        url: import.meta.env.VITE_SUPABASE_URL as string,
        key: import.meta.env.VITE_SUPABASE_ANON_KEY as string
      })
      : new RuntimeAdapter(ctx),
})

