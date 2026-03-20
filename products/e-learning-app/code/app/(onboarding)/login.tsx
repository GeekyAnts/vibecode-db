import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { cssInterop } from "react-native-css-interop";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { GraduationCap, Mail, Lock, User, Eye, EyeOff } from "lucide-react-native";
import {
  vibecode,
  signInSchema,
  signUpSchema,
  getFirstErrorMessage,
} from "../../src/db/client";

const StyledLinearGradient = cssInterop(LinearGradient, {
  className: "style",
});

type AuthMode = "login" | "signup";

export default function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError(null);
    setEmail("");
    setPassword("");
    setName("");
  };

  const handleAuth = async () => {
    setError(null);

    if (mode === "login") {
      const result = signInSchema.safeParse({ email, password });
      if (!result.success) {
        setError(getFirstErrorMessage(result.error));
        return;
      }
    } else {
      const result = signUpSchema.safeParse({ email, password, name });
      if (!result.success) {
        setError(getFirstErrorMessage(result.error));
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const { data, error: authError } =
          await vibecode.auth.signInWithPassword({ email, password });
        if (authError) throw new Error(authError.message);

        if (data?.user) {
          (globalThis as any).__setAuthUser?.(data.user);
        }
        router.replace("/(app)/home");
      } else {
        const { data, error: authError } = await vibecode.auth.signUp({
          email,
          password,
        });
        if (authError) throw new Error(authError.message);

        // Create profile for new user
        if (data?.user) {
          await vibecode.from("profiles").insert({
            id: data.user.id,
            email: data.user.email ?? email,
            name: name || email.split("@")[0],
            bio: "",
            avatar_url: null,
          });
          (globalThis as any).__setAuthUser?.(data.user);
        }

        router.replace("/(onboarding)/profile-setup");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="items-center bg-indigo-600 pb-10 pt-16">
          <Animated.View
            entering={FadeInDown.duration(500)}
            className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-white/20"
          >
            <GraduationCap size={44} color="#FFFFFF" strokeWidth={1.5} />
          </Animated.View>
          <Animated.Text
            entering={FadeInDown.duration(500).delay(100)}
            className="text-2xl font-bold text-white"
          >
            LearnHub
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.duration(500).delay(200)}
            className="mt-1 text-sm text-indigo-200"
          >
            {mode === "login"
              ? "Sign in to continue learning"
              : "Start your learning journey today"}
          </Animated.Text>
        </View>

        {/* Tab Switcher */}
        <View className="mx-8 -mt-5 flex-row overflow-hidden rounded-xl bg-gray-100">
          <TouchableOpacity
            onPress={() => mode !== "login" && toggleMode()}
            style={{
              flex: 1,
              alignItems: 'center',
              borderRadius: 12,
              paddingVertical: 12,
              backgroundColor: mode === "login" ? '#FFFFFF' : 'transparent',
            }}
          >
            <Text
              className={`text-sm font-semibold ${
                mode === "login" ? "text-indigo-600" : "text-gray-500"
              }`}
            >
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => mode !== "signup" && toggleMode()}
            style={{
              flex: 1,
              alignItems: 'center',
              borderRadius: 12,
              paddingVertical: 12,
              backgroundColor: mode === "signup" ? '#FFFFFF' : 'transparent',
            }}
          >
            <Text
              className={`text-sm font-semibold ${
                mode === "signup" ? "text-indigo-600" : "text-gray-500"
              }`}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View className="flex-1 px-8 pt-6">
          {/* Error Message */}
          {error && (
            <Animated.View
              entering={FadeInUp.duration(300)}
              className="mb-4 rounded-xl bg-red-50 p-3"
            >
              <Text className="text-center text-sm text-red-600">{error}</Text>
            </Animated.View>
          )}

          {/* Name Field (signup only) */}
          {mode === "signup" && (
            <Animated.View entering={FadeInDown.duration(300)} className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">
                Full Name
              </Text>
              <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
                <User size={18} color="#9CA3AF" strokeWidth={1.5} />
                <TextInput
                  ref={nameRef}
                  className="ml-3 flex-1 py-3.5 text-base text-gray-900"
                  placeholder="Your full name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
            </Animated.View>
          )}

          {/* Email Field */}
          <View className="mb-4">
            <Text className="mb-1.5 text-sm font-medium text-gray-700">
              Email
            </Text>
            <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
              <Mail size={18} color="#9CA3AF" strokeWidth={1.5} />
              <TextInput
                ref={emailRef}
                className="ml-3 flex-1 py-3.5 text-base text-gray-900"
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
          </View>

          {/* Password Field */}
          <View className="mb-2">
            <Text className="mb-1.5 text-sm font-medium text-gray-700">
              Password
            </Text>
            <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
              <Lock size={18} color="#9CA3AF" strokeWidth={1.5} />
              <TextInput
                ref={passwordRef}
                className="ml-3 flex-1 py-3.5 text-base text-gray-900"
                placeholder={
                  mode === "login" ? "Your password" : "Min 6 characters"
                }
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType={
                  mode === "login" ? "password" : "newPassword"
                }
                autoComplete={mode === "login" ? "password" : "password-new"}
                returnKeyType="done"
                onSubmitEditing={handleAuth}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#9CA3AF" strokeWidth={1.5} />
                ) : (
                  <Eye size={18} color="#9CA3AF" strokeWidth={1.5} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          {mode === "login" && (
            <View className="mb-6 items-end">
              <TouchableOpacity
                onPress={() => router.push("/(onboarding)/forgot-password")}
              >
                <Text className="text-sm font-medium text-indigo-600">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === "signup" && <View className="mb-6" />}

          {/* Submit Button */}
          <TouchableOpacity onPress={handleAuth} disabled={loading} activeOpacity={0.8}>
            <StyledLinearGradient
              colors={["#6366F1", "#4F46E5"]}
              className="items-center rounded-xl py-4"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  {mode === "login" ? "Sign In" : "Create Account"}
                </Text>
              )}
            </StyledLinearGradient>
          </TouchableOpacity>

          {/* Bottom Toggle */}
          <View className="mt-6 flex-row items-center justify-center pb-8">
            <Text className="text-sm text-gray-500">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={toggleMode}>
              <Text className="text-sm font-semibold text-indigo-600">
                {mode === "login" ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
