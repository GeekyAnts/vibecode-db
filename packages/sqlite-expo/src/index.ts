import { BaseSQLiteAdapter } from '@vibecode-db/sqlite-core'
import type { SqlDriver } from '@vibecode-db/sqlite-core'
import type { DBSpec } from '@vibecode-db/client'
import { BaseSQLiteAdapterOptions, wipeDatabase } from '@vibecode-db/sqlite-core'
import { SQLExpoDriver } from './sqlexpo-driver'
import * as SQLite from 'expo-sqlite'

// typed import to satisfy TS, but use dynamic import at runtime

export type SQLiteExpoAdapterOptions = BaseSQLiteAdapterOptions & {
    dbName: string,
    resetOnStart?: boolean
}

export class SQLiteExpoAdapter extends BaseSQLiteAdapter {
    constructor(dbSpec: DBSpec<any>, private expoOpts: SQLiteExpoAdapterOptions) {
        super(dbSpec, expoOpts)
        this.validateOpts()
        this.ready = this.init()
    }
    private validateOpts() {
        if (!this.expoOpts.dbName) {
            throw new Error('dbName is required')
        }
    }

    protected async initDriver(): Promise<SqlDriver> {
        const db = await SQLite.openDatabaseAsync(this.expoOpts.dbName)

        // Single exec bridge for our NativeDriver
        const exec = async (sql: string, params?: unknown[]) => {
            const isSelect = /^\s*select\b/i.test(sql)
            if (isSelect) {
                const rows = await db.getAllAsync(sql, params as any)
                return { rows } // matches your NativeDriver's expectation
            } else {
                await db.runAsync(sql, params as any)
                return { rows: [] }
            }
        }

        const expoDriver = new SQLExpoDriver(exec)
        if (this.expoOpts.resetOnStart) {
            await wipeDatabase(expoDriver)
        }
        return expoDriver
    }
}
