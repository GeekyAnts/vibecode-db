import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router, Stack } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/lib/context";
import { useAuth } from "@/hooks";

export default function CreateBlogScreen() {
  const { client } = useApp();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createPost = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error: insertError } = await client.from("posts").insert({
        title: title.trim(),
        content: content.trim(),
        author_id: user.id,
        author_name: user.email,
        created_at: new Date().toISOString(),
      });
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.back();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to create post");
    },
  });

  function handleCreate() {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!content.trim()) {
      setError("Content is required");
      return;
    }
    setError(null);
    createPost.mutate();
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen
        options={{
          title: "New Post",
          headerStyle: { backgroundColor: "#fff" },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Text className="text-indigo-600 text-base">Cancel</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <Text className="text-red-700 text-sm">{error}</Text>
          </View>
        )}

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Title
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50"
            placeholder="Your post title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Content
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50"
            placeholder="Write your post content..."
            placeholderTextColor="#9CA3AF"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            style={{ minHeight: 200, textAlignVertical: "top" }}
          />
        </View>

        <Pressable
          className="bg-indigo-600 rounded-lg py-3.5 items-center active:bg-indigo-700"
          onPress={handleCreate}
          disabled={createPost.isPending}
        >
          {createPost.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Publish Post
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
