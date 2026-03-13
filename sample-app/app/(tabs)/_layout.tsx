import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/lib/context";

export default function TabsLayout() {
  const { adapterType } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          borderTopColor: "#E5E7EB",
        },
        headerStyle: {
          backgroundColor: "#fff",
          shadowColor: "transparent",
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        },
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 17,
        },
        headerRight: () => (
          <Ionicons
            name="server-outline"
            size={16}
            color="#6366F1"
            style={{ marginRight: 16 }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Blog",
          headerTitle: `Blog (${adapterType})`,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
