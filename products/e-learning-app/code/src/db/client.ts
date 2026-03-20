import { createClient } from "@vibecode-db/client";
import { MockAdapter } from "@vibecode-db/client/adapters/mock";
import { SupabaseAdapter } from "@vibecode-db/client/adapters/supabase";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AdapterType = "mock" | "supabase";

export interface AdapterConfig {
  type: AdapterType;
  supabaseUrl?: string;
  supabaseKey?: string;
}

export function getEnvConfig(): AdapterConfig {
  const type = (process.env.EXPO_PUBLIC_ADAPTER_TYPE as AdapterType) || "mock";
  return {
    type,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || undefined,
    supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY || undefined,
  };
}

function createSeededMockClient() {
  const adapter = new MockAdapter();

  // Seed profiles
  adapter.seed("profiles", [
    {
      id: "user-1",
      email: "alice@example.com",
      full_name: "Alice Johnson",
      username: "alice_j",
      bio: "Lifelong learner & tech enthusiast",
      avatar_url: "https://i.pravatar.cc/150?u=alice",
    },
    {
      id: "user-2",
      email: "bob@example.com",
      full_name: "Bob Smith",
      username: "bob_s",
      bio: "Designer and creative thinker",
      avatar_url: "https://i.pravatar.cc/150?u=bob",
    },
  ]);

  // Seed courses
  adapter.seed("courses", [
    {
      id: "course-1",
      title: "React Native Masterclass",
      description: "Build production-ready mobile apps with React Native and Expo",
      instructor_name: "Sarah Chen",
      instructor_avatar: "https://i.pravatar.cc/150?u=sarah",
      category: "programming",
      difficulty: "intermediate",
      duration_hours: 24,
      image_url: null,
      rating: 48,
      enrolled_count: 1250,
      lessons_count: 42,
      price: 4999,
      is_published: true,
    },
    {
      id: "course-2",
      title: "UI/UX Design Fundamentals",
      description: "Master the principles of user interface and experience design",
      instructor_name: "Alex Rivera",
      instructor_avatar: "https://i.pravatar.cc/150?u=alex",
      category: "design",
      difficulty: "beginner",
      duration_hours: 16,
      image_url: null,
      rating: 46,
      enrolled_count: 890,
      lessons_count: 28,
      price: 3499,
      is_published: true,
    },
    {
      id: "course-3",
      title: "Python for Data Science",
      description: "Learn Python programming for data analysis and machine learning",
      instructor_name: "Dr. James Park",
      instructor_avatar: "https://i.pravatar.cc/150?u=james",
      category: "programming",
      difficulty: "beginner",
      duration_hours: 20,
      image_url: null,
      rating: 47,
      enrolled_count: 2100,
      lessons_count: 36,
      price: 0,
      is_published: true,
    },
    {
      id: "course-4",
      title: "Business Strategy Essentials",
      description: "Strategic thinking frameworks for modern business leaders",
      instructor_name: "Maria Garcia",
      instructor_avatar: "https://i.pravatar.cc/150?u=maria",
      category: "business",
      difficulty: "intermediate",
      duration_hours: 12,
      image_url: null,
      rating: 44,
      enrolled_count: 560,
      lessons_count: 20,
      price: 2999,
      is_published: true,
    },
    {
      id: "course-5",
      title: "Advanced TypeScript Patterns",
      description: "Deep dive into TypeScript generics, decorators, and advanced types",
      instructor_name: "Sarah Chen",
      instructor_avatar: "https://i.pravatar.cc/150?u=sarah",
      category: "programming",
      difficulty: "advanced",
      duration_hours: 18,
      image_url: null,
      rating: 49,
      enrolled_count: 430,
      lessons_count: 32,
      price: 5999,
      is_published: true,
    },
    {
      id: "course-6",
      title: "Digital Marketing Mastery",
      description: "SEO, social media marketing, and growth hacking strategies",
      instructor_name: "Tom Wilson",
      instructor_avatar: "https://i.pravatar.cc/150?u=tom",
      category: "marketing",
      difficulty: "beginner",
      duration_hours: 14,
      image_url: null,
      rating: 43,
      enrolled_count: 780,
      lessons_count: 24,
      price: 2499,
      is_published: true,
    },
  ]);

  // Seed lessons for course-1
  adapter.seed("lessons", [
    { id: "lesson-1", course_id: "course-1", title: "Getting Started with Expo", description: "Set up your development environment", duration_minutes: 15, order_index: 1, is_free: true },
    { id: "lesson-2", course_id: "course-1", title: "React Native Components", description: "Core components and their usage", duration_minutes: 25, order_index: 2, is_free: true },
    { id: "lesson-3", course_id: "course-1", title: "Navigation with Expo Router", description: "File-based routing in React Native", duration_minutes: 30, order_index: 3, is_free: false },
    { id: "lesson-4", course_id: "course-1", title: "Styling with NativeWind", description: "Tailwind CSS for React Native", duration_minutes: 20, order_index: 4, is_free: false },
    { id: "lesson-5", course_id: "course-2", title: "Design Principles", description: "Fundamental design principles", duration_minutes: 20, order_index: 1, is_free: true },
    { id: "lesson-6", course_id: "course-2", title: "Color Theory", description: "Working with color in UI design", duration_minutes: 18, order_index: 2, is_free: false },
    { id: "lesson-7", course_id: "course-3", title: "Python Basics", description: "Variables, types, and control flow", duration_minutes: 30, order_index: 1, is_free: true },
    { id: "lesson-8", course_id: "course-3", title: "Data Structures", description: "Lists, dicts, sets, and tuples", duration_minutes: 25, order_index: 2, is_free: false },
  ]);

  // Seed enrollments for user-1
  adapter.seed("enrollments", [
    { id: "enroll-1", user_id: "user-1", course_id: "course-1", progress_percentage: 65, started_at: "2026-02-15" },
    { id: "enroll-2", user_id: "user-1", course_id: "course-2", progress_percentage: 40, started_at: "2026-03-01" },
    { id: "enroll-3", user_id: "user-1", course_id: "course-3", progress_percentage: 85, started_at: "2026-01-20" },
    { id: "enroll-4", user_id: "user-1", course_id: "course-4", progress_percentage: 100, started_at: "2025-12-10", completed_at: "2026-01-15" },
  ]);

  // Seed lesson progress
  adapter.seed("lesson_progress", [
    { id: "lp-1", user_id: "user-1", lesson_id: "lesson-1", is_completed: true, watched_seconds: 900 },
    { id: "lp-2", user_id: "user-1", lesson_id: "lesson-2", is_completed: true, watched_seconds: 1500 },
    { id: "lp-3", user_id: "user-1", lesson_id: "lesson-3", is_completed: false, watched_seconds: 600 },
    { id: "lp-4", user_id: "user-1", lesson_id: "lesson-5", is_completed: true, watched_seconds: 1200 },
  ]);

  // Seed notes
  adapter.seed("notes", [
    { id: "note-1", user_id: "user-1", lesson_id: "lesson-2", content: "Remember: View, Text, ScrollView are the core building blocks", timestamp_seconds: 120 },
    { id: "note-2", user_id: "user-1", lesson_id: "lesson-3", content: "File-based routing maps file structure to URL paths", timestamp_seconds: 300 },
    { id: "note-3", user_id: "user-1", lesson_id: "lesson-7", content: "Python uses dynamic typing - no need to declare variable types", timestamp_seconds: 180 },
  ]);

  // Seed bookmarks
  adapter.seed("bookmarks", [
    { id: "bm-1", user_id: "user-1", course_id: "course-5" },
    { id: "bm-2", user_id: "user-1", course_id: "course-6" },
  ]);

  // Seed certificates
  adapter.seed("certificates", [
    { id: "cert-1", user_id: "user-1", course_id: "course-4", issued_at: "2026-01-15" },
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
      },
    );
    const adapter = new SupabaseAdapter({
      supabaseUrl: config.supabaseUrl!,
      supabaseKey: config.supabaseKey!,
      client: supabaseClient,
    });
    await adapter.ready;
    return createClient(config.supabaseUrl!, config.supabaseKey!, { adapter });
  }

  return createSeededMockClient();
}

// Synchronous default client for immediate use by all screens
// Uses mock adapter by default — screens import `vibecode` directly
export const vibecode = createSeededMockClient();

export type User = {
  id: string;
  email: string;
  emailVerified?: boolean;
  name?: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, unknown>;
};

export function relativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return past.toLocaleDateString();
}

export const signInSchema = {
  safeParse: (data: { email: string; password: string }) => {
    const errors: string[] = [];
    if (!data.email || !data.email.includes("@")) {
      errors.push("Valid email is required");
    }
    if (!data.password || data.password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }
    return errors.length === 0
      ? { success: true as const, data }
      : { success: false as const, error: { errors } };
  },
};

export const signUpSchema = {
  safeParse: (data: { email: string; password: string; name?: string }) => {
    const errors: string[] = [];
    if (!data.email || !data.email.includes("@")) {
      errors.push("Valid email is required");
    }
    if (!data.password || data.password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }
    return errors.length === 0
      ? { success: true as const, data }
      : { success: false as const, error: { errors } };
  },
};

export function getFirstErrorMessage(error: { errors: string[] }): string {
  return error.errors[0] || "Validation failed";
}
