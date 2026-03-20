import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/lib/context";

export interface User {
  id: string;
  email: string;
}

export const authKeys = {
  session: ["auth", "session"] as const,
  user: ["auth", "user"] as const,
};

export function useAuth() {
  const { client } = useApp();
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: authKeys.session,
    queryFn: async () => {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session;
    },
    staleTime: 0, // Always check session freshness on mount
  });

  const session = sessionQuery.data ?? null;
  const user: User | null = session?.user
    ? { id: session.user.id, email: session.user.email ?? "" }
    : null;

  const signIn = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });

  const signUp = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) throw new Error(error.message);

      // Create a profile row so foreign keys work
      if (data.user) {
        const { error: profileError } = await client.from("profiles").insert({
          id: data.user.id,
          email: data.user.email ?? email,
          full_name: email.split("@")[0],
          bio: "",
          avatar_url: null,
        });
        if (profileError) throw new Error(profileError.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });

  const signOut = useMutation({
    mutationFn: async () => {
      const { error } = await client.auth.signOut();
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    user,
    session,
    isAuthenticated: !!session,
    isLoading: sessionQuery.isLoading,
    signIn,
    signUp,
    signOut,
  };
}
