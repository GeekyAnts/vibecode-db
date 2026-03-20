/**
 * Database client configuration
 *
 * This file creates the vibecode client using the local schema.
 * Supports multiple adapters: SQLite (local), Supabase (cloud), Custom API.
 */

import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@vibecode-db/client'
import { supabaseAdapter, CustomAdapter, createRESTHandlers } from '@vibecode-db/client'
import { rapidbaseAdapter } from '@vibecode-db/client/adapters/rapidbase'


// Import schema and types from local db
import { dbSpec, migrations } from './schema'
export type { Post, Profile, Todo, StorageFile, User } from './schema'

// Adapter type from environment
type AdapterType = 'sqlite' | 'supabase' | 'custom' | 'rapidbase'
const ADAPTER_TYPE: AdapterType = (process.env.EXPO_PUBLIC_ADAPTER as AdapterType) || 'supabase'

// Platform-specific auth config
function getAuthConfig() {
	const baseConfig = {
		autoRefresh: true,
		persistSession: true,
	}

	// On native platforms, use AsyncStorage for session persistence
	// On web, use default localStorage
	if (Platform.OS !== 'web') {
		return {
			...baseConfig,
			storage: AsyncStorage,
			detectSessionInUrl: false,
		}
	}

	return baseConfig
}

// Create adapter based on type and platform
function createAdapter() {
	if (ADAPTER_TYPE === 'supabase') {
		return supabaseAdapter({
			url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
			key: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
			auth: getAuthConfig(),
		})
	}

	if (ADAPTER_TYPE === 'custom') {
		return (ctx: any) => new CustomAdapter(ctx, {
			handlers: createRESTHandlers({
				baseUrl: process.env.EXPO_PUBLIC_CUSTOM_API_URL || 'https://api.example.com',
				headers: () => ({ 'Content-Type': 'application/json' }),
			}),
			onInit: async () => {
				console.log('CustomAdapter connected')
			},
		})
	}

	// RapidBase adapter - connects to rapidbase database via rapidnative-website consumer API
	if (ADAPTER_TYPE === 'rapidbase') {
		const rapidbaseUrl = process.env.EXPO_PUBLIC_RAPIDBASE_URL || 'http://localhost:3000'
		const rapidbaseApiUrl = `${rapidbaseUrl}/api/rapidbase/consumer/${process.env.EXPO_PUBLIC_RAPIDBASE_PROJECT_ID}`

		console.log('RapidBase connecting to:', rapidbaseApiUrl)

		// Client mode: Auth enabled by default
		// - Web: uses localStorage automatically
		// - Native: pass AsyncStorage for session persistence
		return rapidbaseAdapter({
			url: rapidbaseApiUrl,
			apiKey: process.env.EXPO_PUBLIC_RAPIDBASE_ANON_KEY || 'rapidbase-dev-key',
			auth: Platform.OS !== 'web' ? { storage: AsyncStorage } : {},
			debug: __DEV__,
		})
	}

	// SQLite adapter - only available on native platforms
	if (Platform.OS === 'web') {
		// Fall back to supabase on web if sqlite is selected
		console.warn('SQLite adapter not available on web, falling back to Supabase')
		return supabaseAdapter({
			url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
			key: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
			auth: getAuthConfig(),
		})
	}

	// Dynamically import sqlite-expo only on native
	const { sqliteExpoAdapter } = require('@vibecode-db/sqlite-expo')
	return sqliteExpoAdapter({
		dbName: 'vibecode.db',
		migrations,
		enableForeignKeys: true,
		seedBehavior: 'upsert',
		resetOnStart: __DEV__,
		auth: {
			jwtSecret: process.env.EXPO_PUBLIC_JWT_SECRET || 'dev-secret-key-change-in-production',
		},
	})
}

// Build the client with selected adapter
export const vibecode = createClient({
	dbSpec,
	adapter: createAdapter(),
})

// Utility function for relative time formatting
export function relativeTime(date: string | Date): string {
	const now = new Date()
	const past = new Date(date)
	const diffMs = now.getTime() - past.getTime()
	const diffSec = Math.floor(diffMs / 1000)
	const diffMin = Math.floor(diffSec / 60)
	const diffHour = Math.floor(diffMin / 60)
	const diffDay = Math.floor(diffHour / 24)

	if (diffSec < 60) return 'just now'
	if (diffMin < 60) return `${diffMin}m ago`
	if (diffHour < 24) return `${diffHour}h ago`
	if (diffDay < 7) return `${diffDay}d ago`
	return past.toLocaleDateString()
}

// Validation helpers
export const signInSchema = {
	safeParse: (data: { email: string; password: string }) => {
		const errors: string[] = []
		if (!data.email || !data.email.includes('@')) {
			errors.push('Valid email is required')
		}
		if (!data.password || data.password.length < 6) {
			errors.push('Password must be at least 6 characters')
		}
		return errors.length === 0
			? { success: true as const, data }
			: { success: false as const, error: { errors } }
	},
}

export const signUpSchema = {
	safeParse: (data: { email: string; password: string; name?: string }) => {
		const errors: string[] = []
		if (!data.email || !data.email.includes('@')) {
			errors.push('Valid email is required')
		}
		if (!data.password || data.password.length < 6) {
			errors.push('Password must be at least 6 characters')
		}
		return errors.length === 0
			? { success: true as const, data }
			: { success: false as const, error: { errors } }
	},
}

export function getFirstErrorMessage(error: { errors: string[] }): string {
	return error.errors[0] || 'Validation failed'
}
