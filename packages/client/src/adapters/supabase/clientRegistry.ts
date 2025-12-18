import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Client registry for sharing Supabase clients across adapters.
 * 
 * This ensures that when multiple adapters use the same (url, key) credentials,
 * they share the same SupabaseClient instance, which is critical for session
 * sharing in React Native/Expo environments.
 * 
 * The registry is scoped to this module (not truly global), providing isolation
 * while allowing sharing within the same package instance.
 */
const clientRegistry = new Map<string, SupabaseClient>()

/**
 * Reference counting to track how many adapters are using each client.
 * This helps with debugging and potential future cleanup.
 */
const clientRefs = new Map<string, number>()


/**
 * Get or create a Supabase client for the given credentials.
 * 
 * If a client already exists for these credentials, it is reused.
 * Otherwise, a new client is created and stored in the registry.
 * 
 * @param url - Supabase project URL
 * @param key - Supabase anon/public key
 * @param storage - Optional storage instance (AsyncStorage for React Native)
 * @returns A SupabaseClient instance (shared if credentials match)
 * 
 * @example
 * ```ts
 * // First adapter creates client
 * const client1 = getOrCreateClient('https://xxx.supabase.co', 'key123', storage)
 * 
 * // Second adapter reuses same client (same credentials)
 * const client2 = getOrCreateClient('https://xxx.supabase.co', 'key123', storage)
 * // client1 === client2 (same instance)
 * ```
 */
export function getOrCreateClient(url: string, key: string, storage?: any): SupabaseClient {
    const registryKey = `${url}|${key}`

    // Check if client already exists
    if (clientRegistry.has(registryKey)) {
        const existingClient = clientRegistry.get(registryKey)!
        // Increment reference count
        const currentRefs = clientRefs.get(registryKey) || 0
        clientRefs.set(registryKey, currentRefs + 1)
        return existingClient
    }

    // Create new client with storage if provided (for React Native)
    const clientOptions: any = {}
    if (storage) {
        clientOptions.auth = {
            storage: storage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        }
    }
    // If no storage: Browser uses localStorage automatically, React Native uses in-memory

    const newClient = createSupabaseClient(url, key, clientOptions)
    clientRegistry.set(registryKey, newClient)
    clientRefs.set(registryKey, 1)

    return newClient
}

/**
 * Clear the client registry (useful for testing or cleanup).
 * 
 * @internal
 */
export function clearClientRegistry(): void {
    clientRegistry.clear()
    clientRefs.clear()
}

/**
 * Get the number of references for a specific client (useful for debugging).
 * 
 * @internal
 */
export function getClientRefCount(url: string, key: string): number {
    const registryKey = `${url}|${key}`
    return clientRefs.get(registryKey) || 0
}

/**
 * Get the AsyncStorage key that Supabase uses for storing the auth token.
 * 
 * Format: `sb-<project-ref>-auth-token`
 * 
 * The project reference is extracted from the Supabase URL.
 * 
 * @param url - Supabase project URL (e.g., 'https://abc123xyz.supabase.co')
 * @returns The storage key (e.g., 'sb-abc123xyz-auth-token')
 * 
 * @example
 * ```ts
 * import { getSupabaseStorageKey } from '@vibecode-db/client'
 * import AsyncStorage from '@react-native-async-storage/async-storage'
 * 
 * const key = getSupabaseStorageKey('https://abc123xyz.supabase.co')
 * // Returns: 'sb-abc123xyz-auth-token'
 * 
 * // Check if session exists
 * const token = await AsyncStorage.getItem(key)
 * ```
 */
export function getSupabaseStorageKey(url: string): string {
    // Extract project reference from URL
    // Format: https://<project-ref>.supabase.co
    const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/)
    if (!match) {
        throw new Error(`Invalid Supabase URL format: ${url}`)
    }
    const projectRef = match[1]
    return `sb-${projectRef}-auth-token`
}

