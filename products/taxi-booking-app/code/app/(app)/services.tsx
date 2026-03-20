import React from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import {
  Car,
  Package,
  Truck,
  Calendar,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Zap,
  Shield,
  Gift,
} from "lucide-react-native";

cssInterop(Car, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Package, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Truck, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Calendar, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(MapPin, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Clock, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Star, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(ChevronRight, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Zap, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Shield, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Gift, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

const { width } = Dimensions.get("window");

interface Service {
  id: string;
  icon: any;
  name: string;
  description: string;
  gradient: [string, string];
}

const services: Service[] = [
  {
    id: "ride",
    icon: Car,
    name: "Ride",
    description: "Book instantly",
    gradient: ["#FACC15", "#EAB308"],
  },
  {
    id: "package",
    icon: Package,
    name: "Package",
    description: "Send parcels",
    gradient: ["#22C55E", "#16A34A"],
  },
  {
    id: "rental",
    icon: Calendar,
    name: "Rentals",
    description: "Hourly cars",
    gradient: ["#A855F7", "#9333EA"],
  },
  {
    id: "intercity",
    icon: Truck,
    name: "Intercity",
    description: "Long distance",
    gradient: ["#3B82F6", "#2563EB"],
  },
];

interface QuickAction {
  id: string;
  icon: any;
  title: string;
  subtitle: string;
}

const quickActions: QuickAction[] = [
  { id: "1", icon: MapPin, title: "Saved Places", subtitle: "Home, Work & more" },
  { id: "2", icon: Clock, title: "Schedule Ride", subtitle: "Book for later" },
  { id: "3", icon: Star, title: "Favorite Drivers", subtitle: "Your top picks" },
];

export default function ServicesScreen() {
  const router = useRouter();

  const handleServicePress = (serviceId: string) => {
    if (serviceId === "ride") {
      router.push("/(app)/home");
    }
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
            <Text className="text-3xl font-black text-foreground">Services</Text>
            <Text className="mt-1 text-muted-foreground">Choose how you want to move</Text>
          </View>

          {/* Featured Banner */}
          <Pressable className="mx-5 mb-6 overflow-hidden rounded-3xl">
            <LinearGradient
              colors={["#FACC15", "#F59E0B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 24 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="mb-2 flex-row items-center">
                    <Zap color="#000" size={16} fill="#000" />
                    <Text className="ml-1 text-xs font-bold text-black/70">
                      LIMITED OFFER
                    </Text>
                  </View>
                  <Text className="text-2xl font-black text-black">
                    50% OFF
                  </Text>
                  <Text className="text-black/70">On your first 3 rides</Text>
                  <View className="mt-3 self-start rounded-full bg-black px-4 py-2">
                    <Text className="text-sm font-bold text-yellow-400">
                      Use code: FIRST50
                    </Text>
                  </View>
                </View>
                <View className="h-24 w-24 items-center justify-center rounded-full bg-black/10">
                  <Gift color="#000" size={48} />
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Services Grid */}
          <View className="px-5">
            <Text className="mb-4 text-sm font-semibold text-muted-foreground">
              OUR SERVICES
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <Pressable
                    key={service.id}
                    onPress={() => handleServicePress(service.id)}
                    className="overflow-hidden rounded-3xl"
                    style={{ width: (width - 52) / 2 }}
                  >
                    <LinearGradient
                      colors={service.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ padding: 20, minHeight: 140 }}
                    >
                      <View className="mb-auto h-14 w-14 items-center justify-center rounded-2xl bg-black/20">
                        <Icon color="#fff" size={28} />
                      </View>
                      <Text className="mt-3 text-xl font-bold text-white">
                        {service.name}
                      </Text>
                      <Text className="text-white/70">{service.description}</Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mt-8 px-5">
            <Text className="mb-4 text-sm font-semibold text-muted-foreground">
              QUICK ACTIONS
            </Text>
            <View className="overflow-hidden rounded-3xl bg-card">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const isLast = index === quickActions.length - 1;
                return (
                  <Pressable
                    key={action.id}
                    className={`flex-row items-center p-4 active:opacity-70 ${
                      !isLast ? "border-b border-border" : ""
                    }`}
                  >
                    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon color="#FACC15" size={24} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="font-semibold text-foreground">{action.title}</Text>
                      <Text className="mt-0.5 text-sm text-muted-foreground">
                        {action.subtitle}
                      </Text>
                    </View>
                    <ChevronRight color="#525252" size={20} />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Safety Banner */}
          <View className="mx-5 mt-8 overflow-hidden rounded-3xl bg-card">
            <View className="flex-row items-center p-5">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
                <Shield color="#22C55E" size={28} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-bold text-foreground">Safety First</Text>
                <Text className="mt-0.5 text-sm text-muted-foreground">
                  All drivers verified & rides insured
                </Text>
              </View>
              <View className="rounded-full bg-green-500/20 px-3 py-1">
                <Text className="text-xs font-bold text-green-500">SECURE</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View className="mx-5 mt-6 flex-row gap-3">
            <View className="flex-1 items-center rounded-2xl bg-card py-5">
              <Text className="text-3xl font-black text-primary">50K+</Text>
              <Text className="mt-1 text-sm text-muted-foreground">Happy Riders</Text>
            </View>
            <View className="flex-1 items-center rounded-2xl bg-card py-5">
              <Text className="text-3xl font-black text-primary">4.9</Text>
              <Text className="mt-1 text-sm text-muted-foreground">App Rating</Text>
            </View>
            <View className="flex-1 items-center rounded-2xl bg-card py-5">
              <Text className="text-3xl font-black text-primary">24/7</Text>
              <Text className="mt-1 text-sm text-muted-foreground">Support</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
