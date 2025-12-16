import { vibecodeTable, col } from '../schema'
import type { z } from 'zod'
import { defineSchema } from '../schema/schema'

/**
 * Users table for authentication (simplified for prototyping)
 */
export const authUsers = vibecodeTable('auth_users', {
  id: col.uuid().primaryKey().comment('Unique user identifier'),
  email: col.varchar().unique().notNull().comment('User email address'),
  passwordHash: col.varchar().notNull().comment('Hashed password'),
  name: col.varchar().comment('User full name'),
  createdAt: col.timestamp().notNull().comment('Account creation timestamp'),
  updatedAt: col.timestamp().notNull().comment('Last update timestamp'),
})

/**
 * Define the auth schema (only users table for simplified prototyping)
 */
export const authSchema = defineSchema({
  authUsers,
})

/**
 * Type exports for auth schema
 */
export type AuthSchema = typeof authSchema
export type AuthUsers = z.infer<typeof authSchema.zodBundle.shape.authUsers>
