import type { DBSpec, DatabaseAdapter, AdapterTableExecutor, RelationIndex } from '@vibecode-db/client'
import { SQLiteTableExecutor } from './executor'
import type { SqlDriver } from './driver'
import { applyPragmasAndMigrations, seedDatabase } from './utils'
import { BaseSQLiteAdapterOptions } from './types'


export abstract class BaseSQLiteAdapter implements DatabaseAdapter {
    protected driver!: SqlDriver
    private ready: Promise<void>

    constructor(protected dbSpec: DBSpec<any>, protected opts: BaseSQLiteAdapterOptions) {
        this.ready = this.init()
    }

    protected abstract initDriver(): Promise<SqlDriver>

    private async init() {
        this.driver = await this.initDriver()
        await applyPragmasAndMigrations(this.driver, {
            enableForeignKeys: this.opts.enableForeignKeys,
            migrations: this.opts.migrations,
        })
        await seedDatabase(this.driver, this.dbSpec, this.opts.seedBehavior ?? 'upsert')
    }

    from(table: string): AdapterTableExecutor {
        return new SQLiteTableExecutor(table, () => this.driver, this.dbSpec.relations, this.ready)
    }
}
