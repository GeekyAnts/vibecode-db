import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@vibecode-db/client";
import { MockAdapter } from "@vibecode-db/client/adapters/mock";
import { buildClient, type AdapterType, type AdapterConfig } from "./client";

type Client = ReturnType<typeof createClient>;

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
}

interface AppContextValue {
  client: Client;
  adapterType: AdapterType;
  auth: AuthState;
  switchAdapter: (config: AdapterConfig) => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client>(() => {
    const adapter = new MockAdapter();
    return createClient("", "", { adapter });
  });
  const [adapterType, setAdapterType] = useState<AdapterType>("mock");
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  // Initialize with mock client that has seeded data
  useEffect(() => {
    buildClient({ type: "mock" }).then(setClient);
  }, []);

  const switchAdapter = useCallback(async (config: AdapterConfig) => {
    const newClient = await buildClient(config);
    setClient(newClient);
    setAdapterType(config.type);
    setAuth({ isAuthenticated: false, user: null });
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return error.message;
      if (data.user) {
        setAuth({
          isAuthenticated: true,
          user: { id: data.user.id, email: data.user.email ?? email },
        });
      }
      return null;
    },
    [client]
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) return error.message;
      if (data.user) {
        setAuth({
          isAuthenticated: true,
          user: { id: data.user.id, email: data.user.email ?? email },
        });
      }
      return null;
    },
    [client]
  );

  const signOut = useCallback(async () => {
    await client.auth.signOut();
    setAuth({ isAuthenticated: false, user: null });
  }, [client]);

  return (
    <AppContext.Provider
      value={{ client, adapterType, auth, switchAdapter, signIn, signUp, signOut }}
    >
      {children}
    </AppContext.Provider>
  );
}
