import { useEffect, useState } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationListener } from "../components/notifications/notification-listener";
import { ErrorBoundary } from "../components/error-boundary";
import { SyncToast } from "../components/offline/sync-toast";
import { AchievementToast } from "../components/achievements/achievement-toast";
import { useAnalytics } from "../hooks/use-analytics";
import { useOfflineSync } from "../hooks/use-offline-sync";
import { initErrorReporting } from "../lib/error-reporting";

initErrorReporting();

const ONBOARDING_KEY = "hasSeenOnboarding";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);
  const needsOnboarding = useAuthStore((s) => s.needsOnboarding);
  const setSession = useAuthStore((s) => s.setSession);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasSeenOnboarding(value === "true");
    });
  }, []);

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
  useOfflineSync();
  useAnalytics();

  useEffect(() => {
    if (isLoading || hasSeenOnboarding === null) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!session) {
      if (!inAuthGroup) {
        if (!hasSeenOnboarding) {
          router.replace("/(auth)/welcome");
        } else {
          router.replace("/(auth)/sign-in");
        }
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
  }, [session, isLoading, needsOnboarding, hasSeenOnboarding, segments, router]);

  if (isLoading || hasSeenOnboarding === null) {
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#4ecdc4" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <NotificationListener />
      <Slot />
      <AchievementToast />
      <SyncToast />
    </ErrorBoundary>
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
