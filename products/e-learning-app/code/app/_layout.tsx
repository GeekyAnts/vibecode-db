import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AppProviders } from '../src/providers/AppProviders';
import { vibecode, type User } from '../src/db/client';
import { useTheme } from '../src/hooks';
import '@/global.css';

// Keep splash screen visible until theme and auth are ready
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const segments = useSegments();
	const router = useRouter();
	const { isDark } = useTheme();
	const navigationState = useRootNavigationState();
	// Check session on mount
	useEffect(() => {
		(async () => {
			try {
				const { data } = await vibecode.auth.getSession();
				setUser(data?.user ?? null);
			} catch (error) {
				console.error('Session check error:', error);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	// Handle auth state changes via global event
	useEffect(() => {
		const checkAuth = async () => {
			const { data } = await vibecode.auth.getSession();
			setUser(data?.user ?? null);
		};

		(globalThis as any).__setAuthUser = setUser;
		(globalThis as any).__checkAuth = checkAuth;

		return () => {
			delete (globalThis as any).__setAuthUser;
			delete (globalThis as any).__checkAuth;
		};
	}, []);

	// Handle navigation based on auth state — only on user change, not on segment change
	useEffect(() => {
		if (isLoading) return;
		if (!navigationState?.key) return; // Navigation not ready yet

		const inAuthGroup = segments[0] === '(auth)';
		const inOnboardingGroup = segments[0] === '(onboarding)';
		const isAuthenticated = !!user;

		if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
			router.replace('/(onboarding)/splash');
		} else if (isAuthenticated && inAuthGroup) {
			// Only redirect away from (auth) group, NOT from (onboarding)
			// because profile-setup lives in (onboarding) and is needed post-signup
			router.replace('/(app)/home');
		}
	}, [user, isLoading]);

	return (
		<>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(onboarding)" />
				<Stack.Screen name="(auth)" />
				<Stack.Screen name="(app)" />
			</Stack>
		</>
	);
}

export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<AppProviders>
				<RootLayoutNav />
			</AppProviders>
		</SafeAreaProvider>
	);
}
