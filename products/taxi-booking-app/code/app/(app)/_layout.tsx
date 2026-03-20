import { Platform, View } from "react-native";
import { Tabs } from "expo-router";
import { Home, Grid, Clock, User } from "lucide-react-native";
import { cssInterop } from "nativewind";
import { useTheme } from "../../src/hooks";

cssInterop(Home, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Grid, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Clock, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(User, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

export default function AppLayout() {
  const { isDark } = useTheme();

  return (
    <View className="flex-1 bg-background">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FACC15",
          tabBarInactiveTintColor: isDark ? "#525252" : "#a3a3a3",
          tabBarStyle: {
            backgroundColor: isDark ? "#0A0A0A" : "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#171717" : "#E5E7EB",
            height: 85,
            paddingTop: 12,
            paddingBottom: Platform.OS === "ios" ? 28 : 12,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 4,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`items-center justify-center rounded-xl px-4 py-1.5 ${
                  focused ? "bg-primary/10" : ""
                }`}
              >
                <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="services"
          options={{
            title: "Services",
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`items-center justify-center rounded-xl px-4 py-1.5 ${
                  focused ? "bg-primary/10" : ""
                }`}
              >
                <Grid size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`items-center justify-center rounded-xl px-4 py-1.5 ${
                  focused ? "bg-primary/10" : ""
                }`}
              >
                <Clock size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`items-center justify-center rounded-xl px-4 py-1.5 ${
                  focused ? "bg-primary/10" : ""
                }`}
              >
                <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="ride-options"
          options={{
            href: null,
            tabBarStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="ride-tracking"
          options={{
            href: null,
            tabBarStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="edit-profile"
          options={{
            href: null,
            tabBarStyle: { display: "none" },
          }}
        />
      </Tabs>
    </View>
  );
}
