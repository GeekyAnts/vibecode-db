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
import { vibecode, signInSchema, getFirstErrorMessage } from '../../src/db/client';

export default function SignIn() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSignIn = async () => {
		setError(null);

		const result = signInSchema.safeParse({ email, password });
		if (!result.success) {
			setError(getFirstErrorMessage(result.error));
			return;
		}

		setIsLoading(true);
		try {
			const { data, error: apiError } = await vibecode.auth.signIn({ email, password });

			if (apiError) {
				setError(apiError.message);
				return;
			}

			if (data) {
				(globalThis as any).__setAuthUser?.(data.user);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to sign in');
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
					<Box className="flex-1 px-4 py-12">
						{/* Logo */}
						<HStack className="flex-row items-center gap-2">
							<Image
								source={require('../../assets/icon.png')}
								style={{ width: 48, height: 48, borderRadius: 10 }}
							/>
							<Heading size="2xl" className="leading-none text-typography-900 dark:text-typography-100">
								Sign In
							</Heading>
						</HStack>

						{/* Header */}
						<VStack className="mb-8">
							<Text className="text-typography-500 dark:text-typography-400 mt-1">
								Sign in to continue
							</Text>
						</VStack>

						{/* Form */}
						<VStack space="md" className="w-full">
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
										placeholder="Enter password"
										placeholderTextColor="#9CA3AF"
										value={password}
										onChangeText={setPassword}
										secureTextEntry
										autoComplete="password"
										className="text-typography-900 dark:text-typography-100"
									/>
								</Input>
							</VStack>

							{error && (
								<Box className="p-3 rounded-lg bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800">
									<Text className="text-error-600 dark:text-error-400 text-sm">{error}</Text>
								</Box>
							)}

							<Pressable
								onPress={handleSignIn}
								disabled={isLoading}
								className="py-3 mt-4 border border-outline-200 dark:border-outline-800 rounded-lg"
							>
								{isLoading ? (
									<Spinner size="small" />
								) : (
									<Text className="text-typography-900 dark:text-typography-100 text-center font-medium">
										Sign In
									</Text>
								)}
							</Pressable>
						</VStack>

						{/* Footer */}
						<HStack space="xs" className="items-center mt-6">
							<Text className="text-typography-500 dark:text-typography-400">
								Don't have an account?
							</Text>
							<ExpoLink href="/(auth)/signup" asChild>
								<Pressable>
									<Text className="text-typography-900 dark:text-typography-100 font-medium">
										Sign Up
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
