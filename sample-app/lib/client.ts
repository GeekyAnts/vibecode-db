import { createClient } from "@vibecode-db/client";
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
    supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY || undefined,
    pocketbaseUrl: process.env.EXPO_PUBLIC_POCKETBASE_URL || undefined,
  };
}

function createSeededMockClient() {
  const adapter = new MockAdapter();

  adapter.seed("profiles", [
    {
      id: "user-1",
      email: "alice@example.com",
      name: "Alice Johnson",
      bio: "Full-stack developer who loves TypeScript",
      avatar_url: null,
    },
  ]);

  adapter.seed("posts", [
    {
      id: 1,
      title: "Getting Started with vibecode-db",
      content:
        "vibecode-db is a universal database SDK that provides a Supabase-compatible API with swappable adapters. This means you can write your queries once and run them against Mock, Supabase, or PocketBase backends.",
      author_id: "user-1",
      author_name: "Alice Johnson",
      created_at: "2024-03-01T10:00:00Z",
    },
    {
      id: 2,
      title: "Building Mobile Apps with Expo",
      content:
        "Expo is an amazing framework for building cross-platform mobile apps. Combined with vibecode-db, you get a powerful data layer that works seamlessly across iOS, Android, and web.",
      author_id: "user-1",
      author_name: "Alice Johnson",
      created_at: "2024-03-05T14:30:00Z",
    },
    {
      id: 3,
      title: "Why Adapter Patterns Matter",
      content:
        "The adapter pattern allows you to swap out your backend without changing any of your application code. This is invaluable for testing, prototyping, and migrating between services.",
      author_id: "user-1",
      author_name: "Alice Johnson",
      created_at: "2024-03-10T09:15:00Z",
    },
  ]);

  adapter.seedUsers([
    {
      id: "user-1",
      email: "alice@example.com",
      password: "password123",
    },
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
