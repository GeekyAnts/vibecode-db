import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Star,
  Navigation,
  X,
  Shield,
} from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

cssInterop(ArrowLeft, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Phone, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(MessageSquare, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Star, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Navigation, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(X, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Shield, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

type RideStatus = "finding" | "arriving" | "in_progress";

interface Driver {
  name: string;
  rating: number;
  trips: number;
  carModel: string;
  plateNumber: string;
}

const driver: Driver = {
  name: "Michael Johnson",
  rating: 4.9,
  trips: 2847,
  carModel: "Toyota Camry",
  plateNumber: "ABC 1234",
};

export default function RideTrackingScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<RideStatus>("finding");
  const [eta, setEta] = useState(3);

  const pulseScale = useSharedValue(1);
  const rotateValue = useSharedValue(0);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.3, { duration: 1000, easing: Easing.ease }),
      -1,
      true
    );

    rotateValue.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1
    );

    const timer1 = setTimeout(() => setStatus("arriving"), 2000);
    const timer2 = setTimeout(() => setStatus("in_progress"), 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value}deg` }],
  }));

  const getStatusText = () => {
    switch (status) {
      case "finding":
        return "Finding your driver...";
      case "arriving":
        return `Driver arriving in ${eta} min`;
      case "in_progress":
        return "On the way to destination";
    }
  };

  const handleCancelRide = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-card"
          >
            <ArrowLeft color="#fff" size={22} />
          </Pressable>

          {status === "finding" && (
            <Pressable
              onPress={handleCancelRide}
              className="rounded-full bg-red-500/20 px-4 py-2"
            >
              <Text className="font-semibold text-red-500">Cancel</Text>
            </Pressable>
          )}
        </View>

        {/* Status Indicator - Finding */}
        {status === "finding" && (
          <View className="flex-1 items-center justify-center">
            <View className="relative h-40 w-40 items-center justify-center">
              {/* Rotating border */}
              <Animated.View
                style={rotateStyle}
                className="absolute h-40 w-40 rounded-full border-4 border-transparent border-t-primary"
              />
              {/* Pulse */}
              <Animated.View
                style={pulseStyle}
                className="absolute h-32 w-32 rounded-full bg-primary/20"
              />
              {/* Center icon */}
              <View className="h-24 w-24 items-center justify-center rounded-full bg-primary">
                <Navigation color="#000" size={40} />
              </View>
            </View>
            <Text className="mt-8 text-xl font-bold text-foreground">
              {getStatusText()}
            </Text>
            <Text className="mt-2 text-muted-foreground">
              Please wait while we connect you
            </Text>
          </View>
        )}

        {/* Map placeholder when driver found */}
        {status !== "finding" && (
          <View className="mx-5 flex-1 overflow-hidden rounded-3xl bg-card">
            <LinearGradient
              colors={["rgba(250,204,21,0.1)", "transparent"]}
              style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              <View className="h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                <Navigation color="#FACC15" size={40} />
              </View>
              <Text className="mt-4 text-muted-foreground">Live map tracking</Text>
            </LinearGradient>
          </View>
        )}

        {/* Bottom Card */}
        <View className="rounded-t-3xl bg-card px-5 pb-10 pt-6">
          {/* Status Bar */}
          <View className="mb-5 items-center">
            <View className="h-1 w-12 rounded-full bg-muted" />
          </View>

          {/* Status Text */}
          <View className="mb-5 flex-row items-center justify-center rounded-2xl bg-primary/10 py-3">
            <View
              className={`mr-2 h-2.5 w-2.5 rounded-full ${
                status === "finding" ? "bg-primary" : "bg-green-500"
              }`}
            />
            <Text className="font-bold text-primary">{getStatusText()}</Text>
          </View>

          {/* Driver Info */}
          {status !== "finding" && (
            <View className="mb-5 rounded-3xl bg-muted p-4">
              <View className="flex-row items-center">
                <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                  <Text className="text-2xl font-black text-primary-foreground">
                    {driver.name.charAt(0)}
                  </Text>
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-lg font-bold text-foreground">
                    {driver.name}
                  </Text>
                  <View className="mt-1 flex-row items-center">
                    <Star color="#FACC15" size={14} fill="#FACC15" />
                    <Text className="ml-1 text-sm text-muted-foreground">
                      {driver.rating} ({driver.trips} trips)
                    </Text>
                  </View>
                  <Text className="mt-1 text-sm text-muted-foreground">
                    {driver.carModel} · {driver.plateNumber}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <Pressable className="h-12 w-12 items-center justify-center rounded-2xl bg-background">
                    <Phone color="#FACC15" size={20} />
                  </Pressable>
                  <Pressable className="h-12 w-12 items-center justify-center rounded-2xl bg-background">
                    <MessageSquare color="#FACC15" size={20} />
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Route Info */}
          <View className="rounded-2xl bg-muted p-4">
            <View className="flex-row items-start">
              <View className="items-center pt-1">
                <View className="h-3 w-3 rounded-full bg-primary" />
                <View className="my-1 h-6 w-0.5 bg-border" />
                <View className="h-3 w-3 rounded-sm bg-foreground" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-foreground">123 Main Street, Downtown</Text>
                <View className="my-2" />
                <Text className="text-foreground">Airport Terminal 2</Text>
              </View>
            </View>
          </View>

          {/* Action / Info */}
          {status === "arriving" && (
            <Pressable
              onPress={handleCancelRide}
              className="mt-5 flex-row items-center justify-center rounded-2xl border-2 border-red-500/30 bg-red-500/10 py-4"
            >
              <X color="#EF4444" size={20} />
              <Text className="ml-2 font-bold text-red-500">Cancel Ride</Text>
            </Pressable>
          )}

          {status === "in_progress" && (
            <View className="mt-5 flex-row items-center justify-between rounded-2xl bg-muted p-4">
              <View>
                <Text className="text-sm text-muted-foreground">Estimated arrival</Text>
                <Text className="text-2xl font-black text-foreground">15 min</Text>
              </View>
              <View className="items-end">
                <Text className="text-sm text-muted-foreground">Total fare</Text>
                <Text className="text-2xl font-black text-primary">$12.50</Text>
              </View>
            </View>
          )}

          {/* Safety indicator */}
          <View className="mt-4 flex-row items-center justify-center gap-2">
            <Shield color="#22C55E" size={14} />
            <Text className="text-xs text-green-500">Ride is insured & tracked</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
