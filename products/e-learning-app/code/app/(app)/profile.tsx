import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { cssInterop } from 'react-native-css-interop';
import { useQueryClient } from '@tanstack/react-query';
import {
	User,
	Award,
	Sun,
	Moon,
	ChevronRight,
	Edit3,
	Bell,
	Bookmark,
	Shield,
	Settings,
	LogOut,
	RefreshCw,
} from 'lucide-react-native';
import { useTheme, useAuth } from '../../src/hooks';

cssInterop(User, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Award, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Sun, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Moon, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(ChevronRight, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Edit3, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Bell, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Bookmark, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Shield, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Settings, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(LogOut, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(RefreshCw, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});

const accountItems = [
	{ icon: Award, label: 'Certificates', subtitle: 'View your earned certificates', color: '#F59E0B', bg: 'bg-amber-50' },
	{ icon: Bookmark, label: 'Bookmarks', subtitle: 'Saved courses and lessons', color: '#3B82F6', bg: 'bg-blue-50' },
	{ icon: Bell, label: 'Notifications', subtitle: 'Manage your notifications', color: '#8B5CF6', bg: 'bg-violet-50' },
	{ icon: Shield, label: 'Privacy & Security', subtitle: 'Manage your account security', color: '#10B981', bg: 'bg-emerald-50' },
	{ icon: Settings, label: 'Settings', subtitle: 'App preferences', color: '#6B7280', bg: 'bg-gray-100' },
];

export default function ProfileScreen() {
	const { isDark, themePreference, setThemePreference } = useTheme();
	const { signOut } = useAuth();
	const queryClient = useQueryClient();
	const router = useRouter();

	const handleSignOut = () => {
		Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Sign Out',
				style: 'destructive',
				onPress: async () => {
					try {
						await signOut.mutateAsync();
					} catch (error) {
						console.error('Sign out error:', error);
					}
				},
			},
		]);
	};

	const themeLabel = themePreference === 'light' ? 'Light Mode' : themePreference === 'dark' ? 'Dark Mode' : 'System';
	const nextTheme = themePreference === 'light' ? 'dark' : themePreference === 'dark' ? 'system' : 'light';

	return (
		<SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
			{/* Header */}
			<View className="flex-row items-center justify-between px-5 pt-2 pb-4">
				<Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
					Profile
				</Text>
				<TouchableOpacity
					onPress={() => queryClient.invalidateQueries()}
					className="w-10 h-10 items-center justify-center"
				>
					<RefreshCw
						color={isDark ? '#9CA3AF' : '#6B7280'}
						size={20}
						strokeWidth={2}
					/>
				</TouchableOpacity>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 32 }}
			>
				{/* Profile Card */}
				<View className={`mx-5 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
					{/* User Info */}
					<View className="items-center pt-6 pb-4">
						<View className={`w-20 h-20 rounded-full items-center justify-center mb-3 ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
							<User
								color={isDark ? '#93C5FD' : '#3B82F6'}
								size={36}
								strokeWidth={1.5}
							/>
						</View>
						<Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							John Doe
						</Text>
						<Text className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
							john@example.com
						</Text>
						<TouchableOpacity
							onPress={() => router.push('/(app)/edit-profile' as any)}
							className="mt-3 bg-blue-500 flex-row items-center px-5 py-2.5 rounded-full"
						>
							<Edit3 color="#FFFFFF" size={14} strokeWidth={2} />
							<Text className="text-white text-sm font-semibold ml-1.5">
								Edit Profile
							</Text>
						</TouchableOpacity>
					</View>

					{/* Stats Row */}
					<View className={`flex-row border-t ${isDark ? 'border-gray-700' : 'border-gray-100'} mx-4 pt-4 pb-5`}>
						<View className="flex-1 items-center">
							<Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
								4
							</Text>
							<Text className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
								Courses
							</Text>
						</View>
						<View className={`w-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
						<View className="flex-1 items-center">
							<Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
								142
							</Text>
							<Text className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
								Lessons
							</Text>
						</View>
						<View className={`w-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
						<View className="flex-1 items-center">
							<Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
								1
							</Text>
							<Text className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
								Certificates
							</Text>
						</View>
					</View>
				</View>

				{/* Appearance Section */}
				<View className="mt-6 px-5">
					<Text className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
						Appearance
					</Text>
					<TouchableOpacity
						onPress={() => setThemePreference(nextTheme)}
						className={`rounded-2xl px-4 py-4 flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
					>
						<View className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
							<Sun
								color={isDark ? '#FBBF24' : '#3B82F6'}
								size={18}
								strokeWidth={2}
							/>
						</View>
						<Text className={`flex-1 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
							{themeLabel}
						</Text>
						<RefreshCw
							color={isDark ? '#4B5563' : '#9CA3AF'}
							size={16}
							strokeWidth={2}
						/>
					</TouchableOpacity>
				</View>

				{/* Account Section */}
				<View className="mt-6 px-5">
					<Text className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
						Account
					</Text>
					<View className={`rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
						{accountItems.map((item, index) => {
							const IconComp = item.icon;
							return (
								<TouchableOpacity
									key={item.label}
									className={`flex-row items-center px-4 py-3.5 ${
										index < accountItems.length - 1
											? isDark ? 'border-b border-gray-700' : 'border-b border-gray-100'
											: ''
									}`}
								>
									<View className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${isDark ? 'bg-gray-700' : item.bg}`}>
										<IconComp
											color={isDark ? '#D1D5DB' : item.color}
											size={18}
											strokeWidth={2}
										/>
									</View>
									<View className="flex-1">
										<Text className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
											{item.label}
										</Text>
										<Text className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
											{item.subtitle}
										</Text>
									</View>
									<ChevronRight
										color={isDark ? '#4B5563' : '#D1D5DB'}
										size={18}
										strokeWidth={2}
									/>
								</TouchableOpacity>
							);
						})}
					</View>
				</View>

				{/* Sign Out */}
				<View className="mt-6 px-5">
					<TouchableOpacity
						onPress={handleSignOut}
						className={`rounded-2xl py-4 flex-row items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
					>
						<LogOut color="#EF4444" size={18} strokeWidth={2} />
						<Text className="text-red-500 text-sm font-semibold ml-2">
							Sign Out
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
