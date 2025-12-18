import type { z } from 'zod'
import { BaseSQLiteAdapter, SQLiteAuthExecutor } from '@vibecode-db/sqlite-core'
import type { SqlDriver } from '@vibecode-db/sqlite-core'
import type { DBSpec, UnifiedAdapterFactory, UnifiedAdapter } from '@vibecode-db/client'
import { BaseSQLiteAdapterOptions, wipeDatabase } from '@vibecode-db/sqlite-core'
import { SQLExpoDriver } from './sqlexpo-driver'
import * as SQLite from 'expo-sqlite'

/**
 * SQLite Expo adapter options
 */
export interface SQLiteExpoAdapterOptions extends BaseSQLiteAdapterOptions {
    /** Database filename */
    dbName: string

    /** Reset database on app start (development only) */
    resetOnStart?: boolean

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
 * SQLite Expo Adapter - uses expo-sqlite for React Native/Expo apps.
 *
 * @public
 * @param dbSpec - Your DBSpec (schema + optional seed/meta)
 * @param opts - Adapter options including dbName and optional auth config
 *
 * @example
 * ```ts
 * const client = createClient({
 *   dbSpec,
 *   adapter: sqliteExpoAdapter({
 *     dbName: 'app.db',
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
export class SQLiteExpoAdapter extends BaseSQLiteAdapter {
    private _authExecutor: SQLiteAuthExecutor | undefined

    constructor(dbSpec: DBSpec<any>, private expoOpts: SQLiteExpoAdapterOptions) {
        super(dbSpec, expoOpts)
        this.validateOpts()
        this.ready = this.initWithAuth()
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
                return { rows }
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

    /**
     * Initialize driver and optionally auth
     */
    private async initWithAuth(): Promise<void> {
        // First initialize the driver and base adapter
        await this.init()

        // Initialize auth if jwtSecret provided
        if (this.expoOpts.auth?.jwtSecret) {
            this._authExecutor = new SQLiteAuthExecutor(
                () => this.driver,
                Promise.resolve(), // Driver is already ready at this point
                { jwtSecret: this.expoOpts.auth.jwtSecret },
                this.expoOpts.auth.seed ? { seed: this.expoOpts.auth.seed } : undefined
            )

            // Register auth executor with base adapter for user-scoping
            this.setAuthExecutor(this._authExecutor)

            // Wait for auth to be ready
            await this._authExecutor.ready
        }
    }
}

/**
 * Factory function for creating SQLite Expo adapter.
 *
 * @param opts - SQLite Expo configuration options
 * @returns Adapter factory function for use with createClient
 *
 * @example
 * ```ts
 * const client = createClient({
 *   dbSpec,
 *   adapter: sqliteExpoAdapter({
 *     dbName: 'app.db',
 *     auth: { jwtSecret: 'your-secret' }
 *   })
 * })
 * ```
 */
export function sqliteExpoAdapter(opts: SQLiteExpoAdapterOptions): UnifiedAdapterFactory<any> {
    return <S extends z.ZodRawShape>(dbSpec: DBSpec<S>): UnifiedAdapter => {
        return new SQLiteExpoAdapter(dbSpec, opts)
    }
}
