// src/adapters/sqlite-wasm/types.ts
import type initSqlJs from 'sql.js'
import type { Database } from 'sql.js'
import type { RelationIndex } from '../../core/types'

export type SQLiteWasmAdapterOptions = {
    // Supply a Database directly (skips WASM init). Useful for tests.
    db?: Database

    // Provide sql.js static or let the adapter init it.
    sqlJs?: ReturnType<typeof initSqlJs> extends Promise<infer T> ? T : any

    // Where to load sql-wasm.wasm from (used by initSqlJs locateFile)
    wasmUrl?: string

    // Lifecycle
    migrations?: string[]
    enableForeignKeys?: boolean // default true
    seedBehavior?: 'upsert' | 'insertIgnore' | 'replace' // default 'upsert'

}
