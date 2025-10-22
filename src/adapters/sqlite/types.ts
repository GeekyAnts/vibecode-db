// src/adapters/sqlite-wasm/types.ts
import type initSqlJs from 'sql.js'
import type { Database } from 'sql.js'
import type { RelationIndex } from '../../core/types'

export type SQLiteAdapterOptions = {
    // Supply a Database directly (skips WASM init). Useful for tests.
    db?: Database

    // Provide sql.js static or let the adapter init it.
    sqlJs?: ReturnType<typeof initSqlJs> extends Promise<infer T> ? T : any
    // Lifecycle
    migrations?: string[]
    enableForeignKeys?: boolean // default true
    seedBehavior?: 'upsert' | 'insertIgnore' | 'replace' // default 'upsert'

    platform?: 'auto' | 'web' | 'native'
    wasm?: { wasmUrl?: string }
    native?: { dbName?: string }

}
