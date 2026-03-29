import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationListener } from "../components/notifications/notification-listener";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);
  const needsOnboarding = useAuthStore((s) => s.needsOnboarding);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  useNotifications();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!session) {
      if (!inAuthGroup) {
        router.replace("/(auth)/sign-in");
      }
    } else if (needsOnboarding) {
      if (!inOnboardingGroup) {
        router.replace("/(onboarding)/username");
      }
    } else {
      if (inAuthGroup || inOnboardingGroup) {
        router.replace("/(tabs)");
      }
    }
  }, [session, isLoading, needsOnboarding, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#4ecdc4" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <NotificationListener />
      <Slot />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
});
