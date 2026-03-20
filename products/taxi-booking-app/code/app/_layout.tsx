import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AppProviders } from '../src/providers/AppProviders';
import { vibecode, type User } from '../src/db/client';
import '@/global.css';

// Keep splash screen visible until theme and auth are ready
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const segments = useSegments();
	const router = useRouter();

	// Check session on mount
	useEffect(() => {
		(async () => {
			try {
				const { data } = await vibecode.auth.getSession();

				console.log(data, vibecode.auth, 'data here auth');
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

	// Handle navigation based on auth state
	useEffect(() => {
		if (isLoading) return;

		const inAuthGroup = segments[0] === '(auth)';
		const isAuthenticated = !!user;

		if (!isAuthenticated && !inAuthGroup) {
			router.replace('/(auth)/signin');
		} else if (isAuthenticated && inAuthGroup) {
			router.replace('/(app)/home');
		}
	}, [user, segments, isLoading, router]);

	return (
		<>
			<StatusBar style="auto" />
			<Stack screenOptions={{ headerShown: false }}>
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
