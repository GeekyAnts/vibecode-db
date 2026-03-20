import { useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { cssInterop } from 'react-native-css-interop';
import {
	ArrowLeft,
	Check,
	Camera,
	User,
	Trash2,
} from 'lucide-react-native';
import { useTheme } from '../../src/hooks';

cssInterop(ArrowLeft, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Check, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});
cssInterop(Camera, {
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
cssInterop(Trash2, {
	className: {
		target: 'style',
		nativeStyleToProp: { color: true, width: true, height: true },
	},
});

type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';
type StudyTime = 'Morning' | 'Afternoon' | 'Evening';
type DifficultyPref = 'Beginner' | 'Intermediate' | 'Advanced';

const genderOptions: Gender[] = ['Male', 'Female', 'Other', 'Prefer not to say'];
const studyTimeOptions: StudyTime[] = ['Morning', 'Afternoon', 'Evening'];
const difficultyOptions: DifficultyPref[] = ['Beginner', 'Intermediate', 'Advanced'];
const interestOptions = [
	'Programming',
	'Design',
	'Business',
	'Marketing',
	'Data Science',
	'AI/ML',
];

export default function EditProfileScreen() {
	const { isDark } = useTheme();
	const router = useRouter();

	const [fullName, setFullName] = useState('Alex Johnson');
	const [email, setEmail] = useState('alex.johnson@email.com');
	const [phone, setPhone] = useState('+1 (555) 123-4567');
	const [dateOfBirth, setDateOfBirth] = useState('1995-06-15');
	const [gender, setGender] = useState<Gender>('Male');
	const [studyTime, setStudyTime] = useState<StudyTime>('Morning');
	const [dailyGoal, setDailyGoal] = useState('2');
	const [difficulty, setDifficulty] = useState<DifficultyPref>('Intermediate');
	const [selectedInterests, setSelectedInterests] = useState<string[]>([
		'Programming',
		'Design',
	]);

	const toggleInterest = (interest: string) => {
		setSelectedInterests((prev) =>
			prev.includes(interest)
				? prev.filter((i) => i !== interest)
				: [...prev, interest]
		);
	};

	const handleSave = () => {
		Alert.alert('Success', 'Profile updated successfully!', [
			{ text: 'OK', onPress: () => router.back() },
		]);
	};

	const handleDeleteAccount = () => {
		Alert.alert(
			'Delete Account',
			'Are you sure you want to delete your account? This action cannot be undone.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: () => {
						// Handle account deletion
					},
				},
			]
		);
	};

	return (
		<SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
			{/* Header */}
			<View className="flex-row items-center justify-between px-5 py-3">
				<TouchableOpacity
					onPress={() => router.back()}
					className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
				>
					<ArrowLeft color={isDark ? '#D1D5DB' : '#374151'} size={20} strokeWidth={2} />
				</TouchableOpacity>
				<Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
					Edit Profile
				</Text>
				<TouchableOpacity
					onPress={handleSave}
					className="w-10 h-10 rounded-full bg-indigo-500 items-center justify-center"
				>
					<Check color="#FFFFFF" size={20} strokeWidth={2} />
				</TouchableOpacity>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 40 }}
			>
				{/* Profile Photo */}
				<View className="items-center py-6">
					<View className="relative">
						<View className="w-28 h-28 rounded-full bg-indigo-100 items-center justify-center">
							<User color="#6366F1" size={48} strokeWidth={1.5} />
						</View>
						<TouchableOpacity className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-indigo-500 items-center justify-center border-4 border-white dark:border-gray-900">
							<Camera color="#FFFFFF" size={18} strokeWidth={2} />
						</TouchableOpacity>
					</View>
					<TouchableOpacity className="mt-3">
						<Text className="text-indigo-500 text-sm font-semibold">
							Change Photo
						</Text>
					</TouchableOpacity>
				</View>

				{/* Personal Information */}
				<View className="px-5">
					<Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
						Personal Information
					</Text>

					{/* Full Name */}
					<View className="mb-4">
						<Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
							Full Name
						</Text>
						<TextInput
							className={`rounded-2xl px-4 py-3.5 text-base ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
							value={fullName}
							onChangeText={setFullName}
							placeholder="Enter your full name"
							placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
						/>
					</View>

					{/* Email */}
					<View className="mb-4">
						<Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
							Email
						</Text>
						<TextInput
							className={`rounded-2xl px-4 py-3.5 text-base ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
							value={email}
							onChangeText={setEmail}
							placeholder="Enter your email"
							placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
							keyboardType="email-address"
							autoCapitalize="none"
						/>
					</View>

					{/* Phone */}
					<View className="mb-4">
						<Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
							Phone
						</Text>
						<TextInput
							className={`rounded-2xl px-4 py-3.5 text-base ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
							value={phone}
							onChangeText={setPhone}
							placeholder="Enter your phone number"
							placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
							keyboardType="phone-pad"
						/>
					</View>

					{/* Date of Birth */}
					<View className="mb-4">
						<Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
							Date of Birth
						</Text>
						<TextInput
							className={`rounded-2xl px-4 py-3.5 text-base ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
							value={dateOfBirth}
							onChangeText={setDateOfBirth}
							placeholder="YYYY-MM-DD"
							placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
						/>
					</View>

					{/* Gender */}
					<View className="mb-6">
						<Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
							Gender
						</Text>
						<View className="flex-row flex-wrap gap-2">
							{genderOptions.map((option) => (
								<TouchableOpacity
									key={option}
									onPress={() => setGender(option)}
									className={`rounded-full px-4 py-2.5 ${
										gender === option
											? 'bg-indigo-500'
											: isDark
											? 'bg-gray-800'
											: 'bg-white'
									}`}
								>
									<Text
										className={`text-sm font-semibold ${
											gender === option
												? 'text-white'
												: isDark
												? 'text-gray-300'
												: 'text-gray-700'
										}`}
									>
										{option}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>
				</View>

				{/* Learning Preferences */}
				<View className="px-5">
					<Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
						Learning Preferences
					</Text>

					{/* Preferred Study Time */}
					<View className="mb-4">
						<Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
							Preferred Study Time
						</Text>
						<View className="flex-row gap-2">
							{studyTimeOptions.map((option) => (
								<TouchableOpacity
									key={option}
									onPress={() => setStudyTime(option)}
									className={`flex-1 rounded-2xl py-3 items-center ${
										studyTime === option
											? 'bg-indigo-500'
											: isDark
											? 'bg-gray-800'
											: 'bg-white'
									}`}
								>
									<Text
										className={`text-sm font-semibold ${
											studyTime === option
												? 'text-white'
												: isDark
												? 'text-gray-300'
												: 'text-gray-700'
										}`}
									>
										{option}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>

					{/* Daily Study Goal */}
					<View className="mb-4">
						<Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
							Daily Study Goal (hours)
						</Text>
						<TextInput
							className={`rounded-2xl px-4 py-3.5 text-base ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
							value={dailyGoal}
							onChangeText={setDailyGoal}
							placeholder="Enter hours per day"
							placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
							keyboardType="numeric"
						/>
					</View>

					{/* Difficulty Preference */}
					<View className="mb-4">
						<Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
							Difficulty Preference
						</Text>
						<View className="flex-row gap-2">
							{difficultyOptions.map((option) => (
								<TouchableOpacity
									key={option}
									onPress={() => setDifficulty(option)}
									className={`flex-1 rounded-2xl py-3 items-center ${
										difficulty === option
											? 'bg-indigo-500'
											: isDark
											? 'bg-gray-800'
											: 'bg-white'
									}`}
								>
									<Text
										className={`text-sm font-semibold ${
											difficulty === option
												? 'text-white'
												: isDark
												? 'text-gray-300'
												: 'text-gray-700'
										}`}
									>
										{option}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>

					{/* Learning Interests */}
					<View className="mb-6">
						<Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
							Learning Interests
						</Text>
						<View className="flex-row flex-wrap gap-2">
							{interestOptions.map((interest) => {
								const isSelected = selectedInterests.includes(interest);
								return (
									<TouchableOpacity
										key={interest}
										onPress={() => toggleInterest(interest)}
										className={`rounded-full px-4 py-2.5 ${
											isSelected
												? 'bg-indigo-500'
												: isDark
												? 'bg-gray-800'
												: 'bg-white'
										}`}
									>
										<Text
											className={`text-sm font-semibold ${
												isSelected
													? 'text-white'
													: isDark
													? 'text-gray-300'
													: 'text-gray-700'
											}`}
										>
											{interest}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>
					</View>
				</View>

				{/* Save Button */}
				<View className="px-5 mb-4">
					<TouchableOpacity
						onPress={handleSave}
						className="bg-indigo-500 rounded-2xl py-4 items-center"
					>
						<Text className="text-white text-base font-bold">Save Changes</Text>
					</TouchableOpacity>
				</View>

				{/* Delete Account */}
				<View className="px-5">
					<TouchableOpacity
						onPress={handleDeleteAccount}
						className={`rounded-2xl py-4 flex-row items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
					>
						<Trash2 color="#EF4444" size={18} strokeWidth={2} />
						<Text className="text-red-500 text-sm font-semibold ml-2">
							Delete Account
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
