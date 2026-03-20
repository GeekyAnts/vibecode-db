// database.types.ts
// Auto-generated from Supabase schema — do not edit manually

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
          phone: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
        };
        Update: {
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
        };
      };
      drivers: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          rating: number;
          total_trips: number;
          car_model: string;
          car_color: string | null;
          plate_number: string;
          license_number: string | null;
          is_available: boolean;
          current_lat: number | null;
          current_lng: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          rating?: number;
          total_trips?: number;
          car_model: string;
          car_color?: string | null;
          plate_number: string;
          license_number?: string | null;
          is_available?: boolean;
          current_lat?: number | null;
          current_lng?: number | null;
        };
        Update: {
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          rating?: number;
          total_trips?: number;
          car_model?: string;
          car_color?: string | null;
          plate_number?: string;
          license_number?: string | null;
          is_available?: boolean;
          current_lat?: number | null;
          current_lng?: number | null;
        };
      };
      saved_places: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          address: string;
          icon: string;
          lat: number | null;
          lng: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          address: string;
          icon?: string;
          lat?: number | null;
          lng?: number | null;
        };
        Update: {
          name?: string;
          address?: string;
          icon?: string;
          lat?: number | null;
          lng?: number | null;
        };
      };
      rides: {
        Row: {
          id: string;
          user_id: string;
          driver_id: string | null;
          pickup_address: string;
          pickup_lat: number | null;
          pickup_lng: number | null;
          dropoff_address: string;
          dropoff_lat: number | null;
          dropoff_lng: number | null;
          ride_type: "economy" | "premium" | "suv";
          status: "pending" | "finding" | "arriving" | "in_progress" | "completed" | "cancelled";
          fare_amount: number | null;
          distance_km: number | null;
          duration_minutes: number | null;
          started_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          driver_id?: string | null;
          pickup_address: string;
          pickup_lat?: number | null;
          pickup_lng?: number | null;
          dropoff_address: string;
          dropoff_lat?: number | null;
          dropoff_lng?: number | null;
          ride_type: "economy" | "premium" | "suv";
          status?: "pending" | "finding" | "arriving" | "in_progress" | "completed" | "cancelled";
          fare_amount?: number | null;
          distance_km?: number | null;
          duration_minutes?: number | null;
          started_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          notes?: string | null;
        };
        Update: {
          driver_id?: string | null;
          pickup_address?: string;
          pickup_lat?: number | null;
          pickup_lng?: number | null;
          dropoff_address?: string;
          dropoff_lat?: number | null;
          dropoff_lng?: number | null;
          ride_type?: "economy" | "premium" | "suv";
          status?: "pending" | "finding" | "arriving" | "in_progress" | "completed" | "cancelled";
          fare_amount?: number | null;
          distance_km?: number | null;
          duration_minutes?: number | null;
          started_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          notes?: string | null;
        };
      };
      ride_ratings: {
        Row: {
          id: string;
          ride_id: string;
          user_id: string;
          driver_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ride_id: string;
          user_id: string;
          driver_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          type: "card" | "wallet" | "cash";
          card_last4: string | null;
          card_brand: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "card" | "wallet" | "cash";
          card_last4?: string | null;
          card_brand?: string | null;
          is_default?: boolean;
        };
        Update: {
          type?: "card" | "wallet" | "cash";
          card_last4?: string | null;
          card_brand?: string | null;
          is_default?: boolean;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Driver = Database["public"]["Tables"]["drivers"]["Row"];
export type DriverInsert = Database["public"]["Tables"]["drivers"]["Insert"];

export type SavedPlace = Database["public"]["Tables"]["saved_places"]["Row"];
export type SavedPlaceInsert = Database["public"]["Tables"]["saved_places"]["Insert"];

export type Ride = Database["public"]["Tables"]["rides"]["Row"];
export type RideInsert = Database["public"]["Tables"]["rides"]["Insert"];
export type RideUpdate = Database["public"]["Tables"]["rides"]["Update"];
export type RideType = "economy" | "premium" | "suv";
export type RideStatus = "pending" | "finding" | "arriving" | "in_progress" | "completed" | "cancelled";

export type RideRating = Database["public"]["Tables"]["ride_ratings"]["Row"];
export type RideRatingInsert = Database["public"]["Tables"]["ride_ratings"]["Insert"];

export type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"];
export type PaymentMethodInsert = Database["public"]["Tables"]["payment_methods"]["Insert"];
