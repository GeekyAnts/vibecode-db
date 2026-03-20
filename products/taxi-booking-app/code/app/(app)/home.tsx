import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import { useTheme } from "../../src/hooks";
import {
  MapPin,
  Navigation,
  Search,
  Clock,
  Menu,
  Bell,
  ChevronRight,
  Star,
} from "lucide-react-native";

cssInterop(MapPin, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Navigation, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Search, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Clock, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Menu, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Bell, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(ChevronRight, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Star, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

const { width } = Dimensions.get("window");

interface SavedPlace {
  id: string;
  name: string;
  address: string;
  icon: string;
}

interface RecentRide {
  id: string;
  destination: string;
  date: string;
  price: string;
}

const savedPlaces: SavedPlace[] = [
  { id: "1", name: "Home", address: "123 Main Street", icon: "🏠" },
  { id: "2", name: "Work", address: "456 Business Ave", icon: "💼" },
];

const recentRides: RecentRide[] = [
  { id: "1", destination: "Airport Terminal 2", date: "Yesterday", price: "$24.50" },
  { id: "2", destination: "Central Mall", date: "2 days ago", price: "$12.00" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const handleConfirmPickup = () => {
    router.push("/(app)/ride-options");
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <Pressable className="h-12 w-12 items-center justify-center rounded-2xl bg-card">
            <Menu color={isDark ? "#fff" : "#000"} size={22} />
          </Pressable>

          <View className="flex-row items-center">
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Text className="text-sm font-black text-primary-foreground">R</Text>
            </View>
            <Text className="ml-2 text-lg font-bold text-foreground">
              Ride<Text className="text-primary">Now</Text>
            </Text>
          </View>

          <Pressable className="h-12 w-12 items-center justify-center rounded-2xl bg-card">
            <Bell color={isDark ? "#fff" : "#000"} size={22} />
            <View className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
          </Pressable>
        </View>

        {/* Welcome Section */}
        <View className="px-5 py-4">
          <Text className="text-muted-foreground">Good evening,</Text>
          <Text className="text-2xl font-bold text-foreground">Where to today?</Text>
        </View>

        {/* Search Card */}
        <View className="mx-5 overflow-hidden rounded-3xl bg-card">
          <LinearGradient
            colors={["rgba(250,204,21,0.1)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 20 }}
          >
            {/* Pickup */}
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <View className="h-3 w-3 rounded-full bg-primary" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-xs text-muted-foreground">PICKUP</Text>
                <TextInput
                  value={pickup}
                  onChangeText={setPickup}
                  placeholder="Current location"
                  className="py-1 text-base text-foreground"
                  placeholderTextColor={isDark ? "#737373" : "#a3a3a3"}
                />
              </View>
              <Navigation color="#FACC15" size={20} />
            </View>

            {/* Divider with dots */}
            <View className="ml-5 flex-row items-center py-2">
              <View className="h-8 w-px bg-border" />
              <View className="ml-4 flex-1 h-px bg-border" />
            </View>

            {/* Dropoff */}
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
                <View className="h-3 w-3 rounded-sm bg-foreground" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-xs text-muted-foreground">DROPOFF</Text>
                <TextInput
                  value={dropoff}
                  onChangeText={setDropoff}
                  placeholder="Where to?"
                  className="py-1 text-base text-foreground"
                  placeholderTextColor={isDark ? "#737373" : "#a3a3a3"}
                />
              </View>
              <Search color="#737373" size={20} />
            </View>
          </LinearGradient>

          {/* Confirm Button */}
          <Pressable
            onPress={handleConfirmPickup}
            className="mx-5 mb-5 flex-row items-center justify-center rounded-2xl bg-primary py-4 active:opacity-80 mt-4"
          >
            <Text className="text-base font-bold text-primary-foreground">Find a Ride</Text>
            <ChevronRight color="#000" size={20} />
          </Pressable>
        </View>

        {/* Saved Places */}
        <View className="mt-6 px-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-muted-foreground">SAVED PLACES</Text>
            <Pressable>
              <Text className="text-sm font-semibold text-primary">See All</Text>
            </Pressable>
          </View>
          <View className="mt-3 flex-row gap-3">
            {savedPlaces.map((place) => (
              <Pressable
                key={place.id}
                className="flex-1 rounded-2xl bg-card p-4 active:opacity-70"
              >
                <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Text className="text-2xl">{place.icon}</Text>
                </View>
                <Text className="font-semibold text-foreground">{place.name}</Text>
                <Text className="mt-0.5 text-xs text-muted-foreground" numberOfLines={1}>
                  {place.address}
                </Text>
              </Pressable>
            ))}
            <Pressable className="flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-border p-4">
              <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Text className="text-xl text-primary">+</Text>
              </View>
              <Text className="text-sm text-muted-foreground">Add New</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Rides */}
        <View className="mt-6 flex-1 px-5">
          <Text className="mb-3 text-sm font-semibold text-muted-foreground">RECENT RIDES</Text>
          <View className="gap-3">
            {recentRides.map((ride) => (
              <Pressable
                key={ride.id}
                className="flex-row items-center rounded-2xl bg-card p-4 active:opacity-70"
              >
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Clock color="#FACC15" size={20} />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="font-semibold text-foreground">{ride.destination}</Text>
                  <Text className="mt-0.5 text-xs text-muted-foreground">{ride.date}</Text>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-primary">{ride.price}</Text>
                  <View className="mt-1 flex-row">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} color="#FACC15" size={10} fill="#FACC15" />
                    ))}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
