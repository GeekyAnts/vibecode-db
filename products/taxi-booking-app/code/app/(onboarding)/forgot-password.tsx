import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import { ArrowLeft, Lock, Mail } from "lucide-react-native";

cssInterop(ArrowLeft, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Lock, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Mail, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSendResetLink = () => {
    if (email) {
      router.push("/(onboarding)/login");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6">
        {/* Header */}
        <Pressable
          onPress={() => router.back()}
          className="mt-4 h-10 w-10 items-center justify-center rounded-full bg-muted"
        >
          <ArrowLeft className="text-foreground" size={24} />
        </Pressable>

        {/* Icon Section */}
        <View className="mt-12 items-center">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Lock className="text-primary" size={40} />
          </View>
        </View>

        {/* Title Section */}
        <View className="mt-8 items-center">
          <Text className="text-2xl font-bold text-foreground">
            Forgot Password?
          </Text>
          <Text className="mt-3 text-center text-muted-foreground">
            Enter your email and we'll send you a link to reset your password
          </Text>
        </View>

        {/* Email Input */}
        <View className="mt-10">
          <Text className="mb-2 text-sm font-medium text-foreground">
            Email
          </Text>
          <View className="flex-row items-center rounded-xl border border-border bg-background px-4">
            <Mail className="text-muted-foreground" size={20} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              className="ml-3 flex-1 py-4 text-foreground"
              placeholderTextColor="#71717a"
            />
          </View>
        </View>

        {/* Send Reset Link Button */}
        <Pressable
          onPress={handleSendResetLink}
          disabled={!email}
          className={`mt-8 rounded-xl py-4 ${
            email ? "bg-primary active:opacity-80" : "bg-muted"
          }`}
        >
          <Text
            className={`text-center text-lg font-semibold ${
              email ? "text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Send Reset Link
          </Text>
        </Pressable>

        {/* Back to Login Link */}
        <Pressable
          onPress={() => router.push("/(onboarding)/login")}
          className="mt-6"
        >
          <Text className="text-center font-medium text-primary">
            Back to Login
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
