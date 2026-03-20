import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { cssInterop } from "react-native-css-interop";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  FadeInDown,
} from "react-native-reanimated";
import { Camera, User, AtSign, GraduationCap } from "lucide-react-native";
import { vibecode } from "../../src/db/client";

const StyledLinearGradient = cssInterop(LinearGradient, {
  className: "style",
});

export default function ProfileSetupScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload a photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera permissions to take a photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert("Profile Photo", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      ...(avatarUri
        ? [
            {
              text: "Remove Photo",
              style: "destructive" as const,
              onPress: () => setAvatarUri(null),
            },
          ]
        : []),
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await vibecode.auth.getSession();

      if (!session?.user) {
        throw new Error("No authenticated user found");
      }

      let avatarUrl: string | null = null;

      // Upload avatar if selected
      if (avatarUri) {
        const fileName = `${session.user.id}-${Date.now()}.jpg`;
        const response = await fetch(avatarUri);
        const blob = await response.blob();

        const { data: uploadData, error: uploadError } =
          await vibecode.storage
            .from("avatars")
            .upload(fileName, blob, { contentType: "image/jpeg" });

        if (uploadError) {
          console.warn("Avatar upload failed:", uploadError.message);
        } else {
          const { data: urlData } = vibecode.storage
            .from("avatars")
            .getPublicUrl(uploadData.path);
          avatarUrl = urlData.publicUrl;
        }
      }

      // Update profile
      const { error: updateError } = await vibecode
        .from("profiles")
        .update({
          name: name.trim(),
          username: username.trim() || null,
          avatar_url: avatarUrl,
        })
        .eq("id", session.user.id);

      if (updateError) throw new Error(updateError.message);

      router.replace("/(app)/home");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace("/(app)/home");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-8">
          {/* Skip Button */}
          <View className="mt-14 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <GraduationCap size={24} color="#6366F1" strokeWidth={1.5} />
              <Text className="ml-2 text-lg font-bold text-gray-900">
                LearnHub
              </Text>
            </View>
            <Pressable onPress={handleSkip}>
              <Text className="text-sm font-medium text-gray-400">
                Skip for now
              </Text>
            </Pressable>
          </View>

          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(500)}
            className="mb-8 mt-8"
          >
            <Text className="text-2xl font-bold text-gray-900">
              Complete your profile
            </Text>
            <Text className="mt-2 text-base text-gray-500">
              Help fellow learners get to know you
            </Text>
          </Animated.View>

          {/* Avatar Picker */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            className="mb-8 items-center"
          >
            <Pressable onPress={showImageOptions}>
              <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-indigo-100">
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    className="h-28 w-28 rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <User size={48} color="#6366F1" strokeWidth={1.2} />
                )}
              </View>
              {/* Camera badge */}
              <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-3 border-white bg-indigo-600">
                <Camera size={16} color="#FFFFFF" strokeWidth={2} />
              </View>
            </Pressable>
            <Text className="mt-3 text-sm text-gray-400">
              Tap to add a photo
            </Text>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              className="mb-4 rounded-xl bg-red-50 p-3"
            >
              <Text className="text-center text-sm text-red-600">{error}</Text>
            </Animated.View>
          )}

          {/* Name Field */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            className="mb-4"
          >
            <Text className="mb-1.5 text-sm font-medium text-gray-700">
              Full Name
            </Text>
            <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
              <User size={18} color="#9CA3AF" strokeWidth={1.5} />
              <TextInput
                className="ml-3 flex-1 py-3.5 text-base text-gray-900"
                placeholder="Your full name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          </Animated.View>

          {/* Username Field */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            className="mb-8"
          >
            <Text className="mb-1.5 text-sm font-medium text-gray-700">
              Username
            </Text>
            <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
              <AtSign size={18} color="#9CA3AF" strokeWidth={1.5} />
              <TextInput
                className="ml-3 flex-1 py-3.5 text-base text-gray-900"
                placeholder="Choose a username"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={(text) =>
                  setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>
            <Text className="mt-1.5 text-xs text-gray-400">
              Letters, numbers, and underscores only
            </Text>
          </Animated.View>

          {/* Save Button */}
          <Animated.View entering={FadeInDown.duration(500).delay(400)}>
            <Pressable onPress={handleSave} disabled={loading}>
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
                    Start Learning
                  </Text>
                )}
              </StyledLinearGradient>
            </Pressable>
          </Animated.View>

          {/* Bottom spacer */}
          <View className="h-8" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
