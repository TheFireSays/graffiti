import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { supabase } from "../../lib/supabase";
import { DEMO_MODE } from "../../lib/config";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleReset() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 500));
      setLoading(false);
      setSent(true);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      trimmed,
      { redirectTo: "graffiti://reset-password" },
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Reset Password</Text>

        {sent ? (
          <>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Reset link sent!</Text>
            <Text style={styles.successSubtitle}>
              Check your email for a link to reset your password.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </Pressable>
          </>
        )}

        <Link href="/(auth)/sign-in" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkText}>Back to Sign In</Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
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
  title: {
    color: "#4ecdc4",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
    maxWidth: 320,
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
  input: {
    backgroundColor: "#2a2a4a",
    color: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3a3a5a",
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
  successIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  successTitle: {
    color: "#4ecdc4",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  successSubtitle: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    maxWidth: 320,
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
});
