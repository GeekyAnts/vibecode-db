// Public Surface
export { createClient } from './client/createClient'
export type { VibecodeClient } from './client/createClient'
export type { DatabaseAdapter } from './core/types'
export type { DBSpec, DBSeed } from './core/types'


export { RuntimeAdapter } from './adapters/runtime'
export { SupabaseAdapter } from './adapters/supabase'
