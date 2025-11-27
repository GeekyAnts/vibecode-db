import { vibecodeTable, col, references } from '../schema'
import type { z } from 'zod'
import { defineSchema } from '../schema/schema'

/**
 * Users table for authentication
 * Extends the base users table with auth-specific fields
 */
export const authUsers = vibecodeTable('auth_users', {
  id: col.uuid().primaryKey().comment('Unique user identifier'),
  email: col.varchar().unique().notNull().comment('User email address'),
  emailVerified: col.boolean().default(false).notNull().comment('Email verification status'),
  passwordHash: col.varchar().notNull().comment('Hashed password (bcrypt/argon2)'),
  name: col.varchar().comment('User full name'),
  avatarUrl: col.varchar().comment('User avatar URL'),
  createdAt: col.timestamp().notNull().default(new Date()).comment('Account creation timestamp'),
  updatedAt: col.timestamp().notNull().default(new Date()).comment('Last update timestamp'),
  metadata: col.json().comment('Additional user metadata'),
})

/**
 * Sessions table for tracking active sessions
 */
export const authSessions = vibecodeTable('auth_sessions', {
  id: col.uuid().primaryKey().comment('Unique session identifier'),
  userId: references(
    col.uuid('userId').notNull().onDelete('CASCADE').index(),
    () => authUsers.id
  ),
  accessToken: col.varchar().notNull().comment('JWT access token'),
  refreshToken: col.uuid().notNull().index().comment('Refresh token identifier'),
  expiresAt: col.timestamp().notNull().comment('Session expiration timestamp'),
  createdAt: col.timestamp().notNull().default(new Date()).comment('Session creation timestamp'),
  ipAddress: col.varchar().comment('Client IP address'),
  userAgent: col.varchar().comment('Client user agent'),
})

/**
 * Refresh tokens table for managing refresh tokens
 */
export const authRefreshTokens = vibecodeTable('auth_refresh_tokens', {
  id: col.uuid().primaryKey().comment('Unique refresh token identifier'),
  userId: references(
    col.uuid('userId').notNull().onDelete('CASCADE').index(),
    () => authUsers.id
  ),
  tokenHash: col.varchar().notNull().comment('Hashed refresh token'),
  expiresAt: col.timestamp().notNull().comment('Token expiration timestamp'),
  createdAt: col.timestamp().notNull().default(new Date()).comment('Token creation timestamp'),
  revokedAt: col.timestamp().comment('Token revocation timestamp'),
})

/**
 * Password reset tokens table
 */
export const authPasswordResetTokens = vibecodeTable('auth_password_reset_tokens', {
  id: col.uuid().primaryKey().comment('Unique token identifier'),
  userId: references(
    col.uuid('userId').notNull().onDelete('CASCADE').index(),
    () => authUsers.id
  ),
  tokenHash: col.varchar().notNull().comment('Hashed reset token'),
  expiresAt: col.timestamp().notNull().comment('Token expiration timestamp'),
  usedAt: col.timestamp().comment('Token usage timestamp'),
  createdAt: col.timestamp().notNull().default(new Date()).comment('Token creation timestamp'),
})

/**
 * Define the auth schema
 */
export const authSchema = defineSchema({
  authUsers,
  authSessions,
  authRefreshTokens,
  authPasswordResetTokens,
})

/**
 * Type exports for auth schema
 */
export type AuthSchema = typeof authSchema
export type AuthUsers = z.infer<typeof authSchema.zodBundle.shape.authUsers>
export type AuthSessions = z.infer<typeof authSchema.zodBundle.shape.authSessions>
export type AuthRefreshTokens = z.infer<typeof authSchema.zodBundle.shape.authRefreshTokens>
export type AuthPasswordResetTokens = z.infer<typeof authSchema.zodBundle.shape.authPasswordResetTokens>

