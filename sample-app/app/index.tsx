import { Redirect } from "expo-router";
import { useApp } from "@/lib/context";

export default function Index() {
  const { auth } = useApp();

  if (auth.isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/login" />;
}
