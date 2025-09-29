import { z } from 'zod'
import { createClient } from 'vibecode-db'
import { FakeAdapter } from 'vibecode-db/adapters/fake'
import { SupabaseAdapter } from 'vibecode-db/adapters/supabase'
import type { DBSpec } from 'vibecode-db'

// 1) Schema (single table for todos)
export const DBSchema = z.object({
  todos: z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean(),
    created_at: z.date(),
    updated_at: z.date(),
  }),
})

// 2) Seed (used by FakeAdapter only)
const seed: DBSpec<typeof DBSchema.shape>['seed'] = {
  todos: [
    {
      id: 't1',
      title: 'Try vibecode-db (FakeAdapter)',
      completed: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 't2',
      title: 'Switch to SupabaseAdapter with one flag',
      completed: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
}

// 3) DBSpec wrapper
const dbSpec: DBSpec<typeof DBSchema.shape> = {
  schema: DBSchema,
  seed,
  meta: { app: 'todo-example' },
}

// 4) Adapter switch via env
const which = import.meta.env.VITE_VIBECODE_ADAPTER as 'fake' | 'supabase'

export const vibecode = createClient({
  dbSpec,
  adapter: (ctx) => {
    if (which === 'supabase') {
      const url = import.meta.env.VITE_SUPABASE_URL as string
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
      return new SupabaseAdapter(ctx, { url, key })
    }
    return new FakeAdapter(ctx)
  },
})
