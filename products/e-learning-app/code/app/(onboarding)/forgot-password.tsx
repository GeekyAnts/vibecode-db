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
import { router } from "expo-router";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from "lucide-react-native";
import { vibecode } from "../../src/db/client";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await vibecode.auth.resetPasswordForEmail(
        email
      );
      if (resetError) throw new Error(resetError.message);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  // Success State
  if (success) {
    return (
      <View className="flex-1 bg-white px-8">
        <Pressable
          onPress={() => router.back()}
          className="mt-14 mb-6 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <ArrowLeft size={20} color="#374151" strokeWidth={2} />
        </Pressable>

        <View className="flex-1 items-center justify-center pb-32">
          <Animated.View
            entering={FadeInDown.duration(500)}
            className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-indigo-100"
          >
            <CheckCircle2 size={44} color="#6366F1" strokeWidth={1.5} />
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.duration(500).delay(100)}
            className="text-2xl font-bold text-gray-900"
          >
            Check your email
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.duration(500).delay(200)}
            className="mt-3 px-4 text-center text-base text-gray-500"
          >
            We've sent password reset instructions to{" "}
            <Text className="font-medium text-gray-700">{email}</Text>
          </Animated.Text>

          <Animated.View entering={FadeInDown.duration(500).delay(300)}>
            <Pressable
              onPress={() => router.back()}
              className="mt-8 rounded-xl bg-indigo-600 px-8 py-4 active:bg-indigo-700"
            >
              <Text className="text-base font-semibold text-white">
                Back to Sign In
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(400)}
            className="mt-4"
          >
            <Pressable
              onPress={() => {
                setSuccess(false);
                setEmail("");
              }}
            >
              <Text className="text-sm font-medium text-indigo-600">
                Try a different email
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-8">
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="mt-14 mb-6 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <ArrowLeft size={20} color="#374151" strokeWidth={2} />
        </Pressable>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} className="mb-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
            <KeyRound size={32} color="#6366F1" strokeWidth={1.5} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            Forgot password?
          </Text>
          <Text className="mt-2 text-base text-gray-500">
            No worries, we'll send you reset instructions.
          </Text>
        </Animated.View>

        {/* Error */}
        {error && (
          <Animated.View
            entering={FadeInUp.duration(300)}
            className="mb-4 rounded-xl bg-red-50 p-3"
          >
            <Text className="text-center text-sm text-red-600">{error}</Text>
          </Animated.View>
        )}

        {/* Email Input */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Text className="mb-1.5 text-sm font-medium text-gray-700">
            Email
          </Text>
          <View className="mb-6 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
            <Mail size={18} color="#9CA3AF" strokeWidth={1.5} />
            <TextInput
              className="ml-3 flex-1 py-3.5 text-base text-gray-900"
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleReset}
            />
          </View>
        </Animated.View>

        {/* Submit Button */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Pressable
            onPress={handleReset}
            disabled={loading}
            className="items-center rounded-xl bg-indigo-600 py-4 active:bg-indigo-700"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-semibold text-white">
                Send Reset Link
              </Text>
            )}
          </Pressable>
        </Animated.View>

        {/* Back to login */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(400)}
          className="mt-6 flex-row items-center justify-center"
        >
          <Text className="text-sm text-gray-500">Remember your password? </Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-sm font-semibold text-indigo-600">
              Sign In
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
