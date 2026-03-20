import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Svg, { Path, G, Defs, ClipPath, Rect } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import { Mail, Lock, Eye, EyeOff, Car, ArrowRight } from "lucide-react-native";
import { useTheme } from "../../src/hooks";

cssInterop(Mail, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Lock, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Eye, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(EyeOff, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Car, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(ArrowRight, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

type AuthMode = "login" | "signup";

// Google Icon Component
const GoogleIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

// Facebook Icon Component
const FacebookIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#1877F2"
    />
  </Svg>
);

export default function LoginScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isLogin = mode === "login";

  const handleContinue = () => {
    router.push("/(onboarding)/otp");
  };

  const handleForgotPassword = () => {
    router.push("/(onboarding)/forgot-password");
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section with Gradient */}
          <LinearGradient
            colors={["#FACC15", "#EAB308"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 }}
          >
            <View className="flex-row items-center gap-3">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-black">
                <Car color="#FACC15" size={28} />
              </View>
              <View>
                <Text className="text-3xl font-black text-black">
                  {isLogin ? "Welcome" : "Join Us"}
                </Text>
                <Text className="text-black/60">
                  {isLogin ? "Sign in to continue" : "Create your account"}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Form Section */}
          <View className="flex-1 -mt-6 rounded-t-3xl bg-background px-6 pt-8">
            {/* Toggle Tabs */}
            <View className="mb-8 flex-row rounded-2xl bg-card p-1.5">
              <Pressable
                onPress={() => setMode("login")}
                className={`flex-1 rounded-xl py-3.5 ${isLogin ? "bg-primary" : ""}`}
              >
                <Text
                  className={`text-center font-bold ${isLogin ? "text-primary-foreground" : "text-muted-foreground"}`}
                >
                  Login
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMode("signup")}
                className={`flex-1 rounded-xl py-3.5 ${!isLogin ? "bg-primary" : ""}`}
              >
                <Text
                  className={`text-center font-bold ${!isLogin ? "text-primary-foreground" : "text-muted-foreground"}`}
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {/* Form Fields */}
            <View className="gap-5">
              {/* Email Input */}
              <View>
                <Text className="mb-2 text-sm font-semibold text-muted-foreground">
                  Email Address
                </Text>
                <View className="flex-row items-center rounded-2xl border-2 border-border bg-card px-4">
                  <Mail color="#FACC15" size={20} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="ml-3 flex-1 py-4 text-foreground"
                    placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View>
                <Text className="mb-2 text-sm font-semibold text-muted-foreground">
                  Password
                </Text>
                <View className="flex-row items-center rounded-2xl border-2 border-border bg-card px-4">
                  <Lock color="#FACC15" size={20} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    className="ml-3 flex-1 py-4 text-foreground"
                    placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff color="#737373" size={20} />
                    ) : (
                      <Eye color="#737373" size={20} />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password (Signup only) */}
              {!isLogin && (
                <View>
                  <Text className="mb-2 text-sm font-semibold text-muted-foreground">
                    Confirm Password
                  </Text>
                  <View className="flex-row items-center rounded-2xl border-2 border-border bg-card px-4">
                    <Lock color="#FACC15" size={20} />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      secureTextEntry={!showConfirmPassword}
                      className="ml-3 flex-1 py-4 text-foreground"
                      placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
                    />
                    <Pressable
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff color="#737373" size={20} />
                      ) : (
                        <Eye color="#737373" size={20} />
                      )}
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Forgot Password Link */}
              {isLogin && (
                <Pressable onPress={handleForgotPassword} className="self-end">
                  <Text className="text-sm font-semibold text-primary">
                    Forgot Password?
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Continue Button */}
            <Pressable
              onPress={handleContinue}
              className="mt-8 flex-row items-center justify-center rounded-2xl bg-primary py-4 active:opacity-80"
            >
              <Text className="text-lg font-bold text-primary-foreground">Continue</Text>
              <ArrowRight color="#000" size={20} className="ml-2" />
            </Pressable>

            {/* Divider */}
            <View className="my-8 flex-row items-center">
              <View className="h-px flex-1 bg-border" />
              <Text className="mx-4 text-sm text-muted-foreground">or continue with</Text>
              <View className="h-px flex-1 bg-border" />
            </View>

            {/* Social Login Buttons */}
            <View className="flex-row justify-center gap-4">
              <Pressable className="h-14 w-14 items-center justify-center rounded-2xl border-2 border-border bg-card active:opacity-70">
                <GoogleIcon size={24} />
              </Pressable>
              <Pressable className="h-14 w-14 items-center justify-center rounded-2xl border-2 border-border bg-card active:opacity-70">
                <FacebookIcon size={24} />
              </Pressable>
            </View>

            {/* Bottom Toggle Text */}
            <View className="mb-8 mt-8 flex-row justify-center">
              <Text className="text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <Pressable onPress={() => setMode(isLogin ? "signup" : "login")}>
                <Text className="font-bold text-primary">
                  {isLogin ? "Sign Up" : "Login"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
