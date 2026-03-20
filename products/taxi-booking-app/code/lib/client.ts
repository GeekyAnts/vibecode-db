import { createClient, defineTable, hasMany, belongsTo } from "@vibecode-db/client";
import { MockAdapter } from "@vibecode-db/client/adapters/mock";
import { SupabaseAdapter } from "@vibecode-db/client/adapters/supabase";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AdapterType = "mock" | "supabase" | "pocketbase";

export interface AdapterConfig {
  type: AdapterType;
  supabaseUrl?: string;
  supabaseKey?: string;
  pocketbaseUrl?: string;
}

/** Read adapter config from EXPO_PUBLIC_ env variables */
export function getEnvConfig(): AdapterConfig {
  const type = (process.env.EXPO_PUBLIC_ADAPTER_TYPE as AdapterType) || "mock";
  return {
    type,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || undefined,
    supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || undefined,
    pocketbaseUrl: process.env.EXPO_PUBLIC_POCKETBASE_URL || undefined,
  };
}

// ─────────────────────────────────────────
// Define table schemas with relationships
// ─────────────────────────────────────────

const profiles = defineTable("profiles", {
  id: "string",
  email: "string",
  full_name: "string",
  username: "string",
  avatar_url: "string",
  phone: "string",
  bio: "string",
  rides: hasMany(() => rides, "user_id"),
  saved_places: hasMany(() => saved_places, "user_id"),
  payment_methods: hasMany(() => payment_methods, "user_id"),
});

const drivers = defineTable("drivers", {
  id: "string",
  full_name: "string",
  email: "string",
  phone: "string",
  avatar_url: "string",
  rating: "number",
  total_trips: "number",
  car_model: "string",
  car_color: "string",
  plate_number: "string",
  license_number: "string",
  is_available: "boolean",
  current_lat: "number",
  current_lng: "number",
  rides: hasMany(() => rides, "driver_id"),
});

const saved_places = defineTable("saved_places", {
  id: "string",
  user_id: "string",
  name: "string",
  address: "string",
  icon: "string",
  lat: "number",
  lng: "number",
  profiles: belongsTo(() => profiles, "user_id"),
});

const rides = defineTable("rides", {
  id: "string",
  user_id: "string",
  driver_id: "string",
  pickup_address: "string",
  pickup_lat: "number",
  pickup_lng: "number",
  dropoff_address: "string",
  dropoff_lat: "number",
  dropoff_lng: "number",
  ride_type: "string",
  status: "string",
  fare_amount: "number",
  distance_km: "number",
  duration_minutes: "number",
  started_at: "string",
  completed_at: "string",
  cancelled_at: "string",
  notes: "string",
  profiles: belongsTo(() => profiles, "user_id"),
  drivers: belongsTo(() => drivers, "driver_id"),
  ride_ratings: hasMany(() => ride_ratings, "ride_id"),
});

const ride_ratings = defineTable("ride_ratings", {
  id: "string",
  ride_id: "string",
  user_id: "string",
  driver_id: "string",
  rating: "number",
  comment: "string",
  rides: belongsTo(() => rides, "ride_id"),
  profiles: belongsTo(() => profiles, "user_id"),
  drivers: belongsTo(() => drivers, "driver_id"),
});

const payment_methods = defineTable("payment_methods", {
  id: "string",
  user_id: "string",
  type: "string",
  card_last4: "string",
  card_brand: "string",
  is_default: "boolean",
  profiles: belongsTo(() => profiles, "user_id"),
});

