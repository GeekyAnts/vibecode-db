// Public Surface
export { createClient } from './client/createClient'
export type { VibecodeClient } from './client/createClient'
export type { DatabaseAdapter } from './core/types'
export type { DBSpec, DBSeed } from './core/types'

// Schema exports
export { vibecodeTable, col, references, defineSchema } from './schema'

export { RuntimeAdapter } from './adapters/runtime'
export { SupabaseAdapter } from './adapters/supabase'
export { SQLiteWasmAdapter } from './adapters/sqliteWasm'
export type { SQLiteWasmAdapterOptions } from './adapters/sqliteWasm/types'

export { parseProjection } from './core/projectionUtil'
export { buildWhere } from './core/sql-utils/buildWhere'
export { buildOrder, buildLimitRange, buildModifiers } from './core/sql-utils/buildModifiers'
export { buildInsert } from './core/sql-utils/buildInsert'
export { buildUpdate } from './core/sql-utils/buildUpdate'
export { buildDelete } from './core/sql-utils/buildDelete'
export { buildSelect, buildSelectAndJoins } from './core/sql-utils/buildSelect'
