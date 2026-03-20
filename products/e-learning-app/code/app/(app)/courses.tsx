import { useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'react-native-css-interop';
import {
	Search,
	Activity,
	Code,
	Palette,
	Briefcase,
	Megaphone,
	Play,
	Star,
	Clock,
	Users,
} from 'lucide-react-native';
import { useTheme } from '../../src/hooks';

cssInterop(Search, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Activity, {
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
cssInterop(Megaphone, {
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
cssInterop(Clock, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Users, {
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

type Category = 'All' | 'Programming' | 'Design' | 'Business' | 'Marketing';

const categories: { name: Category; icon: any; IconComponent: any }[] = [
	{ name: 'All', icon: null, IconComponent: Activity },
	{ name: 'Programming', icon: null, IconComponent: Code },
	{ name: 'Design', icon: null, IconComponent: Palette },
	{ name: 'Business', icon: null, IconComponent: Briefcase },
	{ name: 'Marketing', icon: null, IconComponent: Megaphone },
];

interface Course {
	id: string;
	title: string;
	instructor: string;
	duration: string;
	rating: number;
	students: number;
	difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
	category: Category;
	image: any;
}

const coursesData: Course[] = [
	{
		id: '1',
		title: 'React Native from Scratch',
		instructor: 'Sarah Wilson',
		duration: '24h 30m',
		rating: 4.9,
		students: 3420,
		difficulty: 'Intermediate',
		category: 'Programming',
		image: courseImages[0],
	},
	{
		id: '2',
		title: 'Figma UI Design Bootcamp',
		instructor: 'James Lee',
		duration: '16h 45m',
		rating: 4.8,
		students: 2180,
		difficulty: 'Beginner',
		category: 'Design',
		image: courseImages[1],
	},
	{
		id: '3',
		title: 'Business Analytics Pro',
		instructor: 'Robert Taylor',
		duration: '20h 15m',
		rating: 4.7,
		students: 1560,
		difficulty: 'Advanced',
		category: 'Business',
		image: courseImages[2],
	},
	{
		id: '4',
		title: 'Digital Marketing Strategy',
		instructor: 'Emily Brown',
		duration: '14h 20m',
		rating: 4.6,
		students: 2890,
		difficulty: 'Beginner',
		category: 'Marketing',
		image: courseImages[3],
	},
	{
		id: '5',
		title: 'Advanced Python Programming',
		instructor: 'David Chen',
		duration: '28h 10m',
		rating: 4.9,
		students: 4210,
		difficulty: 'Advanced',
		category: 'Programming',
		image: courseImages[0],
	},
	{
		id: '6',
		title: 'Brand Design Masterclass',
		instructor: 'Maria Garcia',
		duration: '12h 50m',
		rating: 4.8,
		students: 1780,
		difficulty: 'Intermediate',
		category: 'Design',
		image: courseImages[1],
	},
];

function getDifficultyColor(difficulty: string) {
	switch (difficulty) {
		case 'Beginner':
			return { bg: 'bg-green-100', text: 'text-green-700' };
		case 'Intermediate':
			return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
		case 'Advanced':
			return { bg: 'bg-red-100', text: 'text-red-700' };
		default:
			return { bg: 'bg-gray-100', text: 'text-gray-700' };
	}
}

export default function CoursesScreen() {
	const { isDark } = useTheme();
	const [selectedCategory, setSelectedCategory] = useState<Category>('All');
	const [searchQuery, setSearchQuery] = useState('');

	const filteredCourses = coursesData.filter((course) => {
		const matchesCategory =
			selectedCategory === 'All' || course.category === selectedCategory;
		const matchesSearch =
			course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesCategory && matchesSearch;
	});

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
						Courses
					</Text>
					<Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
						Discover new skills
					</Text>
				</View>

				{/* Search Bar */}
				<View className="px-5 mt-3">
					<View
						className={`flex-row items-center rounded-2xl px-4 py-3 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
					>
						<Search color={isDark ? '#9CA3AF' : '#6B7280'} size={20} strokeWidth={2} />
						<TextInput
							className={`flex-1 ml-3 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
							placeholder="Search courses..."
							placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
							value={searchQuery}
							onChangeText={setSearchQuery}
						/>
					</View>
				</View>

				{/* Category Filter Chips */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 8 }}
				>
					{categories.map((cat) => {
						const isSelected = selectedCategory === cat.name;
						const IconComp = cat.IconComponent;
						return (
							<TouchableOpacity
								key={cat.name}
								onPress={() => setSelectedCategory(cat.name)}
								className={`flex-row items-center rounded-full px-4 py-2.5 ${
									isSelected
										? 'bg-indigo-500'
										: isDark
										? 'bg-gray-800'
										: 'bg-white'
								}`}
							>
								<IconComp
									color={isSelected ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280'}
									size={16}
									strokeWidth={2}
								/>
								<Text
									className={`ml-2 text-sm font-semibold ${
										isSelected
											? 'text-white'
											: isDark
											? 'text-gray-300'
											: 'text-gray-700'
									}`}
								>
									{cat.name}
								</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>

				{/* Quick Stats */}
				<View className="flex-row px-5 gap-3 mb-4">
					<View
						className={`flex-1 rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
					>
						<Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							12
						</Text>
						<Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
							Courses Enrolled
						</Text>
					</View>
					<View
						className={`flex-1 rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
					>
						<Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
							3
						</Text>
						<Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
							Completed
						</Text>
					</View>
				</View>

				{/* Course List */}
				{filteredCourses.map((course) => {
					const diffColors = getDifficultyColor(course.difficulty);
					return (
						<TouchableOpacity
							key={course.id}
							className={`mx-5 mb-3 rounded-2xl overflow-hidden flex-row ${isDark ? 'bg-gray-800' : 'bg-white'}`}
						>
							<View className="relative">
								<Image
									source={course.image}
									style={{ width: 112, height: 112 }}
									resizeMode="cover"
								/>
								<View className={`absolute top-2 left-2 rounded-full px-2 py-0.5 ${diffColors.bg}`}>
									<Text className={`text-[10px] font-bold ${diffColors.text}`}>
										{course.difficulty}
									</Text>
								</View>
							</View>
							<View className="flex-1 p-3 justify-between">
								<View>
									<Text
										className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
										numberOfLines={1}
									>
										{course.title}
									</Text>
									<Text className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
										{course.instructor}
									</Text>
								</View>
								<View>
									<View className="flex-row items-center mb-1">
										<Clock color={isDark ? '#6B7280' : '#9CA3AF'} size={12} strokeWidth={2} />
										<Text className={`text-xs ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
											{course.duration}
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
										<TouchableOpacity className="w-8 h-8 rounded-full bg-indigo-500 items-center justify-center">
											<Play color="#FFFFFF" size={14} strokeWidth={2} fill="#FFFFFF" />
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</TouchableOpacity>
					);
				})}
			</ScrollView>
		</SafeAreaView>
	);
}
