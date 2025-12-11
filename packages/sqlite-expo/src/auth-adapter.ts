import { BaseSQLiteAuthAdapter, SQLiteAuthOptions, AuthSpec } from '@vibecode-db/sqlite-core'
import type { SQLiteExpoAdapter } from './index'

/**
 * SQLite Expo auth adapter options
 */
export interface SQLiteExpoAuthOptions extends SQLiteAuthOptions {
  // Extend with expo-specific options if needed in future
}

/**
 * SQLite Expo auth adapter
 * Simple wrapper that auto-wires the DB adapter's driver
 * 
 * @example
 * ```typescript
 * import { SQLiteExpoAdapter, SQLiteExpoAuthAdapter } from '@vibecode-db/sqlite-expo'
 * 
 * const dbAdapter = new SQLiteExpoAdapter(dbSpec, { dbName: 'myapp.db' })
 * const authAdapter = new SQLiteExpoAuthAdapter(dbAdapter, { jwtSecret: 'secret' })
 * 
 * // User ID is always fetched from auth adapter's session (single source of truth)
 * const auth = createAuthClient({ authSpec: {}, adapter: () => authAdapter })
 * ```
 */
export class SQLiteExpoAuthAdapter extends BaseSQLiteAuthAdapter {
  constructor(
    dbAdapter: SQLiteExpoAdapter,
    options: SQLiteExpoAuthOptions,
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
