import type { SqlDriver } from '../sqlite/driver'
import type { SQLiteAuthOptions } from './types'
import type { AuthExecutor } from '@vibecode-db/client'
import { hashPassword, verifyPassword, generateJWT, generateUUID } from './utils'
import { applyAuthMigrations } from './schema'

/**
 * Session - user and access token
 */
export interface Session {
  user: User
  accessToken: string
}

export interface User {
  id: string
  email: string
  name?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface SignUpCredentials {
  email: string
  password: string
  name?: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export type AuthResult<T> = Promise<{ data: T | null; error: Error | null }>

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
 * SQLite auth executor for prototyping
 * - Only auth_users table
 * - Simple JWT tokens (no DB session storage)
 * - Sessions stored in memory (single page session)
 */
export class SQLiteAuthExecutor implements AuthExecutor {
  public readonly ready: Promise<void>

  // In-memory session for current user (prototyping only)
  private currentSession: Session | null = null

  constructor(
    private getDriver: () => SqlDriver,
    private driverReady: Promise<void>,
    private options: SQLiteAuthOptions,
    private authSpec?: AuthSpec
  ) {
    this.ready = this.init()
  }

  private get driver(): SqlDriver {
    return this.getDriver()
  }

  private async init(): Promise<void> {
    await this.driverReady
    await applyAuthMigrations(this.driver)
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
   * Get the current user ID (sync) - single source of truth
   * Used by DB adapter for auto user-scoping
   */
  getCurrentUserId(): string | null {
    return this.currentSession?.user?.id ?? null
  }

  /**
   * Create a new user account
   */
  async signUp(credentials: SignUpCredentials): AuthResult<Session> {
    await this.ensureReady()

    try {
      const existing = await this.driver.all<{ id: string }>(
        'SELECT id FROM auth_users WHERE email = ?',
        [credentials.email]
      )

      if (existing.length > 0) {
        return { data: null, error: new Error('User with this email already exists') }
      }

      const passwordHash = await hashPassword(credentials.password)
      const userId = generateUUID()
      const now = new Date()

      await this.driver.run(
        `INSERT INTO auth_users (id, email, passwordHash, name, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          credentials.email,
          passwordHash,
          credentials.name ?? null,
          now.toISOString(),
          now.toISOString(),
        ]
      )

      const user: User = {
        id: userId,
        email: credentials.email,
        name: credentials.name,
        createdAt: now,
        updatedAt: now,
      }

      const accessToken = generateJWT(
        { userId, email: credentials.email },
        this.options.jwtSecret
      )

      this.currentSession = { user, accessToken }
      return { data: this.currentSession, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: SignInCredentials): AuthResult<Session> {
    await this.ensureReady()

    try {
      const users = await this.driver.all<{
        id: string
        email: string
        passwordHash: string
        name: string | null
        createdAt: string
        updatedAt: string
      }>(
        'SELECT * FROM auth_users WHERE email = ?',
        [credentials.email]
      )

      if (users.length === 0) {
        return { data: null, error: new Error('Invalid email or password') }
      }

      const dbUser = users[0]
      const isValid = await verifyPassword(credentials.password, dbUser.passwordHash)

      if (!isValid) {
        return { data: null, error: new Error('Invalid email or password') }
      }

      const user: User = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name ?? undefined,
        createdAt: new Date(dbUser.createdAt),
        updatedAt: new Date(dbUser.updatedAt),
      }

      const accessToken = generateJWT(
        { userId: user.id, email: user.email },
        this.options.jwtSecret
      )

      this.currentSession = { user, accessToken }
      return { data: this.currentSession, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
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
  async getUserById(userId: string): AuthResult<User | null> {
    await this.ensureReady()

    try {
      const users = await this.driver.all<{
        id: string
        email: string
        name: string | null
        createdAt: string
        updatedAt: string
      }>(
        'SELECT id, email, name, createdAt, updatedAt FROM auth_users WHERE id = ?',
        [userId]
      )

      if (users.length === 0) {
        return { data: null, error: null }
      }

      const dbUser = users[0]
      return {
        data: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name ?? undefined,
          createdAt: new Date(dbUser.createdAt),
          updatedAt: new Date(dbUser.updatedAt),
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  /**
   * Get user by email (for internal use)
   */
  async getUserByEmail(email: string): AuthResult<User | null> {
    await this.ensureReady()

    try {
      const users = await this.driver.all<{
        id: string
        email: string
        name: string | null
        createdAt: string
        updatedAt: string
      }>(
        'SELECT id, email, name, createdAt, updatedAt FROM auth_users WHERE email = ?',
        [email]
      )

      if (users.length === 0) {
        return { data: null, error: null }
      }

      const dbUser = users[0]
      return {
        data: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name ?? undefined,
          createdAt: new Date(dbUser.createdAt),
          updatedAt: new Date(dbUser.updatedAt),
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}
