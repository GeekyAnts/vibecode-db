import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/lib/context";
import { BlogCard } from "@/components/BlogCard";

interface Post {
  id: number;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
}

export default function BlogListScreen() {
  const { client } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await client
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data as Post[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [client]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  function handleRefresh() {
    setRefreshing(true);
    fetchPosts();
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4F46E5"
          />
        }
        renderItem={({ item }) => (
          <BlogCard
            post={item}
            onPress={() => router.push(`/blog/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4 text-base">No posts yet</Text>
            <Text className="text-gray-400 text-sm mt-1">
              Tap + to create your first post
            </Text>
          </View>
        }
      />

      <Pressable
        className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg active:bg-indigo-700"
        onPress={() => router.push("/blog/create")}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>
    </View>
  );
}
