import initSqlJs from 'sql.js'
import { SqlJsDriver } from './sqljs-driver'
import { BaseSQLiteAdapter } from '@vibecode-db/sqlite-core'
import type { SqlDriver } from '@vibecode-db/sqlite-core'
import type { DBSpec } from '@vibecode-db/client'
import { BaseSQLiteAdapterOptions } from '@vibecode-db/sqlite-core'

export type SQLiteWebOptions = BaseSQLiteAdapterOptions & {
    wasmUrl?: string
}

export class SQLiteAdapter extends BaseSQLiteAdapter {
    constructor(dbSpec: DBSpec<any>, private webOpts: SQLiteWebOptions = {}) {
        super(dbSpec, webOpts)
        this.validateOpts()
    }
    private validateOpts() {
        if (!this.webOpts.wasmUrl) {
            throw new Error('wasmUrl is required')
        }
    }
    protected async initDriver(): Promise<SqlDriver> {
        const SQL = await initSqlJs({ locateFile: () => this.webOpts.wasmUrl ?? 'sql-wasm.wasm' })
        const db = new SQL.Database()
        return new SqlJsDriver(db)
    }
}
