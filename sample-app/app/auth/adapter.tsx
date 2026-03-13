import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useApp } from "@/lib/context";
import type { AdapterType, AdapterConfig } from "@/lib/client";

const adapters: { type: AdapterType; label: string; description: string }[] = [
  {
    type: "mock",
    label: "Mock",
    description: "In-memory adapter with seeded data. No setup required.",
  },
  {
    type: "supabase",
    label: "Supabase",
    description: "Connect to a Supabase project with URL and anon key.",
  },
  {
    type: "pocketbase",
    label: "PocketBase",
    description: "Connect to a PocketBase instance.",
  },
];

export default function AdapterScreen() {
  const { adapterType, switchAdapter } = useApp();
  const [selected, setSelected] = useState<AdapterType>(adapterType);
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [pocketbaseUrl, setPocketbaseUrl] = useState("http://127.0.0.1:8090");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const config: AdapterConfig = { type: selected };
    if (selected === "supabase") {
      config.supabaseUrl = supabaseUrl;
      config.supabaseKey = supabaseKey;
    }
    if (selected === "pocketbase") {
      config.pocketbaseUrl = pocketbaseUrl;
    }
    await switchAdapter(config);
    setLoading(false);
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-8">
        <Pressable onPress={() => router.back()}>
          <Text className="text-indigo-600 text-base mb-6">Back</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Select Adapter
        </Text>
        <Text className="text-gray-500 mb-8">
          Choose which backend to use for data operations.
        </Text>

        {adapters.map((a) => (
          <Pressable
            key={a.type}
            className={`border rounded-xl p-4 mb-3 ${
              selected === a.type
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 bg-white"
            }`}
            onPress={() => setSelected(a.type)}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className={`text-base font-semibold ${
                  selected === a.type ? "text-indigo-700" : "text-gray-900"
                }`}
              >
                {a.label}
              </Text>
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  selected === a.type
                    ? "border-indigo-600"
                    : "border-gray-300"
                }`}
              >
                {selected === a.type && (
                  <View className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                )}
              </View>
            </View>
            <Text className="text-sm text-gray-500 mt-1">{a.description}</Text>
          </Pressable>
        ))}

        {selected === "supabase" && (
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Supabase URL
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50 mb-3"
              placeholder="https://xxx.supabase.co"
              placeholderTextColor="#9CA3AF"
              value={supabaseUrl}
              onChangeText={setSupabaseUrl}
              autoCapitalize="none"
            />
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Anon Key
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50"
              placeholder="your-anon-key"
              placeholderTextColor="#9CA3AF"
              value={supabaseKey}
              onChangeText={setSupabaseKey}
              autoCapitalize="none"
            />
          </View>
        )}

        {selected === "pocketbase" && (
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              PocketBase URL
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50"
              placeholder="http://127.0.0.1:8090"
              placeholderTextColor="#9CA3AF"
              value={pocketbaseUrl}
              onChangeText={setPocketbaseUrl}
              autoCapitalize="none"
            />
          </View>
        )}

        <Pressable
          className="bg-indigo-600 rounded-lg py-3.5 items-center mt-8 active:bg-indigo-700"
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Apply & Continue
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
