import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SQLiteAuthExecutor } from '../../packages/sqlite-core/src/auth/executor'
import type { SqlDriver } from '../../packages/sqlite-core/src/sqlite/driver'

/**
 * Create a mock SQL driver with an in-memory data store
 */
function createMockDriver() {
    const tables: Record<string, Record<string, any>[]> = {
        auth_users: [],
    }

    const mockDriver: SqlDriver = {
        async run(sql: string, params: unknown[] = []) {
            // Handle INSERT
            if (sql.includes('INSERT INTO auth_users')) {
                const [id, email, passwordHash, name, createdAt, updatedAt] = params as string[]
                tables.auth_users.push({
                    id,
                    email,
                    passwordHash,
                    name,
                    createdAt,
                    updatedAt,
                })
            }
        },

        async get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
            return (await this.all<T>(sql, params))[0]
        },

        async all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
            // Handle SELECT by email
            if (sql.includes('SELECT') && sql.includes('auth_users') && sql.includes('email = ?')) {
                const email = params[0] as string
                return tables.auth_users.filter(u => u.email === email) as T[]
            }

            // Handle SELECT by id
            if (sql.includes('SELECT') && sql.includes('auth_users') && sql.includes('id = ?')) {
                const id = params[0] as string
                return tables.auth_users.filter(u => u.id === id) as T[]
            }

            // Handle SELECT all
            if (sql.includes('SELECT') && sql.includes('auth_users')) {
                return tables.auth_users as T[]
            }

            return []
        },
    }

    return { driver: mockDriver, tables }
}

