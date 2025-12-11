import type { SqlDriver } from '../sqlite/driver'
import type { SQLiteAuthOptions } from './types'
import { hashPassword, verifyPassword, generateJWT, generateUUID } from './utils'

/**
 * Simple session - just user and token (no DB persistence for sessions)
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
 * Simplified SQLite auth executor for prototyping
 * - No sessions table
 * - No refresh tokens  
 * - No password reset
 * - Just users + JWT
 */
export class SQLiteAuthExecutor {
  constructor(
    private getDriver: () => SqlDriver,
    private options: SQLiteAuthOptions
  ) { }

  private get driver(): SqlDriver {
    return this.getDriver()
  }

  /**
   * Create a new user account
   */
  async signUp(credentials: SignUpCredentials): AuthResult<Session> {
    try {
      // Check if user already exists
      const existing = await this.driver.all<{ id: string }>(
        'SELECT id FROM auth_users WHERE email = ?',
        [credentials.email]
      )

      if (existing.length > 0) {
        return { data: null, error: new Error('User with this email already exists') }
      }

      // Hash password and create user
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

      // Generate a simple JWT token
      const accessToken = generateJWT(
        { userId, email: credentials.email },
        this.options.jwtSecret
      )

      return { data: { user, accessToken }, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: SignInCredentials): AuthResult<Session> {
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

      // Generate a simple JWT token
      const accessToken = generateJWT(
        { userId: user.id, email: user.email },
        this.options.jwtSecret
      )

      return { data: { user, accessToken }, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  /**
   * Sign out - for SQLite prototyping, this is a no-op
   * Client should clear their local token storage
   */
  async signOut(): AuthResult<void> {
    return { data: undefined, error: null }
  }

  /**
   * Get user by ID (used internally after token validation)
   */
  async getUserById(userId: string): AuthResult<User | null> {
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
   * Get user by email
   */
  async getUserByEmail(email: string): AuthResult<User | null> {
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
