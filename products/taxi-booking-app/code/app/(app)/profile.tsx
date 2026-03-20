import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import {
  User,
  MapPin,
  CreditCard,
  Settings,
  ChevronRight,
  LogOut,
  Bell,
  Shield,
  Info,
  Star,
  Gift,
  Sun,
  Moon,
  Smartphone,
} from "lucide-react-native";
import { useTheme } from "../../src/hooks";

cssInterop(User, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(MapPin, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(CreditCard, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Settings, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(ChevronRight, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(LogOut, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Bell, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Shield, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Info, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Star, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Gift, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Sun, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Moon, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Smartphone, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

interface MenuItem {
  id: string;
  icon: any;
  label: string;
  description?: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    id: "saved-places",
    icon: MapPin,
    label: "Saved Places",
    description: "Home, Work & favorites",
  },
  {
    id: "payment",
    icon: CreditCard,
    label: "Payment Methods",
    description: "Cards & wallets",
  },
  {
    id: "notifications",
    icon: Bell,
    label: "Notifications",
    description: "Alerts & updates",
    badge: "3",
  },
  {
    id: "rewards",
    icon: Gift,
    label: "Rewards",
    description: "Points & offers",
    badge: "NEW",
  },
  {
    id: "safety",
    icon: Shield,
    label: "Safety",
    description: "Emergency contacts",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    description: "App preferences",
  },
  {
    id: "help",
    icon: Info,
    label: "Help & Support",
    description: "FAQs & contact",
  },
];

type ThemeOption = {
  id: "light" | "dark" | "system";
  label: string;
  icon: any;
};

const themeOptions: ThemeOption[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "Auto", icon: Smartphone },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { themePreference, setThemePreference, isDark } = useTheme();

  const handleSignOut = () => {
    router.replace("/(onboarding)/login");
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-5 py-4">
            <Text className="text-3xl font-black text-foreground">Profile</Text>
          </View>

          {/* User Card */}
          <Pressable
            onPress={() => router.push("/(app)/edit-profile")}
            className="mx-5 mb-6 overflow-hidden rounded-3xl"
          >
            <LinearGradient
              colors={["#FACC15", "#EAB308"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20 }}
            >
              <View className="flex-row items-center">
                <View className="h-20 w-20 items-center justify-center rounded-2xl bg-black">
                  <User color="#FACC15" size={40} />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-2xl font-black text-black">John Doe</Text>
                  <Text className="mt-0.5 text-black/60">john.doe@email.com</Text>
                  <View className="mt-2 flex-row items-center">
                    <Star color="#000" size={14} fill="#000" />
                    <Text className="ml-1 font-bold text-black">4.9 rating</Text>
                  </View>
                </View>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-black/20">
                  <ChevronRight color="#000" size={20} />
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Stats */}
          <View className="mx-5 mb-6 flex-row gap-3">
            <View className="flex-1 items-center rounded-2xl bg-card py-5">
              <Text className="text-3xl font-black text-primary">127</Text>
              <Text className="mt-1 text-sm text-muted-foreground">Rides</Text>
            </View>
            <View className="flex-1 items-center rounded-2xl bg-card py-5">
              <Text className="text-3xl font-black text-foreground">$1.2K</Text>
              <Text className="mt-1 text-sm text-muted-foreground">Spent</Text>
            </View>
            <View className="flex-1 items-center rounded-2xl bg-card py-5">
              <Text className="text-3xl font-black text-green-500">450</Text>
              <Text className="mt-1 text-sm text-muted-foreground">Points</Text>
            </View>
          </View>

          {/* Theme Selector */}
          <View className="mx-5 mb-6">
            <Text className="mb-3 text-sm font-semibold text-muted-foreground">
              APPEARANCE
            </Text>
            <View className="flex-row gap-2 rounded-3xl bg-card p-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = themePreference === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setThemePreference(option.id)}
                    className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 ${
                      isSelected ? "bg-primary" : ""
                    }`}
                  >
                    <Icon
                      color={isSelected ? "#000" : isDark ? "#737373" : "#a3a3a3"}
                      size={18}
                    />
                    <Text
                      className={`font-semibold ${
                        isSelected
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Menu Items */}
          <View className="mx-5">
            <Text className="mb-3 text-sm font-semibold text-muted-foreground">
              ACCOUNT
            </Text>
            <View className="overflow-hidden rounded-3xl bg-card">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === menuItems.length - 1;
                return (
                  <Pressable
                    key={item.id}
                    className={`flex-row items-center p-4 active:opacity-70 ${
                      !isLast ? "border-b border-border" : ""
                    }`}
                  >
                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon color="#FACC15" size={22} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="font-semibold text-foreground">
                        {item.label}
                      </Text>
                      {item.description && (
                        <Text className="mt-0.5 text-sm text-muted-foreground">
                          {item.description}
                        </Text>
                      )}
                    </View>
                    {item.badge && (
                      <View
                        className={`mr-2 rounded-full px-2.5 py-1 ${
                          item.badge === "NEW"
                            ? "bg-green-500/20"
                            : "bg-primary/20"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            item.badge === "NEW"
                              ? "text-green-500"
                              : "text-primary"
                          }`}
                        >
                          {item.badge}
                        </Text>
                      </View>
                    )}
                    <ChevronRight color={isDark ? "#525252" : "#a3a3a3"} size={20} />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Sign Out */}
          <Pressable
            onPress={handleSignOut}
            className="mx-5 mt-6 flex-row items-center justify-center rounded-2xl border-2 border-red-500/30 bg-red-500/10 py-4"
          >
            <LogOut color="#EF4444" size={20} />
            <Text className="ml-2 font-bold text-red-500">Sign Out</Text>
          </Pressable>

          {/* App Version */}
          <Text className="mt-6 text-center text-sm text-muted-foreground">
            RideNow v1.0.0
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
