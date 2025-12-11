/**
 * Auth schema SQL migrations for SQLite (Simplified for prototyping)
 * Only creates the auth_users table - no sessions, refresh tokens, etc.
 */

export const AUTH_MIGRATIONS = [
  // auth_users table - the only table needed for simple prototyping auth
  `CREATE TABLE IF NOT EXISTS "auth_users" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
  )`,
]

/**
 * Apply auth schema migrations
 */
export async function applyAuthMigrations(driver: { run(sql: string, params?: unknown[]): Promise<void> }): Promise<void> {
  for (const migration of AUTH_MIGRATIONS) {
    await driver.run(migration, [])
  }
}
