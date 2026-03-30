import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useURL } from "expo-linking";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

/**
 * Deep link handler for OAuth redirects (graffiti://auth/callback).
 * Extracts access_token and refresh_token from the URL and sets the Supabase session.
 * The root layout auth gate will handle routing after the session is set.
 */
export default function AuthCallbackScreen() {
  const url = useURL();
  const router = useRouter();

  useEffect(() => {
    if (!url) return;

    async function handleCallback() {
      try {
        const parsed = new URL(url!);
        // Tokens can be in hash fragment (#access_token=...) or query params
        const params = new URLSearchParams(
          parsed.hash ? parsed.hash.substring(1) : parsed.search.substring(1),
        );
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Auth callback session error:", error.message);
          }
        }
      } catch (err) {
        console.error("Auth callback error:", err);
      }

      // The root layout's onAuthStateChange listener will pick up
      // the new session and redirect accordingly. Navigate to root
      // so the auth gate can do its job.
      router.replace("/");
    }

    handleCallback();
  }, [url, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4ecdc4" />
      <Text style={styles.text}>Completing sign-in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  text: {
    color: "#999",
    fontSize: 16,
  },
});
