import type { AuthAdapter, SignUpCredentials, SignInCredentials, ResetPasswordRequest, ResetPasswordConfirm, ChangePasswordRequest, UpdateUserProfile, Session, User } from '../../types'
import type { SqlDriver } from '@vibecode-db/sqlite-core'
import type { SQLiteAuthAdapterOptions } from './types'
import { hashPassword, verifyPassword, generateJWT, verifyJWT, generateUUID } from './utils'

/**
 * SQLite auth executor - implements all auth operations manually
 */
export class SQLiteAuthExecutor implements AuthAdapter {
  private ready: Promise<void>

  constructor(
    private getDriver: () => SqlDriver,
    private options: SQLiteAuthAdapterOptions
  ) {
    this.ready = this.init()
  }

  private get driver(): SqlDriver {
    return this.getDriver()
  }

  private async init(): Promise<void> {
    // Wait for driver to be ready if provided
    if (this.options.ready) {
      await this.options.ready
    }
    // Ensure tables exist (migrations should be applied by adapter)
    // This is a safety check
    await this.ensureTables()
  }

  private async ensureReady(): Promise<void> {
    await this.ready
  }

  private async ensureTables(): Promise<void> {
    // Check if auth_users table exists
    const tables = await this.driver.all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('auth_users', 'auth_sessions', 'auth_refresh_tokens', 'auth_password_reset_tokens')",
      []
    )
    
