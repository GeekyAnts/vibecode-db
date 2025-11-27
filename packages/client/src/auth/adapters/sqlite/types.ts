import type { AuthSpec } from '../../types'
import type { SqlDriver } from '@vibecode-db/sqlite-core'

/**
 * SQLite auth adapter options
 */
export interface SQLiteAuthAdapterOptions {
  /** SQL driver getter function (similar to SQLiteTableExecutor pattern) */
  getDriver: () => SqlDriver
  /** Optional ready promise to wait for driver initialization */
  ready?: Promise<void>
  /** JWT secret for signing tokens */
  jwtSecret: string
  /** Access token expiration in seconds (default: 3600 = 1 hour) */
  accessTokenExpiry?: number
  /** Refresh token expiration in seconds (default: 604800 = 7 days) */
  refreshTokenExpiry?: number
  /** Password reset token expiration in seconds (default: 3600 = 1 hour) */
  passwordResetTokenExpiry?: number
  /** Seed behavior: 'upsert' (default) or 'insert' */
  seedBehavior?: 'upsert' | 'insert'
}

