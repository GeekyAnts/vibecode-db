import initSqlJs from 'sql.js'
import { SqlJsDriver } from './sqljs-driver'
import { BaseSQLiteAdapter } from '@vibecode-db/sqlite-core'
import type { SqlDriver } from '@vibecode-db/sqlite-core'
import type { DBSpec } from '@vibecode-db/client'
import { BaseSQLiteAdapterOptions } from '@vibecode-db/sqlite-core'

// Re-export auth adapter
export { SQLiteWebAuthAdapter, type SQLiteWebAuthOptions } from './auth-adapter'

export type SQLiteWebAdapterOptions = BaseSQLiteAdapterOptions & {
    wasmUrl: string
}

export class SQLiteWebAdapter extends BaseSQLiteAdapter {
    constructor(dbSpec: DBSpec<any>, private webOpts: SQLiteWebAdapterOptions) {
        super(dbSpec, webOpts)
        this.validateOpts()
        this.ready = this.init()
    }
    private validateOpts() {
        if (!this.webOpts.wasmUrl) {
            throw new Error('wasmUrl is required')
        }
    }
    protected async initDriver(): Promise<SqlDriver> {
        const SQL = await initSqlJs({ locateFile: () => this.webOpts.wasmUrl })
        const db = new SQL.Database()
        return new SqlJsDriver(db)
    }
}
