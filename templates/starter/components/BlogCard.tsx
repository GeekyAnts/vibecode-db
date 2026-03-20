import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Post {
  id: number;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
}

interface BlogCardProps {
  post: Post;
  onPress: () => void;
}

export function BlogCard({ post, onPress }: BlogCardProps) {
  return (
    <Pressable
      className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm active:bg-gray-50"
      onPress={onPress}
    >
      <Text className="text-base font-semibold text-gray-900 mb-1.5" numberOfLines={2}>
        {post.title}
      </Text>
      <Text className="text-sm text-gray-500 mb-3" numberOfLines={2}>
        {post.content}
      </Text>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-6 h-6 rounded-full bg-indigo-100 items-center justify-center mr-1.5">
            <Text className="text-indigo-600 font-semibold text-[10px]">
              {post.author_name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text className="text-xs text-gray-400">{post.author_name}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={12} color="#9CA3AF" />
          <Text className="text-xs text-gray-400 ml-1">
            {new Date(post.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
