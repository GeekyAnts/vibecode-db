import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/lib/context";
import { useAuth } from "@/hooks";

interface Post {
  id: number;
  title: string;
  content: string;
  author_name: string;
  author_id: string;
  created_at: string;
}

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client } = useApp();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const postQuery = useQuery({
    queryKey: ["posts", id],
    queryFn: async () => {
      const { data, error } = await client
        .from("posts")
        .select("*")
        .eq("id", Number(id))
        .single();
      if (error) throw error;
      return data as Post;
    },
    enabled: !!id,
  });

  const post = postQuery.data ?? null;

  // Sync local edit state when post data loads
  if (post && !editing && title === "" && content === "") {
    setTitle(post.title);
    setContent(post.content);
  }

  const updatePost = useMutation({
    mutationFn: async () => {
      const { error } = await client
        .from("posts")
        .update({ title, content })
        .eq("id", Number(id));
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", id] });
      setEditing(false);
    },
    onError: (err) => {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save");
    },
  });

  const deletePost = useMutation({
    mutationFn: async () => {
      const { error } = await client
        .from("posts")
        .delete()
        .eq("id", Number(id));
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.back();
    },
    onError: (err) => {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to delete");
    },
  });

  function handleDelete() {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deletePost.mutate(),
      },
    ]);
  }

  const isAuthor = post?.author_id === user?.id;

  if (postQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Stack.Screen options={{ title: "Loading..." }} />
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Stack.Screen options={{ title: "Not Found" }} />
        <Text className="text-gray-400 text-lg">Post not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: editing ? "Edit Post" : post.title,
          headerStyle: { backgroundColor: "#fff" },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => {
                if (editing) {
                  setEditing(false);
                  setTitle(post.title);
                  setContent(post.content);
                } else {
                  router.back();
                }
              }}
            >
              <Text className="text-indigo-600 text-base">
                {editing ? "Cancel" : "Back"}
              </Text>
            </Pressable>
          ),
          headerRight: () =>
            isAuthor && !editing ? (
              <View className="flex-row gap-4">
                <Pressable onPress={() => setEditing(true)}>
                  <Ionicons name="create-outline" size={22} color="#4F46E5" />
                </Pressable>
                <Pressable onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={22} color="#EF4444" />
                </Pressable>
              </View>
            ) : null,
        }}
      />

      <View className="px-6 py-6">
        {editing ? (
          <>
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">
                Title
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50"
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
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={8}
                style={{ minHeight: 200, textAlignVertical: "top" }}
              />
            </View>

            <Pressable
              className="bg-indigo-600 rounded-lg py-3.5 items-center active:bg-indigo-700"
              onPress={() => updatePost.mutate()}
              disabled={updatePost.isPending}
            >
              {updatePost.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Save Changes
                </Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Text className="text-2xl font-bold text-gray-900 mb-3">
              {post.title}
            </Text>

            <View className="flex-row items-center mb-6">
              <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-2">
                <Text className="text-indigo-600 font-semibold text-xs">
                  {post.author_name?.charAt(0)?.toUpperCase() ?? "?"}
                </Text>
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700">
                  {post.author_name}
                </Text>
                <Text className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <Text className="text-base text-gray-700 leading-7">
              {post.content}
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}
