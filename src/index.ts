// Public Surface
export { createClient } from './client/createClient'
export type { VibecodeClient } from './client/createClient'
export type { DatabaseAdapter } from './core/types'
export type { DBSpec, DBSeed } from './core/types'

// Schema exports
export { vibecodeTable, col, references, defineSchema } from './schema'

export { RuntimeAdapter } from './adapters/runtime'
export { SupabaseAdapter } from './adapters/supabase'
