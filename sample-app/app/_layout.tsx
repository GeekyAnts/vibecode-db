import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persistOptions } from "@/lib/queryClient";
import { AppProvider } from "@/lib/context";
import { useOffline } from "@/hooks";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

function AppContent() {
  // Initialize offline monitoring — syncs NetInfo with React Query's onlineManager
  useOffline();

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="dark">
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistOptions}
      >
        <AppProvider>
          <AppContent />
        </AppProvider>
      </PersistQueryClientProvider>
    </GluestackUIProvider>
  );
}
