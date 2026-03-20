import { useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Image,
	Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'react-native-css-interop';
import {
	Bell,
	Clock,
	Flame,
	BookOpen,
	ChevronRight,
	Play,
	Star,
	Award,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../src/hooks';

cssInterop(Bell, {
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
cssInterop(Flame, {
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
cssInterop(ChevronRight, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Play, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Star, {
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const courseImages = [
	require('../../assets/images/cards/card-1.jpg'),
	require('../../assets/images/cards/card-2.jpg'),
	require('../../assets/images/cards/card-3.jpg'),
	require('../../assets/images/cards/card-4.jpg'),
];

const continueLearningData = [
	{
		id: '1',
		title: 'React Native Masterclass',
		instructor: 'Sarah Wilson',
		progress: 65,
		lessonsLeft: 8,
		totalLessons: 24,
		image: courseImages[0],
	},
	{
		id: '2',
		title: 'UI/UX Design Fundamentals',
		instructor: 'James Lee',
		progress: 40,
		lessonsLeft: 12,
		totalLessons: 20,
		image: courseImages[1],
	},
	{
		id: '3',
		title: 'Python for Data Science',
		instructor: 'Maria Garcia',
		progress: 80,
		lessonsLeft: 4,
		totalLessons: 18,
		image: courseImages[2],
	},
];

const recommendedCourses = [
	{
		id: '1',
		title: 'Advanced TypeScript',
		instructor: 'David Chen',
		rating: 4.8,
		students: 2340,
		duration: '12h 30m',
		image: courseImages[3],
	},
	{
		id: '2',
		title: 'Machine Learning Basics',
		instructor: 'Emily Brown',
		rating: 4.9,
		students: 5120,
		duration: '18h 45m',
		image: courseImages[0],
	},
	{
		id: '3',
		title: 'Business Strategy 101',
		instructor: 'Robert Taylor',
		rating: 4.7,
		students: 1890,
		duration: '8h 15m',
		image: courseImages[1],
	},
];

function ProgressCircle({
	progress,
	size,
	strokeWidth,
	color,
}: {
	progress: number;
	size: number;
	strokeWidth: number;
	color: string;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const strokeDashoffset = circumference - (progress / 100) * circumference;

	return (
		<Svg width={size} height={size}>
			<Circle
				stroke="rgba(255,255,255,0.3)"
				fill="none"
				cx={size / 2}
				cy={size / 2}
				r={radius}
				strokeWidth={strokeWidth}
			/>
			<Circle
				stroke={color}
				fill="none"
				cx={size / 2}
				cy={size / 2}
				r={radius}
				strokeWidth={strokeWidth}
				strokeDasharray={`${circumference} ${circumference}`}
				strokeDashoffset={strokeDashoffset}
				strokeLinecap="round"
				rotation="-90"
				origin={`${size / 2}, ${size / 2}`}
			/>
		</Svg>
	);
}

export default function HomeScreen() {
	const { isDark } = useTheme();

	return (
		<SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 24 }}
			>
				{/* Header */}
				<View className="flex-row items-center justify-between px-5 pt-4 pb-2">
					<View>
						<Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
							Good morning
						</Text>
						<Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							Alex Johnson
						</Text>
					</View>
					<TouchableOpacity
						className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
					>
						<Bell color={isDark ? '#D1D5DB' : '#374151'} size={20} strokeWidth={2} />
						<View className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
					</TouchableOpacity>
				</View>

				{/* Today's Goal Gradient Card */}
				<View className="px-5 mt-4">
					<LinearGradient
						colors={['#6366F1', '#4F46E5']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={{ borderRadius: 20, padding: 20 }}
					>
						<View className="flex-row items-center justify-between">
							<View className="flex-1 mr-4">
								<Text className="text-white/80 text-sm font-medium mb-1">
									Today's Goal
								</Text>
								<Text className="text-white text-xl font-bold mb-2">
									Complete 2 Lessons
								</Text>
								<Text className="text-white/70 text-xs">
									You're almost there! Keep going.
								</Text>
								<TouchableOpacity className="bg-white/20 rounded-full px-4 py-2 mt-3 self-start">
									<Text className="text-white font-semibold text-sm">
										Continue Learning
									</Text>
								</TouchableOpacity>
							</View>
							<View className="items-center justify-center">
								<ProgressCircle
									progress={70}
									size={80}
									strokeWidth={8}
									color="#FFFFFF"
								/>
								<Text className="text-white text-lg font-bold absolute">
									70%
								</Text>
							</View>
						</View>
					</LinearGradient>
				</View>

				{/* Stat Cards */}
				<View className="flex-row px-5 mt-4 gap-3">
					{/* Study Time */}
					<View
						className={`flex-1 rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
					>
						<View className="flex-row items-center mb-2">
							<View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
								<Clock color="#3B82F6" size={16} strokeWidth={2} />
							</View>
							<Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
								Study Time
							</Text>
						</View>
						<Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							3.5 hrs
						</Text>
						<View className="mt-2 h-2 rounded-full bg-blue-100 overflow-hidden">
							<View className="h-full rounded-full bg-blue-500" style={{ width: '70%' }} />
						</View>
						<Text className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
							of 5h daily goal
						</Text>
					</View>

					{/* Streak */}
					<View
						className={`flex-1 rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
					>
						<View className="flex-row items-center mb-2">
							<View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-2">
								<Flame color="#F97316" size={16} strokeWidth={2} />
							</View>
							<Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
								Streak
							</Text>
						</View>
						<Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							12 days
						</Text>
						<View className="mt-2 h-2 rounded-full bg-orange-100 overflow-hidden">
							<View className="h-full rounded-full bg-orange-500" style={{ width: '85%' }} />
						</View>
						<Text className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
							Personal best: 14 days
						</Text>
					</View>
				</View>

				{/* Continue Learning */}
				<View className="mt-6">
					<View className="flex-row items-center justify-between px-5 mb-3">
						<Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							Continue Learning
						</Text>
						<TouchableOpacity className="flex-row items-center">
							<Text className="text-indigo-500 text-sm font-semibold mr-1">
								See All
							</Text>
							<ChevronRight color="#6366F1" size={16} strokeWidth={2} />
						</TouchableOpacity>
					</View>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
					>
						{continueLearningData.map((course) => (
							<TouchableOpacity
								key={course.id}
								className={`w-64 rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}
							>
								<Image
									source={course.image}
									className="w-full h-32"
									resizeMode="cover"
								/>
								<View className="p-3">
									<Text
										className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
										numberOfLines={1}
									>
										{course.title}
									</Text>
									<Text className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
										{course.instructor}
									</Text>
									<View className="h-1.5 rounded-full bg-indigo-100 overflow-hidden mb-1.5">
										<View
											className="h-full rounded-full bg-indigo-500"
											style={{ width: `${course.progress}%` }}
										/>
									</View>
									<View className="flex-row items-center justify-between">
										<Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
											{course.lessonsLeft} lessons left
										</Text>
										<Text className="text-xs text-indigo-500 font-semibold">
											{course.progress}%
										</Text>
									</View>
								</View>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>

				{/* Recommended Courses */}
				<View className="mt-6">
					<View className="flex-row items-center justify-between px-5 mb-3">
						<Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							Recommended Courses
						</Text>
						<TouchableOpacity className="flex-row items-center">
							<Text className="text-indigo-500 text-sm font-semibold mr-1">
								See All
							</Text>
							<ChevronRight color="#6366F1" size={16} strokeWidth={2} />
						</TouchableOpacity>
					</View>
					{recommendedCourses.map((course) => (
						<TouchableOpacity
							key={course.id}
							className={`mx-5 mb-3 rounded-2xl overflow-hidden flex-row ${isDark ? 'bg-gray-800' : 'bg-white'}`}
						>
							<Image
								source={course.image}
								className="w-24 h-24"
								resizeMode="cover"
							/>
							<View className="flex-1 p-3 justify-between">
								<View>
									<Text
										className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
										numberOfLines={1}
									>
										{course.title}
									</Text>
									<Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
										{course.instructor}
									</Text>
								</View>
								<View className="flex-row items-center justify-between">
									<View className="flex-row items-center">
										<Star color="#F59E0B" size={12} strokeWidth={2} fill="#F59E0B" />
										<Text className={`text-xs ml-1 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
											{course.rating}
										</Text>
										<Text className={`text-xs ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
											({course.students.toLocaleString()})
										</Text>
									</View>
									<Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
										{course.duration}
									</Text>
								</View>
							</View>
						</TouchableOpacity>
					))}
				</View>

				{/* Daily Challenge */}
				<View className="px-5 mt-4">
					<TouchableOpacity
						className={`rounded-2xl p-4 flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
					>
						<View className="w-12 h-12 rounded-2xl bg-indigo-100 items-center justify-center mr-4">
							<BookOpen color="#6366F1" size={24} strokeWidth={2} />
						</View>
						<View className="flex-1">
							<Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
								Daily Challenge
							</Text>
							<Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
								Complete a quiz to earn 50 XP
							</Text>
						</View>
						<View className="bg-indigo-500 rounded-full px-4 py-2">
							<Text className="text-white text-sm font-semibold">Start</Text>
						</View>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