describe('SQLiteAuthExecutor', () => {
    let executor: SQLiteAuthExecutor
    let mockDriver: SqlDriver
    let tables: Record<string, Record<string, any>[]>

    beforeEach(() => {
        const mock = createMockDriver()
        mockDriver = mock.driver
        tables = mock.tables
        executor = new SQLiteAuthExecutor(() => mockDriver, { jwtSecret: 'test-secret' })
    })

    describe('signUp', () => {
        it('should create a new user successfully', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
            }

            const result = await executor.signUp(credentials)

            expect(result.error).toBeNull()
            expect(result.data).not.toBeNull()
            expect(result.data!.user.email).toBe('test@example.com')
            expect(result.data!.user.name).toBe('Test User')
            expect(result.data!.accessToken).toBeDefined()
            expect(result.data!.accessToken.length).toBeGreaterThan(0)
        })

        it('should store user in database', async () => {
            await executor.signUp({
                email: 'newuser@example.com',
                password: 'password123',
                name: 'New User',
            })

            expect(tables.auth_users.length).toBe(1)
            expect(tables.auth_users[0].email).toBe('newuser@example.com')
            expect(tables.auth_users[0].name).toBe('New User')
        })

        it('should hash the password (not store plain text)', async () => {
            const password = 'my-secret-password'
            await executor.signUp({
                email: 'user@example.com',
                password,
                name: 'User',
            })

            expect(tables.auth_users[0].passwordHash).not.toBe(password)
            expect(tables.auth_users[0].passwordHash.length).toBe(64) // SHA-256
        })

        it('should generate unique user IDs', async () => {
            await executor.signUp({ email: 'user1@example.com', password: 'pass1' })
            await executor.signUp({ email: 'user2@example.com', password: 'pass2' })

            expect(tables.auth_users[0].id).not.toBe(tables.auth_users[1].id)
        })

        it('should reject duplicate email', async () => {
            await executor.signUp({ email: 'duplicate@example.com', password: 'pass1' })
            const result = await executor.signUp({ email: 'duplicate@example.com', password: 'pass2' })

            expect(result.error).not.toBeNull()
            expect(result.error!.message).toContain('already exists')
            expect(result.data).toBeNull()
        })

        it('should handle missing name', async () => {
            const result = await executor.signUp({
                email: 'noname@example.com',
                password: 'password123',
            })

            expect(result.error).toBeNull()
            expect(result.data!.user.email).toBe('noname@example.com')
            expect(result.data!.user.name).toBeUndefined()
        })

        it('should return a valid JWT token', async () => {
            const result = await executor.signUp({
                email: 'jwt@example.com',
                password: 'password123',
            })

            const token = result.data!.accessToken
            const parts = token.split('.')
            expect(parts.length).toBe(3) // Valid JWT format
        })
    })

    describe('signIn', () => {
        beforeEach(async () => {
            // Create a test user
            await executor.signUp({
                email: 'existing@example.com',
                password: 'correct-password',
                name: 'Existing User',
            })
        })

        it('should sign in with correct credentials', async () => {
            const result = await executor.signIn({
                email: 'existing@example.com',
                password: 'correct-password',
            })

            expect(result.error).toBeNull()
            expect(result.data).not.toBeNull()
            expect(result.data!.user.email).toBe('existing@example.com')
            expect(result.data!.user.name).toBe('Existing User')
            expect(result.data!.accessToken).toBeDefined()
        })

        it('should reject incorrect password', async () => {
            const result = await executor.signIn({
                email: 'existing@example.com',
                password: 'wrong-password',
            })

            expect(result.error).not.toBeNull()
            expect(result.error!.message).toBe('Invalid email or password')
            expect(result.data).toBeNull()
        })

        it('should reject non-existent email', async () => {
            const result = await executor.signIn({
                email: 'nonexistent@example.com',
                password: 'any-password',
            })

            expect(result.error).not.toBeNull()
            expect(result.error!.message).toBe('Invalid email or password')
            expect(result.data).toBeNull()
        })

        it('should be case-sensitive for password', async () => {
            const result = await executor.signIn({
                email: 'existing@example.com',
                password: 'Correct-Password', // Different case
            })

            expect(result.error).not.toBeNull()
            expect(result.data).toBeNull()
        })

        it('should return valid tokens on each sign in', async () => {
            const result1 = await executor.signIn({
                email: 'existing@example.com',
                password: 'correct-password',
            })

            const result2 = await executor.signIn({
                email: 'existing@example.com',
                password: 'correct-password',
            })

            // Both should return valid JWT tokens
            expect(result1.data!.accessToken).toBeDefined()
            expect(result2.data!.accessToken).toBeDefined()
            expect(result1.data!.accessToken.split('.').length).toBe(3)
            expect(result2.data!.accessToken.split('.').length).toBe(3)
        })
    })

    describe('signOut', () => {
        it('should return success (no-op for simplified auth)', async () => {
            const result = await executor.signOut()

            expect(result.error).toBeNull()
            expect(result.data).toBeUndefined()
        })
    })

    describe('getUserById', () => {
        beforeEach(async () => {
            await executor.signUp({
                email: 'findme@example.com',
                password: 'password123',
                name: 'Find Me',
            })
        })

        it('should find user by ID', async () => {
            const userId = tables.auth_users[0].id
            const result = await executor.getUserById(userId)

            expect(result.error).toBeNull()
            expect(result.data).not.toBeNull()
            expect(result.data!.email).toBe('findme@example.com')
            expect(result.data!.name).toBe('Find Me')
        })

        it('should return null for non-existent ID', async () => {
            const result = await executor.getUserById('non-existent-id')

            expect(result.error).toBeNull()
            expect(result.data).toBeNull()
        })

        it('should not include password hash in returned user', async () => {
            const userId = tables.auth_users[0].id
            const result = await executor.getUserById(userId)

            expect(result.data).not.toHaveProperty('passwordHash')
        })
    })

    describe('getUserByEmail', () => {
        beforeEach(async () => {
            await executor.signUp({
                email: 'findbyemail@example.com',
                password: 'password123',
                name: 'Find By Email',
            })
        })

        it('should find user by email', async () => {
            const result = await executor.getUserByEmail('findbyemail@example.com')

            expect(result.error).toBeNull()
            expect(result.data).not.toBeNull()
            expect(result.data!.email).toBe('findbyemail@example.com')
            expect(result.data!.name).toBe('Find By Email')
        })

        it('should return null for non-existent email', async () => {
            const result = await executor.getUserByEmail('nonexistent@example.com')

            expect(result.error).toBeNull()
            expect(result.data).toBeNull()
        })
    })
})