function createSeededMockClient() {
  const adapter = new MockAdapter();

  // Register schema so relational queries (joins) work
  adapter.setSchema(profiles, drivers, saved_places, rides, ride_ratings, payment_methods);

  // Seed profiles
  adapter.seed("profiles", [
    {
      id: "user-1",
      email: "alice@example.com",
      full_name: "Alice Johnson",
      username: "alice_j",
      phone: "+1 555-0101",
      bio: "Frequent rider",
      avatar_url: null,
    },
    {
      id: "user-2",
      email: "bob@example.com",
      full_name: "Bob Smith",
      username: "bob_s",
      phone: "+1 555-0102",
      bio: "Daily commuter",
      avatar_url: null,
    },
  ]);

  // Seed drivers
  adapter.seed("drivers", [
    { id: "driver-1", full_name: "Michael Johnson", email: "michael@drivers.com", phone: "+1 555-1001", rating: 4.9, total_trips: 2847, car_model: "Toyota Camry", car_color: "Black", plate_number: "ABC 1234", is_available: true, avatar_url: null, license_number: null, current_lat: null, current_lng: null },
    { id: "driver-2", full_name: "Sarah Lee", email: "sarah@drivers.com", phone: "+1 555-1002", rating: 4.8, total_trips: 1523, car_model: "Honda Accord", car_color: "Silver", plate_number: "DEF 5678", is_available: true, avatar_url: null, license_number: null, current_lat: null, current_lng: null },
    { id: "driver-3", full_name: "James Rodriguez", email: "james@drivers.com", phone: "+1 555-1003", rating: 4.7, total_trips: 3102, car_model: "Ford Explorer", car_color: "White", plate_number: "GHI 9012", is_available: true, avatar_url: null, license_number: null, current_lat: null, current_lng: null },
    { id: "driver-4", full_name: "Emily Davis", email: "emily@drivers.com", phone: "+1 555-1004", rating: 4.95, total_trips: 4210, car_model: "BMW 5 Series", car_color: "Black", plate_number: "JKL 3456", is_available: true, avatar_url: null, license_number: null, current_lat: null, current_lng: null },
    { id: "driver-5", full_name: "David Kim", email: "david@drivers.com", phone: "+1 555-1005", rating: 4.6, total_trips: 987, car_model: "Hyundai Sonata", car_color: "Blue", plate_number: "MNO 7890", is_available: true, avatar_url: null, license_number: null, current_lat: null, current_lng: null },
    { id: "driver-6", full_name: "Lisa Wong", email: "lisa@drivers.com", phone: "+1 555-1006", rating: 4.85, total_trips: 2156, car_model: "Chevrolet Suburban", car_color: "Black", plate_number: "PQR 1357", is_available: true, avatar_url: null, license_number: null, current_lat: null, current_lng: null },
  ]);

  // Seed saved places for Alice
  adapter.seed("saved_places", [
    { id: "place-1", user_id: "user-1", name: "Home", address: "123 Main Street, Downtown", icon: "\u{1F3E0}" },
    { id: "place-2", user_id: "user-1", name: "Work", address: "456 Business Ave, Financial District", icon: "\u{1F4BC}" },
    { id: "place-3", user_id: "user-1", name: "Gym", address: "789 Fitness Blvd", icon: "\u{1F3CB}\u{FE0F}" },
  ]);

  // Seed rides
  adapter.seed("rides", [
    { id: "ride-1", user_id: "user-1", driver_id: "driver-1", pickup_address: "123 Main Street", dropoff_address: "Airport Terminal 2", ride_type: "premium", status: "completed", fare_amount: 24.50, distance_km: 18.5, duration_minutes: 35, started_at: "2024-03-14T14:30:00Z", completed_at: "2024-03-14T15:05:00Z", pickup_lat: null, pickup_lng: null, dropoff_lat: null, dropoff_lng: null, cancelled_at: null, notes: null },
    { id: "ride-2", user_id: "user-1", driver_id: "driver-2", pickup_address: "Central Mall", dropoff_address: "456 Oak Avenue", ride_type: "economy", status: "completed", fare_amount: 12.00, distance_km: 8.2, duration_minutes: 20, started_at: "2024-03-13T18:15:00Z", completed_at: "2024-03-13T18:35:00Z", pickup_lat: null, pickup_lng: null, dropoff_lat: null, dropoff_lng: null, cancelled_at: null, notes: null },
    { id: "ride-3", user_id: "user-1", driver_id: "driver-3", pickup_address: "City Hospital", dropoff_address: "123 Main Street", ride_type: "economy", status: "completed", fare_amount: 18.75, distance_km: 14.0, duration_minutes: 28, started_at: "2024-03-10T10:00:00Z", completed_at: "2024-03-10T10:28:00Z", pickup_lat: null, pickup_lng: null, dropoff_lat: null, dropoff_lng: null, cancelled_at: null, notes: null },
    { id: "ride-4", user_id: "user-1", driver_id: "driver-4", pickup_address: "Grand Hotel", dropoff_address: "Convention Center", ride_type: "economy", status: "completed", fare_amount: 8.50, distance_km: 5.1, duration_minutes: 15, started_at: "2024-03-08T09:00:00Z", completed_at: "2024-03-08T09:15:00Z", pickup_lat: null, pickup_lng: null, dropoff_lat: null, dropoff_lng: null, cancelled_at: null, notes: null },
    { id: "ride-5", user_id: "user-1", driver_id: "driver-5", pickup_address: "Tech Park", dropoff_address: "Downtown Station", ride_type: "premium", status: "cancelled", fare_amount: 15.00, distance_km: 10.0, duration_minutes: null, started_at: null, completed_at: null, pickup_lat: null, pickup_lng: null, dropoff_lat: null, dropoff_lng: null, cancelled_at: "2024-03-05T17:45:00Z", notes: null },
    { id: "ride-6", user_id: "user-1", driver_id: "driver-6", pickup_address: "123 Main Street", dropoff_address: "City Park", ride_type: "suv", status: "completed", fare_amount: 22.00, distance_km: 16.0, duration_minutes: 30, started_at: "2024-03-01T11:00:00Z", completed_at: "2024-03-01T11:30:00Z", pickup_lat: null, pickup_lng: null, dropoff_lat: null, dropoff_lng: null, cancelled_at: null, notes: null },
  ]);

  // Seed ride ratings
  adapter.seed("ride_ratings", [
    { id: "rating-1", ride_id: "ride-1", user_id: "user-1", driver_id: "driver-1", rating: 5, comment: "Great ride, very professional" },
    { id: "rating-2", ride_id: "ride-2", user_id: "user-1", driver_id: "driver-2", rating: 4, comment: "Good driver" },
    { id: "rating-3", ride_id: "ride-3", user_id: "user-1", driver_id: "driver-3", rating: 5, comment: "Excellent service" },
  ]);

  // Seed payment methods
  adapter.seed("payment_methods", [
    { id: "pm-1", user_id: "user-1", type: "card", card_last4: "4242", card_brand: "Visa", is_default: true },
    { id: "pm-2", user_id: "user-1", type: "card", card_last4: "5555", card_brand: "Mastercard", is_default: false },
    { id: "pm-3", user_id: "user-1", type: "wallet", card_last4: null, card_brand: null, is_default: false },
  ]);

  // Seed auth users
  adapter.seedUsers([
    { id: "user-1", email: "alice@example.com", password: "password123" },
    { id: "user-2", email: "bob@example.com", password: "password123" },
  ]);

  return createClient("", "", { adapter });
}

export async function buildClient(config: AdapterConfig) {
  if (config.type === "mock") {
    return createSeededMockClient();
  }

  if (config.type === "supabase") {
    const supabaseClient = createSupabaseClient(
      config.supabaseUrl!,
      config.supabaseKey!,
      {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      }
    );
    const adapter = new SupabaseAdapter({
      supabaseUrl: config.supabaseUrl!,
      supabaseKey: config.supabaseKey!,
      client: supabaseClient,
    });
    await adapter.ready;
    return createClient(config.supabaseUrl!, config.supabaseKey!, { adapter });
  }

  if (config.type === "pocketbase") {
    const { PocketBaseAdapter } = await import(
      "@vibecode-db/client/adapters/pocketbase"
    );
    const adapter = new PocketBaseAdapter({
      url: config.pocketbaseUrl!,
    });
    return createClient(config.pocketbaseUrl!, "", { adapter });
  }

  return createSeededMockClient();
}
