import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vibecode, type User } from '../db/client'

export type { User }

export const authKeys = {
	session: ['auth', 'session'] as const,
	user: ['auth', 'user'] as const,
}

export function useAuth() {
	const queryClient = useQueryClient()

	const sessionQuery = useQuery({
		queryKey: authKeys.session,
		queryFn: async () => {
			const { data, error } = await vibecode.auth.getSession()
			if (error) throw error
			return data
		},
		staleTime: 1000 * 60 * 5,
	})

	const user: User | null = sessionQuery.data?.user ?? null

	const signIn = useMutation({
		mutationFn: async ({ email, password }: { email: string; password: string }) => {
			const { data, error } = await vibecode.auth.signIn({ email, password })
			if (error) throw new Error(error.message)
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.session })
		},
	})

	const signUp = useMutation({
		mutationFn: async ({ email, password, name }: { email: string; password: string; name?: string }) => {
			const { data, error } = await vibecode.auth.signUp({ email, password, name })
			if (error) throw new Error(error.message)
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.session })
		},
	})

	const signOut = useMutation({
		mutationFn: async () => {
			const { error } = await vibecode.auth.signOut()
			if (error) throw new Error(error.message)
		},
		onSuccess: () => {
			queryClient.clear()
		},
	})

	return {
		user,
		session: sessionQuery.data,
		isAuthenticated: !!sessionQuery.data?.user,
		isLoading: sessionQuery.isLoading,
		signIn,
		signUp,
		signOut,
	}
}
