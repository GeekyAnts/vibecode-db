import type { SqlDriver } from '@vibecode-db/sqlite-core'
import type { AuthSpec } from '../../types'
import { authSchema } from '../../schema'
import { generateMigrations } from '../../../ddl/generateDDL'

/**
 * Apply auth schema migrations to SQLite database
 */
export async function applyAuthMigrations(driver: SqlDriver): Promise<void> {
  const migrations = generateMigrations(authSchema, {
    ifNotExists: true,
    autoIndexForeignKeys: true,
    includeComments: true,
  })

  for (const migration of migrations) {
    await driver.run(migration, [])
  }
}

/**
 * Seed auth database with initial users
 */
export async function seedAuthDatabase(
  driver: SqlDriver,
  authSpec: AuthSpec,
  seedBehavior: 'upsert' | 'insert' = 'upsert'
): Promise<void> {
  const seed = authSpec.seed
  if (!seed || !seed.users || seed.users.length === 0) {
    return
  }
  
  for (const userSeed of seed.users) {
    // Hash password
    const passwordHash = await hashPassword(userSeed.password)
    
    const user = {
      id: userSeed.id,
      email: userSeed.email,
      emailVerified: userSeed.emailVerified ?? false,
      passwordHash,
      name: userSeed.name ?? null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: null,
    }

    if (seedBehavior === 'upsert') {
      // Use INSERT OR REPLACE for upsert
      const sql = `
        INSERT OR REPLACE INTO auth_users 
        (id, email, emailVerified, passwordHash, name, avatarUrl, createdAt, updatedAt, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      await driver.run(sql, [
        user.id,
        user.email,
        user.emailVerified ? 1 : 0,
        user.passwordHash,
        user.name,
        user.avatarUrl,
        user.createdAt.toISOString(),
        user.updatedAt.toISOString(),
        user.metadata ? JSON.stringify(user.metadata) : null,
      ])
    } else {
      // Simple insert
      const sql = `
        INSERT INTO auth_users 
        (id, email, emailVerified, passwordHash, name, avatarUrl, createdAt, updatedAt, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      try {
        await driver.run(sql, [
          user.id,
          user.email,
          user.emailVerified ? 1 : 0,
          user.passwordHash,
          user.name,
          user.avatarUrl,
          user.createdAt.toISOString(),
          user.updatedAt.toISOString(),
          user.metadata ? JSON.stringify(user.metadata) : null,
        ])
      } catch (error: any) {
        // Ignore duplicate key errors
        if (!error.message?.includes('UNIQUE constraint')) {
          throw error
        }
      }
    }
  }
}

/**
 * Hash password (simple implementation for development)
 * In production, use bcrypt or argon2
 */
export async function hashPassword(password: string): Promise<string> {
  // Simple hash for development - use bcrypt/argon2 in production
  // Use Web Crypto API for browser compatibility
  if (typeof crypto !== 'undefined' && 'subtle' in crypto) {
    // Browser environment
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } else {
    // Node.js environment
    const crypto = await import('crypto')
    return crypto.createHash('sha256').update(password).digest('hex')
  }
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * Generate JWT token (simplified - use proper JWT library in production)
 */
export function generateJWT(payload: Record<string, any>, secret: string, expiresIn: number): string {
  // Simplified JWT generation - use jsonwebtoken library in production
  const header = { alg: 'HS256', typ: 'JWT' }
  const exp = Math.floor(Date.now() / 1000) + expiresIn
  const tokenPayload = { ...payload, exp }
  
  // Base64 encode (simplified - use proper JWT encoding)
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')
  const signature = Buffer.from(secret).toString('base64url') // Simplified
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Verify JWT token (simplified)
 */
export function verifyJWT(token: string, secret: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

