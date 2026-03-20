/**
 * Mobile App Database Schema
 *
 * This file defines the database schema for the mobile application.
 * Migrations are auto-generated from this schema definition.
 */

import { vibecodeTable, col, defineSchema, type DBSpec } from '@vibecode-db/client'

// ============================================================================
// Table Definitions
// ============================================================================

/**
 * Posts table - stores user-created posts/articles
 */
export const posts = vibecodeTable('posts', {
  id: col.varchar().primaryKey().comment('Unique post identifier (UUID)'),
  title: col.varchar({ length: 256 }).notNull().comment('Post title'),
  content: col.varchar().notNull().comment('Post content'),
  published: col.boolean().notNull().comment('Publication status'),
  user_id: col.varchar().notNull().index().comment('Auth user ID (UUID)'),
  created_at: col.timestamp().notNull().index().comment('Creation timestamp'),
  updated_at: col.timestamp().notNull().index().comment('Last update timestamp'),
})

/**
 * Profiles table - stores extended user profile information
 */
export const profiles = vibecodeTable('profiles', {
  id: col.varchar().primaryKey().comment('Profile ID (same as user ID)'),
  user_id: col.varchar().notNull().unique().index().comment('Auth user ID (UUID)'),
  username: col.varchar({ length: 50 }).comment('Unique username'),
  full_name: col.varchar({ length: 100 }).comment('Full display name'),
  avatar_url: col.varchar({ length: 500 }).comment('Profile picture URL'),
  bio: col.varchar().comment('User biography'),
  created_at: col.timestamp().notNull().comment('Creation timestamp'),
  updated_at: col.timestamp().notNull().comment('Last update timestamp'),
})

/**
 * Todos table - for the vibecode-todo demo app
 */
export const todos = vibecodeTable('todos', {
  id: col.varchar().primaryKey().comment('Unique todo identifier (UUID)'),
  title: col.varchar({ length: 256 }).notNull().comment('Todo title'),
  completed: col.boolean().notNull().comment('Completion status'),
  user_id: col.varchar().notNull().index().comment('Auth user ID (UUID)'),
  created_at: col.timestamp().notNull().index().comment('Creation timestamp'),
  updated_at: col.timestamp().notNull().index().comment('Last update timestamp'),
})

/**
 * Storage files table - tracks uploaded files metadata
 */
export const storage_files = vibecodeTable('storage_files', {
  id: col.varchar().primaryKey().comment('Unique file identifier (UUID)'),
  user_id: col.varchar().notNull().index().comment('Owner user ID'),
  bucket: col.varchar({ length: 100 }).notNull().index().comment('Storage bucket name'),
  path: col.varchar({ length: 500 }).notNull().comment('File path within bucket'),
  name: col.varchar({ length: 256 }).notNull().comment('Original filename'),
  size: col.integer().notNull().comment('File size in bytes'),
  mime_type: col.varchar({ length: 100 }).notNull().comment('MIME type'),
  created_at: col.timestamp().notNull().index().comment('Upload timestamp'),
})

// ============================================================================
// Schema Definition
// ============================================================================

/**
 * Combined schema definition with all tables
 */
export const db = defineSchema({
  posts,
  profiles,
  todos,
  storage_files,
})

/**
 * DBSpec for use with createClient
 */
export const dbSpec: DBSpec<typeof db.zodBundle.shape> = {
  schema: db.zodBundle,
  relations: db.relations,
  seed: {
    posts: [],
    profiles: [],
    todos: [],
    storage_files: [],
  },
}

/**
 * Exported migrations for use by adapters
 */
export const migrations = db.migrations

// ============================================================================
// Type Exports
// ============================================================================

export type Post = {
  id: string
  title: string
  content: string
  published: boolean
  user_id: string
  created_at: string | Date
  updated_at: string | Date
}

export type Profile = {
  id: string
  user_id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string | Date
  updated_at: string | Date
}

export type Todo = {
  id: string
  title: string
  completed: boolean
  user_id: string
  created_at: string | Date
  updated_at: string | Date
}

export type StorageFile = {
  id: string
  user_id: string
  bucket: string
  path: string
  name: string
  size: number
  mime_type: string
  created_at: string | Date
}

export type User = {
  id: string
  email: string
  emailVerified?: boolean
  name?: string
  avatarUrl?: string
  createdAt?: Date
  updatedAt?: Date
  metadata?: Record<string, unknown>
}
