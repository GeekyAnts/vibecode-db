
import { vibecodeTable, t, references, defineSchema, createClient, RuntimeAdapter, SupabaseAdapter, type DBSpec } from '@vibecode-db/client'


export const users = vibecodeTable('users', {
  id: t.integer(),
  name: t.varchar(),
  email: t.varchar(),
})

export const todos = vibecodeTable('todos', {
  id: t.varchar(), // ok: your DB shows text for todos.id
  title: t.varchar({ length: 256 }),
  completed: t.boolean(),
  created_at: t.timestamp(),
  updated_at: t.timestamp(),
  user_id: references(t.integer('user_id'), () => users.id), // FK → users.id
})

// Assemble (FK type adoption happens here)
export const db = defineSchema({ users, todos })

export const dbSpec: DBSpec<typeof db.zodBundle.shape> = {
  schema: db.zodBundle,
  // optional seed for RuntimeAdapter 
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

