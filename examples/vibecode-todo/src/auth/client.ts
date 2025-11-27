// @ts-ignore - Auth exports will be available after build
import { createAuthClient, SQLiteAuthAdapter, SupabaseAuthAdapter } from '@vibecode-db/client'

const which = import.meta.env.VITE_VIBECODE_ADAPTER as 'sqlite' | 'supabase' | 'custom'

// Lazy initialization - adapter factory is called when auth is first used
// At that point, the database adapter will already be initialized
let authInstance: ReturnType<typeof createAuthClient> | null = null

function getAuthClient() {
    if (authInstance) return authInstance

    authInstance = createAuthClient({
        authSpec: {
            // No seed users - users will sign up through the UI
        },
        adapter: (authSpec: any) => {
            if (which === 'supabase') {
                return new SupabaseAuthAdapter(authSpec, {
                    url: import.meta.env.VITE_SUPABASE_URL as string,
                    key: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
                })
            } else {
                // SQLite (browser) — sql.js in-memory
                // Access the adapter from the global window (set by db/client)
                // @ts-ignore - dev-only global
                const dbAdapter = window.__vcode_sqlite
                if (!dbAdapter) {
                    throw new Error('Database adapter not found. Make sure db/client is imported and initialized.')
                }

                return new SQLiteAuthAdapter(authSpec, {
                    getDriver: () => {
                        // @ts-ignore - getDriver is available on BaseSQLiteAdapter
                        return dbAdapter.getDriver()
                    },
                    // @ts-ignore - getReady is available on BaseSQLiteAdapter
                    ready: dbAdapter.getReady(),
                    jwtSecret: import.meta.env.VITE_JWT_SECRET || 'dev-secret-key-change-in-production',
                    accessTokenExpiry: 3600, // 1 hour
                    refreshTokenExpiry: 604800, // 7 days
                    passwordResetTokenExpiry: 3600, // 1 hour
                    seedBehavior: 'upsert',
                })
            }
        },
    })

    return authInstance
}

// Export auth with lazy initialization
export const auth = new Proxy({} as ReturnType<typeof createAuthClient>, {
    get(_target, prop) {
        const client = getAuthClient()
        const value = (client as any)[prop]
        if (typeof value === 'function') {
            return value.bind(client)
        }
        return value
    }
})

