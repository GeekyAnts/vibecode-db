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
import { useApp } from "@/lib/context";

interface Profile {
  id: string;
  email: string;
  name: string;
  bio: string;
  avatar_url: string | null;
}

export default function ProfileScreen() {
  const { client, auth, signOut, adapterType } = useApp();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [client, auth]);

  async function loadProfile() {
    if (!auth.user) {
      setLoading(false);
      return;
    }

    const { data } = await client
      .from("profiles")
      .select("*")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (data) {
      const p = data as Profile;
      setProfile(p);
      setName(p.name);
      setBio(p.bio);
      setAvatarUri(p.avatar_url);
    } else {
      // Create a default profile
      setName("");
      setBio("");
    }
    setLoading(false);
  }

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);

      // Upload to storage
      try {
        await client.storage.createBucket("avatars", { public: true });
      } catch {
        // Bucket may already exist
      }

      const fileName = `${auth.user?.id ?? "anon"}-${Date.now()}.jpg`;
      await client.storage.from("avatars").upload(fileName, uri);

      const { data: urlData } = client.storage
        .from("avatars")
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        setAvatarUri(urlData.publicUrl);
      }
    }
  }

  async function handleSave() {
    if (!auth.user) return;
    setSaving(true);

    const profileData = {
      id: auth.user.id,
      email: auth.user.email,
      name,
      bio,
      avatar_url: avatarUri,
    };

    if (profile) {
      await client
        .from("profiles")
        .update(profileData)
        .eq("id", auth.user.id);
    } else {
      await client.from("profiles").insert(profileData);
    }

    setSaving(false);
    Alert.alert("Saved", "Your profile has been updated.");
    loadProfile();
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/auth/login");
  }

  if (loading) {
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
          {name || auth.user?.email || "Your Profile"}
        </Text>
        <Text className="text-sm text-gray-500">{auth.user?.email}</Text>
        <View className="mt-2 bg-indigo-50 rounded-full px-3 py-1">
          <Text className="text-xs text-indigo-600 font-medium">
            {adapterType} adapter
          </Text>
        </View>
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
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
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

        <Pressable
          className="items-center mt-4 py-2"
          onPress={() => router.push("/auth/adapter")}
        >
          <Text className="text-gray-400 text-sm underline">
            Change adapter
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
