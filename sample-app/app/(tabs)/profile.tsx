import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/lib/context";
import { useAuth } from "@/hooks";

interface Profile {
  id: string;
  email: string;
  name: string;
  bio: string;
  avatar_url: string | null;
}

export default function ProfileScreen() {
  const { client } = useApp();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["profiles", user?.id],
    queryFn: async () => {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data as Profile) ?? null;
    },
    enabled: !!user,
  });

  // Sync local form state when profile data loads
  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name);
      setBio(profileQuery.data.bio);
      setAvatarUri(profileQuery.data.avatar_url);
    }
  }, [profileQuery.data]);

  const uploadAvatar = useMutation({
    mutationFn: async (uri: string) => {
      const fileName = `${user?.id ?? "anon"}-${Date.now()}.jpg`;
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await client.storage
        .from("avatars")
        .upload(fileName, arrayBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });
      if (uploadError) throw uploadError;

      const { data: urlData } = client.storage
        .from("avatars")
        .getPublicUrl(fileName);

      return urlData?.publicUrl ?? uri;
    },
    onSuccess: (publicUrl) => {
      setAvatarUri(publicUrl);
    },
    onError: (err) => {
      Alert.alert(
        "Upload failed",
        err instanceof Error ? err.message : "Could not upload image"
      );
    },
  });

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const profileData = {
        id: user.id,
        email: user.email,
        name,
        bio,
        avatar_url: avatarUri,
      };

      if (profileQuery.data) {
        const { error } = await client
          .from("profiles")
          .update(profileData)
          .eq("id", user.id);
        if (error) throw error;
      } else {
        const { error } = await client.from("profiles").insert(profileData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", user?.id] });
      Alert.alert("Saved", "Your profile has been updated.");
    },
    onError: (err) => {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to save profile"
      );
    },
  });

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri); // Optimistic local preview
      uploadAvatar.mutate(uri);
    }
  }

  function handleSignOut() {
    signOut.mutate(undefined, {
      onSuccess: () => router.replace("/auth/login"),
    });
  }

  if (profileQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="items-center pt-8 pb-4">
        <Pressable onPress={handlePickImage} className="relative">
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              className="w-24 h-24 rounded-full bg-gray-200"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center">
              <Ionicons name="person" size={40} color="#9CA3AF" />
            </View>
          )}
          <View className="absolute bottom-0 right-0 bg-indigo-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
            <Ionicons name="camera" size={14} color="white" />
          </View>
        </Pressable>
        <Text className="text-lg font-semibold text-gray-900 mt-4">
          {name || user?.email || "Your Profile"}
        </Text>
        <Text className="text-sm text-gray-500">{user?.email}</Text>
      </View>

      <View className="px-6 pt-4">
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Name</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50"
            placeholder="Your name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Bio</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50"
            placeholder="Tell us about yourself"
            placeholderTextColor="#9CA3AF"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
        </View>

        <Pressable
          className="bg-indigo-600 rounded-lg py-3.5 items-center active:bg-indigo-700"
          onPress={() => saveProfile.mutate()}
          disabled={saveProfile.isPending}
        >
          {saveProfile.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Save Profile
            </Text>
          )}
        </Pressable>

        <Pressable
          className="border border-red-200 rounded-lg py-3.5 items-center mt-3 active:bg-red-50"
          onPress={handleSignOut}
        >
          <Text className="text-red-600 font-semibold text-base">Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
