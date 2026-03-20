/**
 * useAuth Hook
 *
 * Authentication hook providing user state and auth actions.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vibecode } from '../db/client'
import type { User } from '../db/client'

export const authKeys = {
	session: ['auth', 'session'] as const,
	user: ['auth', 'user'] as const,
}

export function useAuth() {
	const queryClient = useQueryClient()
	console.log(queryClient, 'data here');

	// Get current session
	const sessionQuery = useQuery({
		queryKey: authKeys.session,
		queryFn: async () => {
			const { data, error } = await vibecode.auth.getSession()

			if (error) throw error
			return data
		},
		staleTime: 1000 * 60 * 5,
		retry: false,
	})

	// Sign in
	const signIn = useMutation({
		mutationFn: async (credentials: { email: string; password: string }) => {
			const { data, error } = await vibecode.auth.signIn(credentials)
			if (error) throw error
			return data
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.session }),
	})

	// Sign up
	const signUp = useMutation({
		mutationFn: async (credentials: { email: string; password: string; name?: string }) => {
			const { data, error } = await vibecode.auth.signUp(credentials)
			if (error) throw error
			return data
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.session }),
	})

	// Sign out
	const signOut = useMutation({
		mutationFn: async () => {
			const { error } = await vibecode.auth.signOut()
			if (error) throw error
		},
		onSuccess: () => queryClient.clear(),
	})

	return {
		user: sessionQuery.data?.user ?? null,
		session: sessionQuery.data,
		isAuthenticated: !!sessionQuery.data?.user,
		isLoading: sessionQuery.isLoading,
		signIn,
		signUp,
		signOut,
	}
}

export type { User }
