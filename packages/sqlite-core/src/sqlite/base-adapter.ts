import type { DBSpec, DatabaseAdapter, AdapterTableExecutor, RelationIndex } from '@vibecode-db/client'
import { SQLiteTableExecutor } from './executor'
import type { SqlDriver } from './driver'
import { applyPragmasAndMigrations, seedDatabase } from './utils'
import { BaseSQLiteAdapterOptions } from './types'


export abstract class BaseSQLiteAdapter implements DatabaseAdapter {
    protected driver!: SqlDriver
    protected ready!: Promise<void>

    constructor(protected dbSpec: DBSpec<any>, protected opts: BaseSQLiteAdapterOptions) {
    }

    protected abstract initDriver(): Promise<SqlDriver>

    protected async init() {
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
