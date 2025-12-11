import { describe, it, expect } from 'vitest'
import {
    hashPassword,
    verifyPassword,
    generateJWT,
    verifyJWT,
    generateUUID,
} from '../../packages/sqlite-core/src/auth/utils'

describe('Auth Utils', () => {
    describe('hashPassword', () => {
        it('should hash a password', async () => {
            const password = 'test-password-123'
            const hash = await hashPassword(password)

            expect(hash).toBeDefined()
            expect(typeof hash).toBe('string')
            expect(hash.length).toBe(64) // SHA-256 produces 64 hex characters
        })

        it('should produce consistent hashes for same password', async () => {
            const password = 'same-password'
            const hash1 = await hashPassword(password)
            const hash2 = await hashPassword(password)

            expect(hash1).toBe(hash2)
        })

        it('should produce different hashes for different passwords', async () => {
            const hash1 = await hashPassword('password1')
            const hash2 = await hashPassword('password2')

            expect(hash1).not.toBe(hash2)
        })

        it('should handle empty password', async () => {
            const hash = await hashPassword('')
            expect(hash).toBeDefined()
            expect(hash.length).toBe(64)
        })

        it('should handle unicode passwords', async () => {
            const hash = await hashPassword('пароль123🔐')
            expect(hash).toBeDefined()
            expect(hash.length).toBe(64)
        })
    })

    describe('verifyPassword', () => {
        it('should verify correct password', async () => {
            const password = 'my-secret-password'
            const hash = await hashPassword(password)

            const isValid = await verifyPassword(password, hash)
            expect(isValid).toBe(true)
        })

        it('should reject incorrect password', async () => {
            const password = 'my-secret-password'
            const hash = await hashPassword(password)

            const isValid = await verifyPassword('wrong-password', hash)
            expect(isValid).toBe(false)
        })

        it('should reject empty password against valid hash', async () => {
            const hash = await hashPassword('real-password')

            const isValid = await verifyPassword('', hash)
            expect(isValid).toBe(false)
        })

        it('should handle case sensitivity', async () => {
            const hash = await hashPassword('Password')

            expect(await verifyPassword('Password', hash)).toBe(true)
            expect(await verifyPassword('password', hash)).toBe(false)
            expect(await verifyPassword('PASSWORD', hash)).toBe(false)
        })
    })

    describe('generateJWT', () => {
        it('should generate a valid JWT format', () => {
            const payload = { userId: '123', email: 'test@example.com' }
            const secret = 'my-secret'

            const token = generateJWT(payload, secret)

            expect(token).toBeDefined()
            const parts = token.split('.')
            expect(parts.length).toBe(3) // header.payload.signature
        })

        it('should include payload data in token', () => {
            const payload = { userId: 'user-123', role: 'admin' }
            const secret = 'secret'

            const token = generateJWT(payload, secret)
            const decoded = verifyJWT(token, secret)

            expect(decoded).not.toBeNull()
            expect(decoded!.userId).toBe('user-123')
            expect(decoded!.role).toBe('admin')
        })

        it('should include issued-at timestamp', () => {
            const payload = { userId: '123' }
            const secret = 'secret'

            const beforeTime = Math.floor(Date.now() / 1000)
            const token = generateJWT(payload, secret)
            const afterTime = Math.floor(Date.now() / 1000)

            const decoded = verifyJWT(token, secret)

            expect(decoded!.iat).toBeGreaterThanOrEqual(beforeTime)
            expect(decoded!.iat).toBeLessThanOrEqual(afterTime)
        })

        it('should handle empty payload', () => {
            const token = generateJWT({}, 'secret')
            const decoded = verifyJWT(token, 'secret')

            expect(decoded).not.toBeNull()
            expect(decoded!.iat).toBeDefined()
        })

        it('should handle complex payload', () => {
            const payload = {
                userId: '123',
                email: 'test@example.com',
                permissions: ['read', 'write'],
                metadata: { key: 'value' },
            }

            const token = generateJWT(payload, 'secret')
            const decoded = verifyJWT(token, 'secret')

            expect(decoded!.userId).toBe('123')
            expect(decoded!.email).toBe('test@example.com')
            expect(decoded!.permissions).toEqual(['read', 'write'])
            expect(decoded!.metadata).toEqual({ key: 'value' })
        })
    })

    describe('verifyJWT', () => {
        it('should verify valid token', () => {
            const payload = { userId: '123' }
            const secret = 'secret'

            const token = generateJWT(payload, secret)
            const decoded = verifyJWT(token, secret)

            expect(decoded).not.toBeNull()
            expect(decoded!.userId).toBe('123')
        })

        it('should return null for invalid token format', () => {
            expect(verifyJWT('invalid', 'secret')).toBeNull()
            expect(verifyJWT('a.b', 'secret')).toBeNull()
            expect(verifyJWT('', 'secret')).toBeNull()
        })

        it('should return null for malformed base64', () => {
            expect(verifyJWT('!!!.@@@.###', 'secret')).toBeNull()
        })

        it('should return null for non-JSON payload', () => {
            // Create a token with non-JSON payload
            const invalidToken = 'eyJhbGciOiJIUzI1NiJ9.bm90LWpzb24.signature'
            expect(verifyJWT(invalidToken, 'secret')).toBeNull()
        })
    })

    describe('generateUUID', () => {
        it('should generate valid UUID v4 format', () => {
            const uuid = generateUUID()

            // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            expect(uuid).toMatch(uuidRegex)
        })

        it('should generate unique UUIDs', () => {
            const uuids = new Set<string>()

            for (let i = 0; i < 1000; i++) {
                uuids.add(generateUUID())
            }

            // All 1000 UUIDs should be unique
            expect(uuids.size).toBe(1000)
        })

        it('should have correct version (4) in UUID', () => {
            const uuid = generateUUID()
            const parts = uuid.split('-')

            // Third part should start with '4' for v4
            expect(parts[2][0]).toBe('4')
        })

        it('should have correct variant in UUID', () => {
            const uuid = generateUUID()
            const parts = uuid.split('-')

            // Fourth part first char should be 8, 9, a, or b
            expect(['8', '9', 'a', 'b']).toContain(parts[3][0])
        })
    })
})

