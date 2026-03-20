import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'react-native-css-interop';
import {
	BookOpen,
	CheckCircle,
	Clock,
	Bookmark,
	FileText,
	ChevronRight,
	Code,
	Palette,
	Briefcase,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../src/hooks';

cssInterop(BookOpen, {
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
cssInterop(Clock, {
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
cssInterop(FileText, {
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
cssInterop(Code, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Palette, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Briefcase, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});

const courseImages = [
	require('../../assets/images/cards/card-1.jpg'),
	require('../../assets/images/cards/card-2.jpg'),
	require('../../assets/images/cards/card-3.jpg'),
	require('../../assets/images/cards/card-4.jpg'),
];

const bookmarkedCourses = [
	{
		id: '1',
		title: 'Machine Learning A-Z',
		instructor: 'Andrew Smith',
		lessons: 42,
		duration: '22h 15m',
		image: courseImages[0],
	},
	{
		id: '2',
		title: 'SwiftUI Essentials',
		instructor: 'Lisa Park',
		lessons: 28,
		duration: '14h 30m',
		image: courseImages[1],
	},
	{
		id: '3',
		title: 'Product Management',
		instructor: 'Tom Harris',
		lessons: 18,
		duration: '10h 45m',
		image: courseImages[2],
	},
];

const recentNotes = [
	{
		id: '1',
		lessonTitle: 'React Hooks Deep Dive',
		courseTitle: 'React Native Masterclass',
		preview: 'useCallback is used to memoize functions and prevent unnecessary re-renders...',
		timestamp: '2 hours ago',
	},
	{
		id: '2',
		lessonTitle: 'Color Theory Basics',
		courseTitle: 'UI/UX Design Fundamentals',
		preview: 'The 60-30-10 rule: 60% dominant color, 30% secondary, 10% accent...',
		timestamp: '5 hours ago',
	},
	{
		id: '3',
		lessonTitle: 'Data Cleaning with Pandas',
		courseTitle: 'Python for Data Science',
		preview: 'Use dropna() to remove missing values and fillna() to replace them...',
		timestamp: 'Yesterday',
	},
	{
		id: '4',
		lessonTitle: 'State Management Patterns',
		courseTitle: 'React Native Masterclass',
		preview: 'Context API vs Redux vs Zustand - when to use each approach...',
		timestamp: '2 days ago',
	},
];

const skillsData = [
	{
		name: 'Programming',
		progress: 65,
		color: '#6366F1',
		bgColor: '#EEF2FF',
		IconComponent: Code,
	},
	{
		name: 'Design',
		progress: 40,
		color: '#EC4899',
		bgColor: '#FDF2F8',
		IconComponent: Palette,
	},
	{
		name: 'Business',
		progress: 25,
		color: '#F59E0B',
		bgColor: '#FFFBEB',
		IconComponent: Briefcase,
	},
];

function NutrientRing({
	progress,
	size,
	strokeWidth,
	color,
	bgColor,
}: {
	progress: number;
	size: number;
	strokeWidth: number;
	color: string;
	bgColor: string;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const strokeDashoffset = circumference - (progress / 100) * circumference;

	return (
		<Svg width={size} height={size}>
			<Circle
				stroke={bgColor}
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

function OverviewCircle({
	progress,
	size,
	strokeWidth,
	isDark,
}: {
	progress: number;
	size: number;
	strokeWidth: number;
	isDark: boolean;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const strokeDashoffset = circumference - (progress / 100) * circumference;

	return (
		<Svg width={size} height={size}>
			<Circle
				stroke={isDark ? '#374151' : '#E5E7EB'}
				fill="none"
				cx={size / 2}
				cy={size / 2}
				r={radius}
				strokeWidth={strokeWidth}
			/>
			<Circle
				stroke="#6366F1"
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

export default function MyLearningScreen() {
	const { isDark } = useTheme();

	const totalCourses = 8;
	const completedCourses = 3;
	const inProgressCourses = 5;
	const hoursStudied = 48.5;
	const overallProgress = Math.round((completedCourses / totalCourses) * 100);

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
						My Learning
					</Text>
					<Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
						Track your progress
					</Text>
				</View>

				{/* Overview Card */}
				<View className={`mx-5 mt-4 rounded-2xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
					<View className="flex-row items-center">
						{/* Progress Ring */}
						<View className="items-center justify-center mr-5">
							<OverviewCircle
								progress={overallProgress}
								size={100}
								strokeWidth={10}
								isDark={isDark}
							/>
							<View className="absolute items-center">
								<Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
									{overallProgress}%
								</Text>
								<Text className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
									Overall
								</Text>
							</View>
						</View>

						{/* Stats */}
						<View className="flex-1">
							<View className="flex-row items-center mb-3">
								<View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-3">
									<BookOpen color="#6366F1" size={16} strokeWidth={2} />
								</View>
								<View>
									<Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
										{inProgressCourses}
									</Text>
									<Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
										In Progress
									</Text>
								</View>
							</View>
							<View className="flex-row items-center mb-3">
								<View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
									<CheckCircle color="#22C55E" size={16} strokeWidth={2} />
								</View>
								<View>
									<Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
										{completedCourses}
									</Text>
									<Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
										Completed
									</Text>
								</View>
							</View>
							<View className="flex-row items-center">
								<View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
									<Clock color="#3B82F6" size={16} strokeWidth={2} />
								</View>
								<View>
									<Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
										{hoursStudied}h
									</Text>
									<Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
										Hours Studied
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>

				{/* Skills Breakdown */}
				<View className="mt-6">
					<View className="flex-row items-center justify-between px-5 mb-3">
						<Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							Skills Breakdown
						</Text>
					</View>
					<View className={`mx-5 rounded-2xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
						{skillsData.map((skill, index) => {
							const IconComp = skill.IconComponent;
							return (
								<View
									key={skill.name}
									className={`flex-row items-center ${index < skillsData.length - 1 ? 'mb-5' : ''}`}
								>
									<View className="items-center justify-center mr-4">
										<NutrientRing
											progress={skill.progress}
											size={56}
											strokeWidth={6}
											color={skill.color}
											bgColor={isDark ? '#374151' : skill.bgColor}
										/>
										<View className="absolute">
											<IconComp color={skill.color} size={18} strokeWidth={2} />
										</View>
									</View>
									<View className="flex-1">
										<View className="flex-row items-center justify-between mb-1">
											<Text className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
												{skill.name}
											</Text>
											<Text className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
												{skill.progress}%
											</Text>
										</View>
										<View className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
											<View
												className="h-full rounded-full"
												style={{
													width: `${skill.progress}%`,
													backgroundColor: skill.color,
												}}
											/>
										</View>
									</View>
								</View>
							);
						})}
					</View>
				</View>

				{/* Bookmarked Courses */}
				<View className="mt-6">
					<View className="flex-row items-center justify-between px-5 mb-3">
						<Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							Bookmarked Courses
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
						{bookmarkedCourses.map((course) => (
							<TouchableOpacity
								key={course.id}
								className={`w-56 rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}
							>
								<Image
									source={course.image}
									className="w-full h-28"
									resizeMode="cover"
								/>
								<View className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 items-center justify-center">
									<Bookmark color="#6366F1" size={16} strokeWidth={2} fill="#6366F1" />
								</View>
								<View className="p-3">
									<Text
										className={`text-sm font-bold mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}
										numberOfLines={1}
									>
										{course.title}
									</Text>
									<Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
										{course.instructor}
									</Text>
									<View className="flex-row items-center mt-2">
										<Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
											{course.lessons} lessons
										</Text>
										<View className={`w-1 h-1 rounded-full mx-2 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
										<Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
											{course.duration}
										</Text>
									</View>
								</View>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>

				{/* Recent Notes */}
				<View className="mt-6">
					<View className="flex-row items-center justify-between px-5 mb-3">
						<Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							Recent Notes
						</Text>
						<TouchableOpacity className="flex-row items-center">
							<Text className="text-indigo-500 text-sm font-semibold mr-1">
								See All
							</Text>
							<ChevronRight color="#6366F1" size={16} strokeWidth={2} />
						</TouchableOpacity>
					</View>
					{recentNotes.map((note) => (
						<TouchableOpacity
							key={note.id}
							className={`mx-5 mb-3 rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
						>
							<View className="flex-row items-start">
								<View className="w-10 h-10 rounded-xl bg-indigo-100 items-center justify-center mr-3 mt-0.5">
									<FileText color="#6366F1" size={18} strokeWidth={2} />
								</View>
								<View className="flex-1">
									<Text
										className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
										numberOfLines={1}
									>
										{note.lessonTitle}
									</Text>
									<Text className={`text-xs mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
										{note.courseTitle}
									</Text>
									<Text
										className={`text-xs leading-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
										numberOfLines={2}
									>
										{note.preview}
									</Text>
									<Text className={`text-[10px] mt-2 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
										{note.timestamp}
									</Text>
								</View>
							</View>
						</TouchableOpacity>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
