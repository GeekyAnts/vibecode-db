import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'react-native-css-interop';
import {
	TrendingUp,
	BookCheck,
	Clock,
	Award,
	Trophy,
	Flame,
	FileText,
	Lock,
	CheckCircle,
} from 'lucide-react-native';
import { useTheme } from '../../src/hooks';

cssInterop(TrendingUp, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(BookCheck, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Clock, {
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
cssInterop(Trophy, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Flame, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(FileText, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Lock, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(CheckCircle, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});

type TimeRange = 'Week' | 'Month' | 'Year';

const weeklyData = [
	{ day: 'Mon', value: 3 },
	{ day: 'Tue', value: 5 },
	{ day: 'Wed', value: 2 },
	{ day: 'Thu', value: 7 },
	{ day: 'Fri', value: 4 },
	{ day: 'Sat', value: 6 },
	{ day: 'Sun', value: 3 },
];

const maxValue = Math.max(...weeklyData.map((d) => d.value));

interface Achievement {
	id: string;
	title: string;
	description: string;
	icon: any;
	unlocked: boolean;
	progress: number;
	color: string;
	bgColor: string;
}

const achievements: Achievement[] = [
	{
		id: '1',
		title: '7-Day Streak',
		description: 'Study for 7 consecutive days',
		icon: Flame,
		unlocked: true,
		progress: 100,
		color: '#F97316',
		bgColor: '#FFF7ED',
	},
	{
		id: '2',
		title: 'Course Master',
		description: 'Complete 10 courses',
		icon: Trophy,
		unlocked: false,
		progress: 70,
		color: '#6366F1',
		bgColor: '#EEF2FF',
	},
	{
		id: '3',
		title: 'Note Taker',
		description: 'Write 50 notes',
		icon: FileText,
		unlocked: false,
		progress: 45,
		color: '#EC4899',
		bgColor: '#FDF2F8',
	},
];

function AchievementCard({
	achievement,
	isDark,
}: {
	achievement: Achievement;
	isDark: boolean;
}) {
	const IconComp = achievement.icon;
	return (
		<View
			className={`rounded-2xl p-4 mb-3 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
		>
			<View className="flex-row items-center">
				<View
					className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
					style={{ backgroundColor: isDark ? '#374151' : achievement.bgColor }}
				>
					<IconComp
						color={achievement.color}
						size={24}
						strokeWidth={2}
					/>
				</View>
				<View className="flex-1">
					<View className="flex-row items-center justify-between mb-0.5">
						<Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							{achievement.title}
						</Text>
						{achievement.unlocked ? (
							<CheckCircle color="#22C55E" size={18} strokeWidth={2} />
						) : (
							<Lock color={isDark ? '#6B7280' : '#9CA3AF'} size={18} strokeWidth={2} />
						)}
					</View>
					<Text className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
						{achievement.description}
					</Text>
					<View className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
						<View
							className="h-full rounded-full"
							style={{
								width: `${achievement.progress}%`,
								backgroundColor: achievement.color,
							}}
						/>
					</View>
					<Text className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
						{achievement.unlocked ? 'Unlocked!' : `${achievement.progress}% complete`}
					</Text>
				</View>
			</View>
		</View>
	);
}

export default function ProgressScreen() {
	const { isDark } = useTheme();
	const [timeRange, setTimeRange] = useState<TimeRange>('Week');

	return (
		<SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 24 }}
			>
				{/* Header */}
				<View className="px-5 pt-4 pb-2">
					<Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
						Progress
					</Text>
					<Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
						Track your learning journey
					</Text>
				</View>

				{/* Time Range Selector */}
				<View className={`mx-5 mt-4 flex-row rounded-2xl p-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
					{(['Week', 'Month', 'Year'] as TimeRange[]).map((range) => (
						<TouchableOpacity
							key={range}
							onPress={() => setTimeRange(range)}
							className={`flex-1 py-2.5 rounded-xl items-center ${
								timeRange === range
									? 'bg-indigo-500'
									: ''
							}`}
						>
							<Text
								className={`text-sm font-semibold ${
									timeRange === range
										? 'text-white'
										: isDark
										? 'text-gray-400'
										: 'text-gray-600'
								}`}
							>
								{range}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Stat Cards */}
				<View className="flex-row px-5 mt-4 gap-3">
					<View className={`flex-1 rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
						<View className="flex-row items-center mb-2">
							<View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-2">
								<BookCheck color="#6366F1" size={16} strokeWidth={2} />
							</View>
						</View>
						<Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							24
						</Text>
						<Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
							Lessons Completed
						</Text>
						<View className="flex-row items-center mt-1">
							<TrendingUp color="#22C55E" size={12} strokeWidth={2} />
							<Text className="text-xs text-green-500 ml-1 font-semibold">
								+15%
							</Text>
						</View>
					</View>
					<View className={`flex-1 rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
						<View className="flex-row items-center mb-2">
							<View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
								<Clock color="#3B82F6" size={16} strokeWidth={2} />
							</View>
						</View>
						<Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							18.5h
						</Text>
						<Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
							Hours Studied
						</Text>
						<View className="flex-row items-center mt-1">
							<TrendingUp color="#22C55E" size={12} strokeWidth={2} />
							<Text className="text-xs text-green-500 ml-1 font-semibold">
								+8%
							</Text>
						</View>
					</View>
				</View>

				{/* Weekly Activity Chart */}
				<View className="mt-6 px-5">
					<Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
						Weekly Activity
					</Text>
					<View className={`rounded-2xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
						<View className="flex-row items-end justify-between" style={{ height: 140 }}>
							{weeklyData.map((item) => {
								const barHeight = (item.value / maxValue) * 110;
								return (
									<View key={item.day} className="items-center flex-1">
										<Text className={`text-[10px] mb-1 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
											{item.value}h
										</Text>
										<View
											className="w-8 rounded-t-lg bg-indigo-500"
											style={{ height: barHeight }}
										/>
										<Text className={`text-[10px] mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
											{item.day}
										</Text>
									</View>
								);
							})}
						</View>
					</View>
				</View>

				{/* Learning Stats */}
				<View className="mt-6 px-5">
					<Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
						Learning Stats
					</Text>
					<View className={`rounded-2xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
						<View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
							<View className="flex-row items-center">
								<View className="w-10 h-10 rounded-xl bg-indigo-100 items-center justify-center mr-3">
									<BookCheck color="#6366F1" size={20} strokeWidth={2} />
								</View>
								<Text className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
									Courses Completed
								</Text>
							</View>
							<Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
								5
							</Text>
						</View>
						<View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
							<View className="flex-row items-center">
								<View className="w-10 h-10 rounded-xl bg-yellow-100 items-center justify-center mr-3">
									<Award color="#F59E0B" size={20} strokeWidth={2} />
								</View>
								<Text className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
									Certificates
								</Text>
							</View>
							<Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
								3
							</Text>
						</View>
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center">
								<View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center mr-3">
									<Trophy color="#22C55E" size={20} strokeWidth={2} />
								</View>
								<Text className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
									Avg Quiz Score
								</Text>
							</View>
							<Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
								85%
							</Text>
						</View>
					</View>
				</View>

				{/* Achievements */}
				<View className="mt-6 px-5">
					<Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
						Achievements
					</Text>
					{achievements.map((achievement) => (
						<AchievementCard
							key={achievement.id}
							achievement={achievement}
							isDark={isDark}
						/>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
