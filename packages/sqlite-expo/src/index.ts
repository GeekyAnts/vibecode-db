import { BaseSQLiteAdapter } from '@vibecode-db/sqlite-core'
import type { SqlDriver } from '@vibecode-db/sqlite-core'
import type { DBSpec } from '@vibecode-db/client'
import { BaseSQLiteAdapterOptions } from '@vibecode-db/sqlite-core'
import { SQLExpoDriver } from './sqlexpo-driver'
// typed import to satisfy TS, but use dynamic import at runtime
type ExpoSQLite = typeof import('expo-sqlite')

export type SQLiteExpoOptions = BaseSQLiteAdapterOptions & {
    dbName?: string

}

export class SQLiteAdapter extends BaseSQLiteAdapter {
    constructor(dbSpec: DBSpec<any>, private expoOpts: SQLiteExpoOptions = {}) {
        super(dbSpec, expoOpts)
        this.validateOpts()
    }
    private validateOpts() {
        if (!this.expoOpts.dbName) {
            throw new Error('dbName is required')
        }
    }

    protected async initDriver(): Promise<SqlDriver> {
        const Expo: ExpoSQLite = await (new Function('m', 'return import(m)'))('expo-sqlite')
        const db = await Expo.openDatabaseAsync(this.expoOpts.dbName ?? 'app.db')

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

        return new SQLExpoDriver(exec)
    }
}
export type { SQLiteExpoOptions as SQLiteAdapterOptions }
