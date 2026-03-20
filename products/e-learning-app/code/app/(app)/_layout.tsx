import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cssInterop } from 'react-native-css-interop';
import {
	Home,
	BookOpen,
	Library,
	TrendingUp,
	User,
} from 'lucide-react-native';
import { useTheme } from '../../src/hooks';

cssInterop(Home, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(BookOpen, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Library, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(TrendingUp, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(User, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});

export default function AppLayout() {
	const insets = useSafeAreaInsets();
	const { isDark } = useTheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: '#6366F1',
				tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
				tabBarStyle: {
					backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
					borderTopColor: isDark ? '#374151' : '#E5E7EB',
					borderTopWidth: 1,
					paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
					paddingTop: 8,
					height: Platform.OS === 'ios' ? 84 + insets.bottom : 64,
				},
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: '600',
					marginTop: 2,
				},
			}}
		>
			<Tabs.Screen
				name="home"
				options={{
					title: 'Home',
					tabBarIcon: ({ color, size }) => (
						<Home color={color} size={size} strokeWidth={2} />
					),
				}}
			/>
			<Tabs.Screen
				name="courses"
				options={{
					title: 'Courses',
					tabBarIcon: ({ color, size }) => (
						<BookOpen color={color} size={size} strokeWidth={2} />
					),
				}}
			/>
			<Tabs.Screen
				name="my-learning"
				options={{
					title: 'My Learning',
					tabBarIcon: ({ color, size }) => (
						<Library color={color} size={size} strokeWidth={2} />
					),
				}}
			/>
			<Tabs.Screen
				name="progress"
				options={{
					title: 'Progress',
					tabBarIcon: ({ color, size }) => (
						<TrendingUp color={color} size={size} strokeWidth={2} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: 'Profile',
					tabBarIcon: ({ color, size }) => (
						<User color={color} size={size} strokeWidth={2} />
					),
				}}
			/>
			<Tabs.Screen
				name="edit-profile"
				options={{
					href: null,
				}}
			/>
		</Tabs>
	);
}
