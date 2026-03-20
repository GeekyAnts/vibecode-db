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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import { User, Phone, Camera } from "lucide-react-native";

cssInterop(User, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Phone, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Camera, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleGetStarted = () => {
    router.replace("/(app)/home");
  };

  const handleSkip = () => {
    router.replace("/(app)/home");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator */}
          <View className="mt-6 flex-row items-center justify-center gap-2">
            <View className="h-2 w-2 rounded-full bg-muted" />
            <View className="h-2 w-2 rounded-full bg-muted" />
            <View className="h-2 w-2 rounded-full bg-primary" />
          </View>

          {/* Title Section */}
          <View className="mt-8 items-center">
            <Text className="text-2xl font-bold text-foreground">
              Complete your profile
            </Text>
            <Text className="mt-2 text-center text-muted-foreground">
              Tell us a bit about yourself
            </Text>
          </View>

          {/* Profile Photo */}
          <View className="mt-10 items-center">
            <View className="relative">
              <View className="h-28 w-28 items-center justify-center rounded-full bg-muted">
                <User className="text-muted-foreground" size={48} />
              </View>
              <Pressable className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Camera className="text-primary-foreground" size={20} />
              </Pressable>
            </View>
          </View>

          {/* Form Fields */}
          <View className="mt-10 gap-4">
            {/* Full Name Input */}
            <View>
              <Text className="mb-2 text-sm font-medium text-foreground">
                Full Name
              </Text>
              <View className="flex-row items-center rounded-xl border border-border bg-background px-4">
                <User className="text-muted-foreground" size={20} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  className="ml-3 flex-1 py-4 text-foreground"
                  placeholderTextColor="#71717a"
                />
              </View>
            </View>

            {/* Phone Number Input */}
            <View>
              <Text className="mb-2 text-sm font-medium text-foreground">
                Phone Number
              </Text>
              <View className="flex-row items-center rounded-xl border border-border bg-background px-4">
                <Phone className="text-muted-foreground" size={20} />
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  className="ml-3 flex-1 py-4 text-foreground"
                  placeholderTextColor="#71717a"
                />
              </View>
            </View>
          </View>

          {/* Get Started Button */}
          <View className="mt-auto mb-4 pt-8">
            <Pressable
              onPress={handleGetStarted}
              className="rounded-xl bg-primary py-4 active:opacity-80"
            >
              <Text className="text-center text-lg font-semibold text-primary-foreground">
                Get Started
              </Text>
            </Pressable>

            {/* Skip Link */}
            <Pressable onPress={handleSkip} className="mt-4 py-2">
              <Text className="text-center font-medium text-muted-foreground">
                Skip for now
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
