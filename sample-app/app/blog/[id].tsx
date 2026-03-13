import { useState, useEffect } from "react";
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
import { useApp } from "@/lib/context";

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
  const { client, auth } = useApp();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPost();
  }, [id]);

  async function loadPost() {
    const { data, error } = await client
      .from("posts")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (!error && data) {
      const p = data as Post;
      setPost(p);
      setTitle(p.title);
      setContent(p.content);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    await client
      .from("posts")
      .update({ title, content })
      .eq("id", Number(id));
    setSaving(false);
    setEditing(false);
    loadPost();
  }

  async function handleDelete() {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await client.from("posts").delete().eq("id", Number(id));
          router.back();
        },
      },
    ]);
  }

  const isAuthor = post?.author_id === auth.user?.id;

  if (loading) {
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
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
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
