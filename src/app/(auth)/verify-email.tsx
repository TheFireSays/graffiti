import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/auth-store";
import { DEMO_MODE } from "../../lib/config";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const email = user?.email ?? "";

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Demo mode: auto-advance after 2 seconds
  useEffect(() => {
    if (DEMO_MODE) {
      const timeout = setTimeout(() => {
        router.replace("/(onboarding)/getting-started");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [router]);

  // Poll for email verification
  useEffect(() => {
    if (DEMO_MODE) return;

    intervalRef.current = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.email_confirmed_at) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        router.replace("/(onboarding)/getting-started");
      }
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [router]);

  async function handleResend() {
    if (!email) return;
    setResending(true);
    setError("");
    setResent(false);

    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 500));
      setResending(false);
      setResent(true);
      return;
    }

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    setResending(false);

    if (resendError) {
      setError(resendError.message);
    } else {
      setResent(true);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.icon}>✉️</Text>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a verification link to{" "}
          <Text style={styles.emailText}>{email || "your email"}</Text>. Click
          it to activate your account.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {resent ? (
          <Text style={styles.success}>Verification email resent!</Text>
        ) : null}

        <Pressable
          style={[styles.button, resending && styles.buttonDisabled]}
          onPress={handleResend}
          disabled={resending}
        >
          {resending ? (
            <ActivityIndicator color="#1a1a2e" />
          ) : (
            <Text style={styles.buttonText}>Resend Email</Text>
          )}
        </Pressable>

        <Link href="/(auth)/sign-in" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkText}>Back to Sign In</Text>
          </Pressable>
        </Link>

        {DEMO_MODE ? (
          <Text style={styles.demoHint}>
            Demo mode — auto-advancing...
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  icon: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
  emailText: {
    color: "#4ecdc4",
    fontWeight: "600",
  },
  error: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 8,
    width: "100%",
  },
  success: {
    color: "#4ecdc4",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(78, 205, 196, 0.1)",
    padding: 12,
    borderRadius: 8,
    width: "100%",
  },
  button: {
    backgroundColor: "#4ecdc4",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "100%",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#1a1a2e",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    padding: 12,
    alignItems: "center",
  },
  linkText: {
    color: "#4ecdc4",
    fontSize: 14,
    fontWeight: "600",
  },
  demoHint: {
    color: "#666",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 8,
  },
});
