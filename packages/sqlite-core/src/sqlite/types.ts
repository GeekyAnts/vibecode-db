// src/adapters/sqlite-wasm/types.ts
import type initSqlJs from 'sql.js'
import type { Database } from 'sql.js'

export type BaseSQLiteAdapterOptions = {
    migrations?: string[]
    enableForeignKeys?: boolean
    seedBehavior?: 'upsert' | 'insertIgnore' | 'replace'
}

