import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { View, useColorScheme as useSystemColorScheme } from 'react-native';
import { useColorScheme, colorScheme as nativeWindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { lightTheme, darkTheme } from '../../theme';

const THEME_STORAGE_KEY = '@app_theme_preference';

type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
	colorScheme: ResolvedTheme;
	themePreference: ThemePreference;
	setThemePreference: (scheme: ThemePreference) => void;
	toggleColorScheme: () => void;
	isDark: boolean;
	isReady: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const systemColorScheme = useSystemColorScheme();
	const { setColorScheme } = useColorScheme();

	const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme | null>(null);
	const [isReady, setIsReady] = useState(false);

	const resolveTheme = useCallback((preference: ThemePreference): ResolvedTheme => {
		if (preference === 'system') {
			return systemColorScheme === 'dark' ? 'dark' : 'light';
		}
		return preference;
	}, [systemColorScheme]);

	const applyTheme = useCallback((theme: ResolvedTheme) => {
		setResolvedTheme(theme);
		setColorScheme(theme);
		nativeWindColorScheme.set(theme);
	}, [setColorScheme]);

	useEffect(() => {
		const loadTheme = async () => {
			try {
				const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
				if (saved === 'light' || saved === 'dark' || saved === 'system') {
					setThemePreferenceState(saved);
					const resolved = resolveTheme(saved);
					applyTheme(resolved);
				} else {
					const resolved = resolveTheme('system');
					applyTheme(resolved);
				}
			} catch (error) {
				console.error('Failed to load theme:', error);
				const resolved = resolveTheme('system');
				applyTheme(resolved);
			} finally {
				setIsReady(true);
				SplashScreen.hideAsync();
			}
		};
		loadTheme();
	}, []);

	useEffect(() => {
		if (isReady && themePreference === 'system') {
			const resolved = resolveTheme('system');
			applyTheme(resolved);
		}
	}, [systemColorScheme, themePreference, isReady, resolveTheme, applyTheme]);

	const setThemePreference = useCallback(async (preference: ThemePreference) => {
		setThemePreferenceState(preference);
		try {
			await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
		} catch (error) {
			console.error('Failed to save theme:', error);
		}
		const resolved = resolveTheme(preference);
		applyTheme(resolved);
	}, [resolveTheme, applyTheme]);

	const toggleColorScheme = useCallback(() => {
		const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
		setThemePreference(newTheme);
	}, [resolvedTheme, setThemePreference]);

	const finalTheme: ResolvedTheme = resolvedTheme ?? (systemColorScheme === 'dark' ? 'dark' : 'light');

	const value: ThemeContextType = {
		colorScheme: finalTheme,
		themePreference,
		setThemePreference,
		toggleColorScheme,
		isDark: finalTheme === 'dark',
		isReady,
	};

	const themeVars = finalTheme === 'dark' ? darkTheme : lightTheme;

	if (!isReady) {
		return null;
	}

	return (
		<ThemeContext.Provider value={value}>
			<View style={[{ flex: 1 }, themeVars]} className={`${finalTheme} flex-1 bg-background`}>
				{children}
			</View>
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextType {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
