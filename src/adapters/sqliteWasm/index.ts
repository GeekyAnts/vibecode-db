import initSqlJs, { Database } from 'sql.js'
import type { DBSpec, DatabaseAdapter, AdapterTableExecutor, RelationIndex } from '../../core/types'
import type { SQLiteWasmAdapterOptions } from './types'
import { SQLiteTableExecutor } from './executor'
import { applyPragmasAndMigrations, seedDatabase } from './init'

export class SQLiteWasmAdapter implements DatabaseAdapter {
    private db!: Database
    private ready: Promise<void>

    constructor(private dbSpec: DBSpec<any>, private opts: SQLiteWasmAdapterOptions = {}) {
        this.ready = this.init()
    }

    private async init() {
        if (this.opts.db) {
            this.db = this.opts.db
        } else {
            const SQL = this.opts.sqlJs ?? await initSqlJs({
                locateFile: () => this.opts.wasmUrl ?? 'sql-wasm.wasm',
            })
            this.db = new SQL.Database()
        }

        applyPragmasAndMigrations(this.db, {
            enableForeignKeys: this.opts.enableForeignKeys,
            migrations: this.opts.migrations,
        })

        seedDatabase(this.db, this.dbSpec, this.opts.seedBehavior ?? 'upsert')
    }

    from(table: string): AdapterTableExecutor {
        return new SQLiteTableExecutor(table, () => this.db, this.dbSpec?.relations, this.ready)
    }

    close() { if (this.db) this.db.close() }
}
