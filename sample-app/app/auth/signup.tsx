import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { useApp } from "@/lib/context";

export default function SignUpScreen() {
  const { signUp, adapterType } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    const err = await signUp(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.replace("/(tabs)");
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-8">
        <View className="mb-10">
          <Text className="text-3xl font-bold text-gray-900">
            Create account
          </Text>
          <Text className="text-base text-gray-500 mt-2">
            Sign up to get started
          </Text>
          <View className="mt-3 bg-indigo-50 rounded-lg px-3 py-2 self-start">
            <Text className="text-xs text-indigo-600 font-medium">
              Adapter: {adapterType}
            </Text>
          </View>
        </View>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <Text className="text-red-700 text-sm">{error}</Text>
          </View>
        )}

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50"
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Password
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50"
            placeholder="Create a password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Confirm Password
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50"
            placeholder="Confirm your password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <Pressable
          className="bg-indigo-600 rounded-lg py-3.5 items-center active:bg-indigo-700"
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Create Account
            </Text>
          )}
        </Pressable>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <Pressable>
              <Text className="text-indigo-600 font-semibold">Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
