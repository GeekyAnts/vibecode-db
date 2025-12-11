import { createAuthClient, SupabaseAuthAdapter } from '@vibecode-db/client'
import { SQLiteWebAuthAdapter } from '@vibecode-db/sqlite-web'
import { dbAdapter } from '../db/client'

const which = import.meta.env.VITE_VIBECODE_ADAPTER as 'sqlite' | 'supabase' | 'custom'

let authInstance: ReturnType<typeof createAuthClient> | null = null

function getAuthClient() {
    if (authInstance) return authInstance

    authInstance = createAuthClient({
        authSpec: {
            // No seed users - users will sign up through the UI
        },
        adapter: () => {
            if (which === 'supabase') {
                return new SupabaseAuthAdapter({}, {
                    url: import.meta.env.VITE_SUPABASE_URL as string,
                    key: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
                })
            } else {
                // SQLite (browser) — clean setup!
                if (!dbAdapter) {
                    throw new Error('Database adapter not initialized. Import db/client first.')
                }

                // Simple! Just pass the DB adapter and JWT secret
                return new SQLiteWebAuthAdapter(dbAdapter, {
                    jwtSecret: import.meta.env.VITE_JWT_SECRET || 'dev-secret-key-change-in-production',
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
