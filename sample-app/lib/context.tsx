import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { View, ActivityIndicator } from "react-native";
import { createClient } from "@vibecode-db/client";
import { buildClient, getEnvConfig } from "./client";

type Client = ReturnType<typeof createClient>;

interface AppContextValue {
  client: Client;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    buildClient(getEnvConfig())
      .then(setClient)
      .catch((err) => {
        console.error("[AppProvider] buildClient failed:", err);
      });
  }, []);

  if (!client) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <AppContext.Provider value={{ client }}>
      {children}
    </AppContext.Provider>
  );
}
