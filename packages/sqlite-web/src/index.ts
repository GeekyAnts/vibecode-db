import initSqlJs from 'sql.js'
import type { z } from 'zod'
import { SqlJsDriver } from './sqljs-driver'
import { BaseSQLiteAdapter, SQLiteAuthExecutor } from '@vibecode-db/sqlite-core'
import type { SqlDriver } from '@vibecode-db/sqlite-core'
import type { DBSpec, UnifiedAdapterFactory, UnifiedAdapter } from '@vibecode-db/client'
import { BaseSQLiteAdapterOptions } from '@vibecode-db/sqlite-core'

/**
 * SQLite Web adapter options
 */
export interface SQLiteWebAdapterOptions extends BaseSQLiteAdapterOptions {
    /** Path to sql-wasm.wasm file */
    wasmUrl: string

    /**
     * Optional auth configuration.
     * If provided (with jwtSecret), client.auth will be available.
     * If omitted, client.auth will throw helpful error.
     */
    auth?: {
        /** JWT secret for signing tokens - REQUIRED for auth to be enabled */
        jwtSecret: string

        /** Seed users for development/testing */
        seed?: {
            users?: Array<{
                id: string
                email: string
                password: string
                name?: string
            }>
        }
    }
}

/**
 * SQLite Web Adapter - uses sql.js (WASM) for browser-based SQLite.
 *
 * @public
 * @param dbSpec - Your DBSpec (schema + optional seed/meta)
 * @param opts - Adapter options including wasmUrl and optional auth config
 *
 * @example
 * ```ts
 * const client = createClient({
 *   dbSpec,
 *   adapter: sqliteWebAdapter({
 *     wasmUrl: '/sql-wasm.wasm',
 *     auth: { jwtSecret: 'your-secret' }  // Optional
 *   })
 * })
 *
 * // Database operations
 * const { data } = await client.from('users').select('*')
 *
 * // Auth operations (if configured)
 * await client.auth.signIn({ email, password })
 * ```
 */
export class SQLiteWebAdapter extends BaseSQLiteAdapter {
    private _authExecutor: SQLiteAuthExecutor | undefined

    constructor(dbSpec: DBSpec<any>, private webOpts: SQLiteWebAdapterOptions) {
        super(dbSpec, webOpts)
        this.validateOpts()
        this.ready = this.initWithAuth()
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

    /**
     * Initialize driver and optionally auth
     */
    private async initWithAuth(): Promise<void> {
        // First initialize the driver and base adapter
        await this.init()

        // Initialize auth if jwtSecret provided
        if (this.webOpts.auth?.jwtSecret) {
            this._authExecutor = new SQLiteAuthExecutor(
                () => this.driver,
                Promise.resolve(), // Driver is already ready at this point
                { jwtSecret: this.webOpts.auth.jwtSecret },
                this.webOpts.auth.seed ? { seed: this.webOpts.auth.seed } : undefined
            )

            // Register auth executor with base adapter for user-scoping
            this.setAuthExecutor(this._authExecutor)

            // Wait for auth to be ready
            await this._authExecutor.ready
        }
    }
}

/**
 * Factory function for creating SQLite Web adapter.
 *
 * @param opts - SQLite Web configuration options
 * @returns Adapter factory function for use with createClient
 *
 * @example
 * ```ts
 * const client = createClient({
 *   dbSpec,
 *   adapter: sqliteWebAdapter({
 *     wasmUrl: '/sql-wasm.wasm',
 *     auth: { jwtSecret: 'your-secret' }
 *   })
 * })
 * ```
 */
export function sqliteWebAdapter(opts: SQLiteWebAdapterOptions): UnifiedAdapterFactory<any> {
    return <S extends z.ZodRawShape>(dbSpec: DBSpec<S>): UnifiedAdapter => {
        return new SQLiteWebAdapter(dbSpec, opts)
    }
}
