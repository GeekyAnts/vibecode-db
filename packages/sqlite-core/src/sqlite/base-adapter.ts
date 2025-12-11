import type { DBSpec, DatabaseAdapter, AdapterTableExecutor } from '@vibecode-db/client'
import { SQLiteTableExecutor } from './executor'
import type { SqlDriver } from './driver'
import { applyPragmasAndMigrations, seedDatabase } from './utils'
import { BaseSQLiteAdapterOptions } from './types'
import type { BaseSQLiteAuthAdapter } from '../auth/base-adapter'


export abstract class BaseSQLiteAdapter implements DatabaseAdapter {
    protected driver!: SqlDriver
    protected ready!: Promise<void>

    // Reference to auth adapter (single source of truth for user ID)
    private authAdapter: BaseSQLiteAuthAdapter | null = null

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
        return new SQLiteTableExecutor(
            table,
            () => this.driver,
            this.dbSpec.relations,
            this.ready,
            () => this.getCurrentUserId()  // Get from auth adapter
        )
    }

    /**
     * Get the SQL driver instance (for sharing with auth adapter)
     * @internal
     */
    getDriver(): SqlDriver {
        return this.driver
    }

    /**
     * Get the ready promise (for sharing with auth adapter)
     * @internal
     */
    getReady(): Promise<void> {
        return this.ready
    }

    /**
     * Set the auth adapter reference
     * Called automatically by platform-specific auth adapters
     * @internal
     */
    setAuthAdapter(authAdapter: BaseSQLiteAuthAdapter): void {
        this.authAdapter = authAdapter
    }

    /**
     * Get the current authenticated user ID
     * Gets it from the auth adapter's session (single source of truth)
     */
    getCurrentUserId(): string | null {
        return this.authAdapter?.getCurrentUserId() ?? null
    }
}
