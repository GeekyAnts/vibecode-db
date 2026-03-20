import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { cssInterop } from 'nativewind';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';
import { vibecode, signUpSchema, getFirstErrorMessage } from '../../src/db/client';

cssInterop(GraduationCap, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Mail, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Lock, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Eye, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(EyeOff, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(User, { className: { target: 'style', nativeStyleToProp: { color: true } } });

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const result = signUpSchema.safeParse({ email, password, name });
    if (!result.success) {
      setError(getFirstErrorMessage(result.error));
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: apiError } = await vibecode.auth.signUp({
        email: email.trim(),
        password,
        name: name.trim(),
      });
      if (apiError) {
        setError(apiError.message);
        return;
      }
      if (data?.user) {
        // Navigate first, then update auth state to avoid
        // race condition with root layout's auth guard
        router.replace('/(app)/home');
        setTimeout(() => {
          (globalThis as any).__setAuthUser?.(data.user);
        }, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-12 items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600">
              <GraduationCap className="text-white" size={40} />
            </View>
            <Text className="text-2xl font-bold text-foreground">Create Account</Text>
            <Text className="mt-1 text-muted-foreground">Start your learning journey today</Text>
          </View>

          <View className="mt-8">
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-foreground">Full Name</Text>
              <View className="flex-row items-center rounded-xl border border-border bg-background px-4">
                <User className="text-muted-foreground" size={20} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  autoCapitalize="words"
                  className="ml-3 flex-1 py-4 text-foreground"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-foreground">Email</Text>
              <View className="flex-row items-center rounded-xl border border-border bg-background px-4">
                <Mail className="text-muted-foreground" size={20} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="ml-3 flex-1 py-4 text-foreground"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-foreground">Password</Text>
              <View className="flex-row items-center rounded-xl border border-border bg-background px-4">
                <Lock className="text-muted-foreground" size={20} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  className="ml-3 flex-1 py-4 text-foreground"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff className="text-muted-foreground" size={20} />
                  ) : (
                    <Eye className="text-muted-foreground" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-foreground">Confirm Password</Text>
              <View className="flex-row items-center rounded-xl border border-border bg-background px-4">
                <Lock className="text-muted-foreground" size={20} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry={!showPassword}
                  className="ml-3 flex-1 py-4 text-foreground"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {error && (
              <View className="mt-2 rounded-xl bg-red-500/10 p-4 border border-red-500/30">
                <Text className="text-red-500 text-sm">{error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSignUp}
              disabled={isLoading}
              className={`mt-6 rounded-xl py-4 ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 active:bg-indigo-700'}`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-lg font-semibold text-white">Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-auto pb-6 pt-8 flex-row justify-center">
            <Text className="text-muted-foreground">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
              <Text className="font-semibold text-indigo-600">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
