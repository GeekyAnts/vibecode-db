import React from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cssInterop } from "nativewind";
import { MapPin, Clock, Star, ChevronRight, Car } from "lucide-react-native";

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
cssInterop(Car, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

interface RideHistory {
  id: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  price: string;
  rideType: string;
  rating: number | null;
  driverName: string;
  status: "completed" | "cancelled";
}

const rideHistory: RideHistory[] = [
  {
    id: "1",
    pickup: "123 Main Street",
    dropoff: "Airport Terminal 2",
    date: "Today",
    time: "2:30 PM",
    price: "$24.50",
    rideType: "Premium",
    rating: 5,
    driverName: "Michael J.",
    status: "completed",
  },
  {
    id: "2",
    pickup: "Central Mall",
    dropoff: "456 Oak Avenue",
    date: "Yesterday",
    time: "6:15 PM",
    price: "$12.00",
    rideType: "Economy",
    rating: 4,
    driverName: "Sarah L.",
    status: "completed",
  },
  {
    id: "3",
    pickup: "City Hospital",
    dropoff: "123 Main Street",
    date: "Feb 3",
    time: "10:00 AM",
    price: "$18.75",
    rideType: "Economy",
    rating: 5,
    driverName: "James R.",
    status: "completed",
  },
  {
    id: "4",
    pickup: "Grand Hotel",
    dropoff: "Convention Center",
    date: "Feb 1",
    time: "9:00 AM",
    price: "$8.50",
    rideType: "Economy",
    rating: null,
    driverName: "Emily D.",
    status: "completed",
  },
  {
    id: "5",
    pickup: "Tech Park",
    dropoff: "Downtown Station",
    date: "Jan 28",
    time: "5:45 PM",
    price: "$15.00",
    rideType: "Premium",
    rating: 5,
    driverName: "David K.",
    status: "cancelled",
  },
];

export default function HistoryScreen() {
  const renderRide = ({ item }: { item: RideHistory }) => (
    <Pressable className="mx-5 mb-4 overflow-hidden rounded-3xl bg-card active:opacity-70">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <View className="flex-row items-center gap-2">
          <View
            className={`rounded-lg px-2.5 py-1 ${
              item.rideType === "Premium" ? "bg-primary/20" : "bg-muted"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                item.rideType === "Premium" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.rideType}
            </Text>
          </View>
          <Text className="text-sm text-muted-foreground">
            {item.date} · {item.time}
          </Text>
        </View>
        <Text className="text-xl font-black text-primary">{item.price}</Text>
      </View>

      {/* Route */}
      <View className="p-4">
        <View className="flex-row items-start">
          <View className="items-center pt-1">
            <View className="h-3 w-3 rounded-full bg-primary" />
            <View className="my-1 h-8 w-0.5 bg-border" />
            <View className="h-3 w-3 rounded-sm bg-foreground" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-foreground" numberOfLines={1}>
              {item.pickup}
            </Text>
            <View className="my-2" />
            <Text className="text-foreground" numberOfLines={1}>
              {item.dropoff}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between border-t border-border px-4 py-3">
        <View className="flex-row items-center">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-muted">
            <Text className="text-sm font-bold text-foreground">
              {item.driverName.charAt(0)}
            </Text>
          </View>
          <Text className="ml-2 text-sm text-muted-foreground">{item.driverName}</Text>
        </View>
        {item.status === "cancelled" ? (
          <View className="rounded-full bg-red-500/20 px-3 py-1">
            <Text className="text-xs font-bold text-red-500">Cancelled</Text>
          </View>
        ) : item.rating ? (
          <View className="flex-row items-center gap-1">
            {[...Array(item.rating)].map((_, i) => (
              <Star key={i} color="#FACC15" size={14} fill="#FACC15" />
            ))}
          </View>
        ) : (
          <Pressable className="rounded-full bg-primary/10 px-4 py-1.5">
            <Text className="text-sm font-semibold text-primary">Rate</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );

  const renderHeader = () => (
    <View className="px-5 py-4">
      <Text className="text-3xl font-black text-foreground">History</Text>
      <Text className="mt-1 text-muted-foreground">Your recent trips</Text>

      {/* Stats Summary */}
      <View className="mt-5 flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-card p-4">
          <Text className="text-2xl font-black text-primary">127</Text>
          <Text className="text-sm text-muted-foreground">Total Rides</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-card p-4">
          <Text className="text-2xl font-black text-foreground">$1,250</Text>
          <Text className="text-sm text-muted-foreground">Total Spent</Text>
        </View>
      </View>

      <Text className="mb-2 mt-6 text-sm font-semibold text-muted-foreground">
        RIDE HISTORY
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="h-24 w-24 items-center justify-center rounded-3xl bg-card">
        <Car color="#FACC15" size={48} />
      </View>
      <Text className="mt-5 text-center text-xl font-bold text-foreground">
        No rides yet
      </Text>
      <Text className="mt-2 text-center text-muted-foreground">
        Your ride history will appear here once you complete your first trip
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <FlatList
          data={rideHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderRide}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}
