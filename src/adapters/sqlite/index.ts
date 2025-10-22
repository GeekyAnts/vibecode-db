import initSqlJs, { Database } from 'sql.js'
import type { DBSpec, DatabaseAdapter, AdapterTableExecutor, RelationIndex } from '../../core/types'
import type { SQLiteAdapterOptions } from './types'
import { SQLiteTableExecutor } from './executor'
import { applyPragmasAndMigrations, resolveNativeDriver, resolveWebDriver, seedDatabase } from './utils'
import { SqlDriver } from './driver'

export class SQLiteAdapter implements DatabaseAdapter {
    private ready: Promise<void>
    protected driver!: SqlDriver

    constructor(private dbSpec: DBSpec<any>, private opts: SQLiteAdapterOptions) {
        this.ready = this.init()
    }

    private validateOpts() {
        const platform = this.opts.platform ?? 'auto'

        if (platform === 'auto' && !this.opts.wasm?.wasmUrl && !this.opts.native?.dbName) {
            throw new Error('platform="auto" requires both { wasm, native }')
        }

        if (platform === 'web' && !this.opts.wasm?.wasmUrl) {
            throw new Error('platform="web" requires { wasm }')

        }

        if (platform === 'native' && !this.opts.native?.dbName) {
            throw new Error('platform="native" requires { native }')
        }

    }

    private async init() {
        this.validateOpts()
        this.driver = await this.initDriver()
        console.log("this.driver", this.driver)
        await applyPragmasAndMigrations(this.driver, {
            enableForeignKeys: this.opts.enableForeignKeys,
            migrations: this.opts.migrations,
        })

        await seedDatabase(this.driver, this.dbSpec, this.opts.seedBehavior ?? 'upsert')
    }

    protected async initDriver(): Promise<SqlDriver> {
        const isRN = typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative'
        const platform = this.opts.platform ?? (isRN ? 'native' : 'web')
        if (platform === 'web') return resolveWebDriver(this.opts?.wasm?.wasmUrl)
        if (platform === 'native') return resolveNativeDriver(this.opts.native?.dbName ?? 'app.db')
        // auto
        return isRN ? resolveNativeDriver(this.opts.native?.dbName ?? 'app.db') : resolveWebDriver(this.opts.wasm?.wasmUrl)
    }

    from(table: string): AdapterTableExecutor {
        console.log("this.driver 2", this.driver)
        return new SQLiteTableExecutor(table, () => this.driver, this.dbSpec?.relations, this.ready)
    }

}
