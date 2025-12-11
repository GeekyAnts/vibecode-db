import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BaseSQLiteAuthAdapter } from '../../packages/sqlite-core/src/auth/base-adapter'
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
            // Handle CREATE TABLE (migrations)
            if (sql.includes('CREATE TABLE')) {
                return
            }

            // Handle INSERT
            if (sql.includes('INSERT') && sql.includes('auth_users')) {
                const [id, email, passwordHash, name, createdAt, updatedAt] = params as string[]

                // Handle INSERT OR REPLACE (for seeding)
                const existingIndex = tables.auth_users.findIndex(u => u.id === id || u.email === email)
                if (existingIndex >= 0) {
                    tables.auth_users[existingIndex] = { id, email, passwordHash, name, createdAt, updatedAt }
                } else {
                    tables.auth_users.push({ id, email, passwordHash, name, createdAt, updatedAt })
                }
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

describe('BaseSQLiteAuthAdapter', () => {
    let adapter: BaseSQLiteAuthAdapter
    let mockDriver: SqlDriver
    let tables: Record<string, Record<string, any>[]>

    beforeEach(async () => {
        const mock = createMockDriver()
        mockDriver = mock.driver
        tables = mock.tables

        adapter = new BaseSQLiteAuthAdapter(
            () => mockDriver,
            Promise.resolve(), // driverReady
            { jwtSecret: 'test-secret' }
        )

        // Wait for adapter initialization
        await new Promise(resolve => setTimeout(resolve, 50))
    })

    describe('signUp', () => {
        it('should create a new user and store session', async () => {
            const result = await adapter.signUp({
                email: 'newuser@example.com',
                password: 'password123',
                name: 'New User',
            })

            expect(result.error).toBeNull()
            expect(result.data).not.toBeNull()
            expect(result.data!.user.email).toBe('newuser@example.com')
            expect(result.data!.accessToken).toBeDefined()
        })

        it('should update internal session state', async () => {
            await adapter.signUp({
                email: 'session@example.com',
                password: 'password123',
            })

            const session = await adapter.getSession()
            expect(session.data).not.toBeNull()
            expect(session.data!.user.email).toBe('session@example.com')
        })
    })

    describe('signIn', () => {
        beforeEach(async () => {
            await adapter.signUp({
                email: 'existing@example.com',
                password: 'password123',
                name: 'Existing User',
            })
            // Clear session to simulate fresh sign in
            await adapter.signOut()
        })

        it('should sign in and update session', async () => {
            const result = await adapter.signIn({
                email: 'existing@example.com',
                password: 'password123',
            })

            expect(result.error).toBeNull()
            expect(result.data!.user.email).toBe('existing@example.com')

            const session = await adapter.getSession()
            expect(session.data).not.toBeNull()
            expect(session.data!.user.email).toBe('existing@example.com')
        })

        it('should not update session on failed sign in', async () => {
            const result = await adapter.signIn({
                email: 'existing@example.com',
                password: 'wrong-password',
            })

            expect(result.error).not.toBeNull()

            const session = await adapter.getSession()
            expect(session.data).toBeNull()
        })
    })

    describe('signOut', () => {
        beforeEach(async () => {
            await adapter.signUp({
                email: 'logout@example.com',
                password: 'password123',
            })
        })

        it('should clear the session', async () => {
            // Verify session exists before sign out
            let session = await adapter.getSession()
            expect(session.data).not.toBeNull()

            // Sign out
            const result = await adapter.signOut()
            expect(result.error).toBeNull()

            // Verify session is cleared
            session = await adapter.getSession()
            expect(session.data).toBeNull()
        })
    })

    describe('getSession', () => {
        it('should return null when no session exists', async () => {
            const session = await adapter.getSession()
            expect(session.data).toBeNull()
            expect(session.error).toBeNull()
        })

        it('should return session after sign up', async () => {
            await adapter.signUp({
                email: 'getsession@example.com',
                password: 'password123',
                name: 'Get Session',
            })

            const session = await adapter.getSession()
            expect(session.data).not.toBeNull()
            expect(session.data!.user.email).toBe('getsession@example.com')
            expect(session.data!.user.name).toBe('Get Session')
            expect(session.data!.accessToken).toBeDefined()
        })
    })

    describe('getUser', () => {
        it('should return null when no session exists', async () => {
            const result = await adapter.getUser()
            expect(result.data).toBeNull()
            expect(result.error).toBeNull()
        })

        it('should return user when session exists', async () => {
            await adapter.signUp({
                email: 'getuser@example.com',
                password: 'password123',
                name: 'Get User',
            })

            const result = await adapter.getUser()
            expect(result.data).not.toBeNull()
            expect(result.data!.email).toBe('getuser@example.com')
            expect(result.data!.name).toBe('Get User')
        })
    })

    describe('refreshSession', () => {
        it('should return current session (no-op for simplified auth)', async () => {
            await adapter.signUp({
                email: 'refresh@example.com',
                password: 'password123',
            })

            const result = await adapter.refreshSession('any-token')
            expect(result.data).not.toBeNull()
            expect(result.data!.user.email).toBe('refresh@example.com')
        })

        it('should return null when no session exists', async () => {
            const result = await adapter.refreshSession('any-token')
            expect(result.data).toBeNull()
        })
    })

    describe('unsupported operations', () => {
        it('resetPassword should return not supported error', async () => {
            const result = await adapter.resetPassword({ email: 'any@example.com' })
            expect(result.error).not.toBeNull()
            expect(result.error!.message).toContain('not supported')
        })

        it('resetPasswordConfirm should return not supported error', async () => {
            const result = await adapter.resetPasswordConfirm({ token: 'any', password: 'new' })
            expect(result.error).not.toBeNull()
            expect(result.error!.message).toContain('not supported')
        })

        it('changePassword should return not supported error', async () => {
            const result = await adapter.changePassword({ currentPassword: 'old', newPassword: 'new' })
            expect(result.error).not.toBeNull()
            expect(result.error!.message).toContain('not supported')
        })

        it('updateUser should return not supported error', async () => {
            const result = await adapter.updateUser({ name: 'New Name' })
            expect(result.error).not.toBeNull()
            expect(result.error!.message).toContain('not supported')
        })
    })

    describe('seeding', () => {
        it('should seed users when authSpec.seed is provided', async () => {
            const seededAdapter = new BaseSQLiteAuthAdapter(
                () => mockDriver,
                Promise.resolve(),
                { jwtSecret: 'test-secret' },
                {
                    seed: {
                        users: [
                            { id: 'seed-1', email: 'seeded@example.com', password: 'seeded-pass', name: 'Seeded User' },
                        ],
                    },
                }
            )

            // Wait for initialization and seeding
            await new Promise(resolve => setTimeout(resolve, 100))

            // Try to sign in with seeded user
            const result = await seededAdapter.signIn({
                email: 'seeded@example.com',
                password: 'seeded-pass',
            })

            expect(result.error).toBeNull()
            expect(result.data!.user.email).toBe('seeded@example.com')
            expect(result.data!.user.name).toBe('Seeded User')
        })
    })

    describe('getUserById', () => {
        it('should return user by ID', async () => {
            const signUpResult = await adapter.signUp({
                email: 'byid@example.com',
                password: 'password123',
                name: 'By ID',
            })

            const userId = signUpResult.data!.user.id
            const result = await adapter.getUserById(userId)

            expect(result.error).toBeNull()
            expect(result.data).not.toBeNull()
            expect(result.data!.email).toBe('byid@example.com')
        })
    })

    describe('getUserByEmail', () => {
        it('should return user by email', async () => {
            await adapter.signUp({
                email: 'byemail@example.com',
                password: 'password123',
                name: 'By Email',
            })

            const result = await adapter.getUserByEmail('byemail@example.com')

            expect(result.error).toBeNull()
            expect(result.data).not.toBeNull()
            expect(result.data!.name).toBe('By Email')
        })
    })
})

