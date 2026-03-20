import React, { useState } from "react";
import { View, Text, Pressable, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import { ArrowLeft, Users, Clock, Check, Zap } from "lucide-react-native";

cssInterop(ArrowLeft, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Users, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Clock, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Check, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Zap, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

interface RideOption {
  id: string;
  name: string;
  description: string;
  price: string;
  eta: string;
  capacity: number;
  multiplier?: string;
  icon: string;
}

const rideOptions: RideOption[] = [
  {
    id: "economy",
    name: "Economy",
    description: "Affordable everyday rides",
    price: "$12.50",
    eta: "3 min",
    capacity: 4,
    icon: "🚗",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Comfortable with top drivers",
    price: "$18.00",
    eta: "5 min",
    capacity: 4,
    multiplier: "1.2x",
    icon: "🚙",
  },
  {
    id: "suv",
    name: "SUV",
    description: "Extra space for groups",
    price: "$24.00",
    eta: "7 min",
    capacity: 6,
    icon: "🚐",
  },
];

export default function RideOptionsScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>("economy");

  const handleBookNow = () => {
    router.push("/(app)/ride-tracking");
  };

  const selectedRide = rideOptions.find((r) => r.id === selectedOption);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center px-5 py-4">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-card"
          >
            <ArrowLeft color="#fff" size={22} />
          </Pressable>
          <Text className="ml-4 text-xl font-bold text-foreground">Choose a ride</Text>
        </View>

        {/* Route Summary */}
        <View className="mx-5 mb-4 rounded-2xl bg-card p-4">
          <View className="flex-row items-start">
            <View className="items-center pt-1">
              <View className="h-3 w-3 rounded-full bg-primary" />
              <View className="my-1 h-10 w-0.5 bg-border" />
              <View className="h-3 w-3 rounded-sm bg-foreground" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xs text-muted-foreground">PICKUP</Text>
              <Text className="font-medium text-foreground">123 Main Street, Downtown</Text>
              <View className="my-3" />
              <Text className="text-xs text-muted-foreground">DROPOFF</Text>
              <Text className="font-medium text-foreground">Airport Terminal 2</Text>
            </View>
          </View>
        </View>

        {/* Ride Options */}
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 180 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-4 text-sm font-semibold text-muted-foreground">
            AVAILABLE RIDES
          </Text>

          <View className="gap-3">
            {rideOptions.map((option) => {
              const isSelected = selectedOption === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSelectedOption(option.id)}
                  className={`overflow-hidden rounded-3xl ${
                    isSelected ? "border-2 border-primary" : ""
                  }`}
                >
                  <View className={`p-4 ${isSelected ? "bg-primary/10" : "bg-card"}`}>
                    <View className="flex-row items-center">
                      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                        <Text className="text-3xl">{option.icon}</Text>
                      </View>
                      <View className="ml-4 flex-1">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2">
                            <Text className="text-lg font-bold text-foreground">
                              {option.name}
                            </Text>
                            {option.multiplier && (
                              <View className="flex-row items-center rounded-full bg-primary/20 px-2 py-0.5">
                                <Zap color="#FACC15" size={12} fill="#FACC15" />
                                <Text className="ml-0.5 text-xs font-bold text-primary">
                                  {option.multiplier}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-xl font-black text-primary">
                            {option.price}
                          </Text>
                        </View>
                        <Text className="mt-0.5 text-sm text-muted-foreground">
                          {option.description}
                        </Text>
                        <View className="mt-2 flex-row items-center gap-4">
                          <View className="flex-row items-center">
                            <Clock color="#737373" size={14} />
                            <Text className="ml-1 text-sm text-muted-foreground">
                              {option.eta}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <Users color="#737373" size={14} />
                            <Text className="ml-1 text-sm text-muted-foreground">
                              {option.capacity}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {isSelected && (
                        <View className="ml-2 h-7 w-7 items-center justify-center rounded-full bg-primary">
                          <Check color="#000" size={16} strokeWidth={3} />
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Book Button */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-5 pb-10 pt-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-muted-foreground">Total fare</Text>
              <Text className="text-3xl font-black text-primary">
                {selectedRide?.price}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm text-muted-foreground">Arriving in</Text>
              <Text className="text-xl font-bold text-foreground">
                {selectedRide?.eta}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={handleBookNow}
            className="overflow-hidden rounded-2xl"
          >
            <LinearGradient
              colors={["#FACC15", "#EAB308"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 18 }}
            >
              <Text className="text-center text-lg font-black text-black">
                Book {selectedRide?.name}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
