import type { SqlDriver } from '../sqlite/driver'
import type { SQLiteAuthOptions } from './types'
import { SQLiteAuthExecutor, Session, User } from './executor'
import { applyAuthMigrations } from './schema'
import { hashPassword } from './utils'

// Re-export types from executor
export type {
  Session,
  User,
  SignUpCredentials,
  SignInCredentials,
  AuthResult,
} from './executor'

/**
 * Auth spec for seeding users
 */
export interface AuthSpec {
  seed?: {
    users?: Array<{
      id: string
      email: string
      password: string
      name?: string
    }>
  }
}

/**
 * Simplified SQLite auth adapter for prototyping
 * - Only auth_users table
 * - Simple JWT tokens (no DB session storage)
 * - Sessions stored in memory (single page session)
 */
export class BaseSQLiteAuthAdapter {
  protected executor: SQLiteAuthExecutor
  protected ready: Promise<void>
  
  // In-memory session for current user (prototyping only)
  private currentSession: Session | null = null

  constructor(
    protected getDriver: () => SqlDriver,
    protected driverReady: Promise<void>,
    protected options: SQLiteAuthOptions,
    protected authSpec?: AuthSpec
  ) {
    this.executor = new SQLiteAuthExecutor(getDriver, options)
    this.ready = this.init()
  }

  private get driver(): SqlDriver {
    return this.getDriver()
  }

  private async init(): Promise<void> {
    // Wait for driver to be ready
    await this.driverReady

    // Apply migrations (just creates auth_users table)
    await applyAuthMigrations(this.driver)

    // Seed database if seed data provided
    await this.seedDatabase()
  }

  private async seedDatabase(): Promise<void> {
    const seed = this.authSpec?.seed
    if (!seed?.users?.length) return

    for (const userSeed of seed.users) {
      const passwordHash = await hashPassword(userSeed.password)
      const now = new Date().toISOString()

      const sql = `
        INSERT OR REPLACE INTO auth_users 
        (id, email, passwordHash, name, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      await this.driver.run(sql, [
        userSeed.id,
        userSeed.email,
        passwordHash,
        userSeed.name ?? null,
        now,
        now,
      ])
    }
  }

  private async ensureReady(): Promise<void> {
    await this.ready
  }

  /**
   * Create a new user account
   */
  async signUp(credentials: Parameters<SQLiteAuthExecutor['signUp']>[0]) {
    await this.ensureReady()
    const result = await this.executor.signUp(credentials)
    if (result.data) {
      this.currentSession = result.data
    }
    return result
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: Parameters<SQLiteAuthExecutor['signIn']>[0]) {
    await this.ensureReady()
    const result = await this.executor.signIn(credentials)
    if (result.data) {
      this.currentSession = result.data
    }
    return result
  }

  /**
   * Sign out - clears in-memory session
   */
  async signOut(): Promise<{ data: void | null; error: Error | null }> {
    await this.ensureReady()
    this.currentSession = null
    return { data: undefined, error: null }
  }

  /**
   * Get current session (from memory)
   */
  async getSession(): Promise<{ data: Session | null; error: Error | null }> {
    await this.ensureReady()
    return { data: this.currentSession, error: null }
  }

  /**
   * Get current user
   */
  async getUser(): Promise<{ data: User | null; error: Error | null }> {
    await this.ensureReady()
    return { data: this.currentSession?.user ?? null, error: null }
  }

  /**
   * Refresh session - not supported in simplified SQLite auth
   * Just returns current session
   */
  async refreshSession(_refreshToken?: string): Promise<{ data: Session | null; error: Error | null }> {
    await this.ensureReady()
    return { data: this.currentSession, error: null }
  }

  /**
   * Reset password - not supported in simplified SQLite auth
   */
  async resetPassword(_request: { email: string }): Promise<{ data: void | null; error: Error | null }> {
    return { data: null, error: new Error('Password reset not supported in SQLite prototyping mode') }
  }

  /**
   * Reset password confirm - not supported in simplified SQLite auth
   */
  async resetPasswordConfirm(_confirm: { token: string; password: string }): Promise<{ data: Session | null; error: Error | null }> {
    return { data: null, error: new Error('Password reset not supported in SQLite prototyping mode') }
  }

  /**
   * Change password - not supported in simplified SQLite auth
   */
  async changePassword(_request: { currentPassword: string; newPassword: string }): Promise<{ data: void | null; error: Error | null }> {
    return { data: null, error: new Error('Change password not supported in SQLite prototyping mode') }
  }

  /**
   * Update user - not supported in simplified SQLite auth
   */
  async updateUser(_updates: { name?: string; avatarUrl?: string; metadata?: Record<string, unknown> }): Promise<{ data: User | null; error: Error | null }> {
    return { data: null, error: new Error('Update user not supported in SQLite prototyping mode') }
  }

  /**
   * Get user by ID (for internal use)
   */
  async getUserById(userId: string) {
    await this.ensureReady()
    return this.executor.getUserById(userId)
  }

  /**
   * Get user by email (for internal use)
   */
  async getUserByEmail(email: string) {
    await this.ensureReady()
    return this.executor.getUserByEmail(email)
  }
}
