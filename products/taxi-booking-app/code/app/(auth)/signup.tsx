import { useState } from 'react';
import { Platform, Image } from 'react-native';
import { Link as ExpoLink } from 'expo-router';
import {
	SafeAreaView,
	KeyboardAvoidingView,
	ScrollView,
	Box,
	VStack,
	HStack,
	Heading,
	Input,
	InputField,
	Text,
	Pressable,
	Spinner,
} from '../../components/ui';
import { vibecode, signUpSchema, getFirstErrorMessage } from '../../src/db/client';

export default function SignUp() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleSignUp = async () => {
		setError(null);
		setSuccess(null);

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		const result = signUpSchema.safeParse({ email, password, name: name || undefined });
		if (!result.success) {
			setError(getFirstErrorMessage(result.error));
			return;
		}

		setIsLoading(true);
		try {
			const { data, error: apiError } = await vibecode.auth.signUp({
				email,
				password,
				name: name || undefined,
			});

			if (apiError) {
				setError(apiError.message);
				return;
			}

			if (data) {
				if (!data.accessToken) {
					setSuccess('Please check your email to verify your account before signing in.');
					return;
				}
				(globalThis as any).__setAuthUser?.(data.user);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to sign up');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background-0 dark:bg-background-950">
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1"
			>
				<ScrollView
					contentContainerClassName="flex-grow justify-center"
					keyboardShouldPersistTaps="handled"
				>
					<Box className="flex-1 px-4 py-10">
						{/* Header */}
						<VStack className="mb-8">
							<HStack className="flex-row items-center gap-2">
								<Image
									source={require('../../assets/icon.png')}
									style={{ width: 48, height: 48, borderRadius: 10 }}
								/>
								<Heading size="2xl" className="leading-none text-typography-900 dark:text-typography-100">
									Sign Up
								</Heading>
							</HStack>
							<Text className="text-typography-500 dark:text-typography-400 mt-1">
								Create an account to get started
							</Text>
						</VStack>

						{/* Form */}
						<VStack space="md" className="w-full">
							<VStack space="xs">
								<Text className="text-typography-700 dark:text-typography-300 text-sm">
									Name (optional)
								</Text>
								<Input
									size="md"
									variant="outline"
									className="border-outline-200 dark:border-outline-800"
								>
									<InputField
										placeholder="John Doe"
										placeholderTextColor="#9CA3AF"
										value={name}
										onChangeText={setName}
										autoComplete="name"
										className="text-typography-900 dark:text-typography-100"
									/>
								</Input>
							</VStack>

							<VStack space="xs">
								<Text className="text-typography-700 dark:text-typography-300 text-sm">
									Email
								</Text>
								<Input
									size="md"
									variant="outline"
									className="border-outline-200 dark:border-outline-800"
								>
									<InputField
										placeholder="email@example.com"
										placeholderTextColor="#9CA3AF"
										value={email}
										onChangeText={setEmail}
										autoCapitalize="none"
										keyboardType="email-address"
										autoComplete="email"
										className="text-typography-900 dark:text-typography-100"
									/>
								</Input>
							</VStack>

							<VStack space="xs">
								<Text className="text-typography-700 dark:text-typography-300 text-sm">
									Password
								</Text>
								<Input
									size="md"
									variant="outline"
									className="border-outline-200 dark:border-outline-800"
								>
									<InputField
										placeholder="Create password"
										placeholderTextColor="#9CA3AF"
										value={password}
										onChangeText={setPassword}
										secureTextEntry
										autoComplete="password-new"
										className="text-typography-900 dark:text-typography-100"
									/>
								</Input>
							</VStack>

							<VStack space="xs">
								<Text className="text-typography-700 dark:text-typography-300 text-sm">
									Confirm Password
								</Text>
								<Input
									size="md"
									variant="outline"
									className="border-outline-200 dark:border-outline-800"
								>
									<InputField
										placeholder="Confirm password"
										placeholderTextColor="#9CA3AF"
										value={confirmPassword}
										onChangeText={setConfirmPassword}
										secureTextEntry
										className="text-typography-900 dark:text-typography-100"
									/>
								</Input>
							</VStack>

							{error && (
								<Box className="p-3 rounded-lg bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800">
									<Text className="text-error-600 dark:text-error-400 text-sm">{error}</Text>
								</Box>
							)}

							{success && (
								<Box className="p-3 rounded-lg bg-success-50 dark:bg-success-950 border border-success-200 dark:border-success-800">
									<Text className="text-success-600 dark:text-success-400 text-sm">{success}</Text>
								</Box>
							)}

							<Pressable
								onPress={handleSignUp}
								disabled={isLoading}
								className="py-3 mt-4 border border-outline-200 dark:border-outline-800 rounded-lg"
							>
								{isLoading ? (
									<Spinner size="small" />
								) : (
									<Text className="text-typography-900 dark:text-typography-100 text-center font-medium">
										Create Account
									</Text>
								)}
							</Pressable>
						</VStack>

						{/* Footer */}
						<HStack space="xs" className="items-center mt-6">
							<Text className="text-typography-500 dark:text-typography-400">
								Already have an account?
							</Text>
							<ExpoLink href="/(auth)/signin" asChild>
								<Pressable>
									<Text className="text-typography-900 dark:text-typography-100 font-medium">
										Sign In
									</Text>
								</Pressable>
							</ExpoLink>
						</HStack>
					</Box>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