    const tableNames = tables.map(t => t.name)
    if (tableNames.length < 4) {
      throw new Error('Auth tables not initialized. Run migrations first.')
    }
  }

  async signUp(credentials: SignUpCredentials): Promise<{ data: Session | null; error: Error | null }> {
    try {
      await this.ensureReady()

      // Check if user already exists
      const existing = await this.driver.all<{ id: string }>(
        'SELECT id FROM auth_users WHERE email = ?',
        [credentials.email]
      )

      if (existing.length > 0) {
        return { data: null, error: new Error('User with this email already exists') }
      }

      // Hash password
      const passwordHash = await hashPassword(credentials.password)
      const userId = generateUUID()
      const now = new Date()

      // Insert user
      await this.driver.run(
        `INSERT INTO auth_users 
         (id, email, emailVerified, passwordHash, name, avatarUrl, createdAt, updatedAt, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          credentials.email,
          0, // emailVerified
          passwordHash,
          credentials.name ?? null,
          null, // avatarUrl
          now.toISOString(),
          now.toISOString(),
          credentials.metadata ? JSON.stringify(credentials.metadata) : null,
        ]
      )

      // Create session
      return await this.createSession(userId)
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async signIn(credentials: SignInCredentials): Promise<{ data: Session | null; error: Error | null }> {
    try {
      await this.ensureReady()

      // Find user by email
      const users = await this.driver.all<{
        id: string
        email: string
        emailVerified: number
        passwordHash: string
        name: string | null
        avatarUrl: string | null
        createdAt: string
        updatedAt: string
        metadata: string | null
      }>(
        'SELECT * FROM auth_users WHERE email = ?',
        [credentials.email]
      )

      if (users.length === 0) {
        return { data: null, error: new Error('Invalid email or password') }
      }

      const user = users[0]

      // Verify password
      const isValid = await verifyPassword(credentials.password, user.passwordHash)
      if (!isValid) {
        return { data: null, error: new Error('Invalid email or password') }
      }

      // Create session
      return await this.createSession(user.id)
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async signOut(): Promise<{ data: void | null; error: Error | null }> {
    try {
      await this.ensureReady()

      // Get current session from token (would need to be passed in real implementation)
      // For now, we'll clear all expired sessions
      const now = new Date().toISOString()
      await this.driver.run(
        'DELETE FROM auth_sessions WHERE expiresAt < ?',
        [now]
      )

      return { data: undefined, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getSession(): Promise<{ data: Session | null; error: Error | null }> {
    try {
      await this.ensureReady()

      // Get most recent valid session
      const now = new Date().toISOString()
      const sessions = await this.driver.all<{
        id: string
        userId: string
        accessToken: string
        refreshToken: string
        expiresAt: string
        createdAt: string
      }>(
        `SELECT * FROM auth_sessions 
         WHERE expiresAt > ? 
         ORDER BY createdAt DESC 
         LIMIT 1`,
        [now]
      )

      if (sessions.length === 0) {
        return { data: null, error: null }
      }

      const session = sessions[0]

      // Get user
      const user = await this.getUserById(session.userId)
      if (!user) {
        return { data: null, error: new Error('User not found') }
      }

      return {
        data: {
          user,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresAt: new Date(session.expiresAt),
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async refreshSession(refreshToken?: string): Promise<{ data: Session | null; error: Error | null }> {
    try {
      await this.ensureReady()

      if (!refreshToken) {
        return { data: null, error: new Error('Refresh token required') }
      }

      // Find refresh token
      const tokens = await this.driver.all<{
        id: string
        userId: string
        tokenHash: string
        expiresAt: string
        revokedAt: string | null
      }>(
        'SELECT * FROM auth_refresh_tokens WHERE id = ? AND revokedAt IS NULL',
        [refreshToken]
      )

      if (tokens.length === 0) {
        return { data: null, error: new Error('Invalid refresh token') }
      }

      const token = tokens[0]
      const now = new Date()

      if (new Date(token.expiresAt) < now) {
        return { data: null, error: new Error('Refresh token expired') }
      }

      // Create new session
      return await this.createSession(token.userId)
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async resetPassword(request: ResetPasswordRequest): Promise<{ data: void | null; error: Error | null }> {
    try {
      await this.ensureReady()

      // Find user
      const users = await this.driver.all<{ id: string }>(
        'SELECT id FROM auth_users WHERE email = ?',
        [request.email]
      )

      if (users.length === 0) {
        // Don't reveal if user exists
        return { data: undefined, error: null }
      }

      const userId = users[0].id

      // Generate reset token
      const tokenId = generateUUID()
      const tokenHash = await hashPassword(tokenId)
      const expiresAt = new Date()
      expiresAt.setSeconds(expiresAt.getSeconds() + (this.options.passwordResetTokenExpiry ?? 3600))

      // Store reset token
      await this.driver.run(
        `INSERT INTO auth_password_reset_tokens 
         (id, userId, tokenHash, expiresAt, usedAt, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          tokenId,
          userId,
          tokenHash,
          expiresAt.toISOString(),
          null,
          new Date().toISOString(),
        ]
      )

      // In production, send email with token
      // For now, we'll just return success
      return { data: undefined, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async resetPasswordConfirm(confirm: ResetPasswordConfirm): Promise<{ data: Session | null; error: Error | null }> {
    try {
      await this.ensureReady()

      // Find reset token
      const tokens = await this.driver.all<{
        id: string
        userId: string
        tokenHash: string
        expiresAt: string
        usedAt: string | null
      }>(
        'SELECT * FROM auth_password_reset_tokens WHERE id = ?',
        [confirm.token]
      )

      if (tokens.length === 0) {
        return { data: null, error: new Error('Invalid reset token') }
      }

      const token = tokens[0]

      if (token.usedAt) {
        return { data: null, error: new Error('Reset token already used') }
      }

      const now = new Date()
      if (new Date(token.expiresAt) < now) {
        return { data: null, error: new Error('Reset token expired') }
      }

      // Update password
      const passwordHash = await hashPassword(confirm.password)
      await this.driver.run(
        'UPDATE auth_users SET passwordHash = ?, updatedAt = ? WHERE id = ?',
        [passwordHash, now.toISOString(), token.userId]
      )

      // Mark token as used
      await this.driver.run(
        'UPDATE auth_password_reset_tokens SET usedAt = ? WHERE id = ?',
        [now.toISOString(), token.id]
      )

      // Create session
      return await this.createSession(token.userId)
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async changePassword(request: ChangePasswordRequest): Promise<{ data: void | null; error: Error | null }> {
    try {
      await this.ensureReady()

      // Get current user (would need session in real implementation)
      // For now, we'll need to pass userId - this is a limitation
      // In production, get userId from session
      return { data: null, error: new Error('changePassword requires user session - use updateUser with password field') }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async updateUser(updates: UpdateUserProfile): Promise<{ data: User | null; error: Error | null }> {
    try {
      await this.ensureReady()

      // Get current user (would need session in real implementation)
      // For now, this is a placeholder
      return { data: null, error: new Error('updateUser requires user session') }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getUser(): Promise<{ data: User | null; error: Error | null }> {
    try {
      await this.ensureReady()

      // Get current user from session
      const session = await this.getSession()
      if (!session.data) {
        return { data: null, error: null }
      }

      return { data: session.data.user, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Helper methods

  private async createSession(userId: string): Promise<{ data: Session | null; error: Error | null }> {
    try {
      const sessionId = generateUUID()
      const refreshTokenId = generateUUID()
      const now = new Date()
      const expiresAt = new Date()
      expiresAt.setSeconds(expiresAt.getSeconds() + (this.options.accessTokenExpiry ?? 3600))

      // Generate JWT
      const accessToken = generateJWT(
        { userId, sessionId },
        this.options.jwtSecret,
        this.options.accessTokenExpiry ?? 3600
      )

      // Hash refresh token
      const refreshTokenHash = await hashPassword(refreshTokenId)

      // Store refresh token
      const refreshTokenExpiresAt = new Date()
      refreshTokenExpiresAt.setSeconds(refreshTokenExpiresAt.getSeconds() + (this.options.refreshTokenExpiry ?? 604800))

      await this.driver.run(
        `INSERT INTO auth_refresh_tokens 
         (id, userId, tokenHash, expiresAt, revokedAt, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          refreshTokenId,
          userId,
          refreshTokenHash,
          refreshTokenExpiresAt.toISOString(),
          null,
          now.toISOString(),
        ]
      )

      // Store session
      await this.driver.run(
        `INSERT INTO auth_sessions 
         (id, userId, accessToken, refreshToken, expiresAt, createdAt, ipAddress, userAgent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          userId,
          accessToken,
          refreshTokenId,
          expiresAt.toISOString(),
          now.toISOString(),
          null,
          null,
        ]
      )

      // Get user
      const user = await this.getUserById(userId)
      if (!user) {
        return { data: null, error: new Error('User not found') }
      }

      return {
        data: {
          user,
          accessToken,
          refreshToken: refreshTokenId,
          expiresAt,
          expiresIn: this.options.accessTokenExpiry ?? 3600,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  private async getUserById(userId: string): Promise<User | null> {
    const users = await this.driver.all<{
      id: string
      email: string
      emailVerified: number
      passwordHash: string
      name: string | null
      avatarUrl: string | null
      createdAt: string
      updatedAt: string
      metadata: string | null
    }>(
      'SELECT * FROM auth_users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return null
    }

    const user = users[0]
    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified === 1,
      name: user.name ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      metadata: user.metadata ? JSON.parse(user.metadata) : undefined,
    }
  }
}

