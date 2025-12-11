import { BaseSQLiteAuthAdapter, SQLiteAuthOptions, AuthSpec } from '@vibecode-db/sqlite-core'
import type { SQLiteWebAdapter } from './index'

/**
 * SQLite Web auth adapter options
 */
export interface SQLiteWebAuthOptions extends SQLiteAuthOptions {
  // Extend with web-specific options if needed in future
}

/**
 * SQLite Web auth adapter
 * Simple wrapper that auto-wires the DB adapter's driver
 * 
 * @example
 * ```typescript
 * import { SQLiteWebAdapter, SQLiteWebAuthAdapter } from '@vibecode-db/sqlite-web'
 * 
 * const dbAdapter = new SQLiteWebAdapter(dbSpec, { wasmUrl: '/sql-wasm.wasm' })
 * const authAdapter = new SQLiteWebAuthAdapter(dbAdapter, { jwtSecret: 'secret' })
 * 
 * // User ID is always fetched from auth adapter's session (single source of truth)
 * const auth = createAuthClient({ authSpec: {}, adapter: () => authAdapter })
 * ```
 */
export class SQLiteWebAuthAdapter extends BaseSQLiteAuthAdapter {
  constructor(
    dbAdapter: SQLiteWebAdapter,
    options: SQLiteWebAuthOptions,
    authSpec?: AuthSpec
  ) {
    super(
      () => dbAdapter.getDriver(),
      dbAdapter.getReady(),
      options,
      authSpec
    )
    // Register this auth adapter with the DB adapter
    dbAdapter.setAuthAdapter(this)
  }
}
