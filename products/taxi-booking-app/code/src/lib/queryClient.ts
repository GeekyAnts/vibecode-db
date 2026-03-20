/**
 * Query Client Configuration
 *
 * Configures TanStack Query with offline persistence using AsyncStorage.
 * Data is cached locally and available even without internet connection.
 */

import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─────────────────────────────────────────────────────────────────────────────
// Query Client
// ─────────────────────────────────────────────────────────────────────────────

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered fresh (won't refetch)
      staleTime: 1000 * 60 * 5, // 5 minutes

      // How long inactive data stays in cache
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (must be >= persister maxAge)

      // Retry failed requests
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch behavior
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,

      // Network mode - important for offline support
      // 'offlineFirst' - return cached data immediately, then fetch
      // 'online' - only fetch when online
      // 'always' - always try to fetch
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations on network errors
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// AsyncStorage Persister
// ─────────────────────────────────────────────────────────────────────────────

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  // Key used to store the cache
  key: 'REACT_QUERY_OFFLINE_CACHE',
  // Throttle writes to storage (prevents excessive writes)
  throttleTime: 1000,
  // Optional: serialize/deserialize functions
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data),
})

// ─────────────────────────────────────────────────────────────────────────────
// Persist Options
// ─────────────────────────────────────────────────────────────────────────────

export const persistOptions = {
  persister: asyncStoragePersister,
  // Maximum age of persisted data (24 hours)
  maxAge: 1000 * 60 * 60 * 24,
  // Only persist successful queries
  dehydrateOptions: {
    shouldDehydrateQuery: (query: any) => {
      // Don't persist queries with errors
      if (query.state.status === 'error') return false
      // Don't persist auth queries (security)
      if (query.queryKey[0] === 'auth') return false
      return true
    },
  },
}
