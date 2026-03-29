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
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/auth-store";
import { containsProfanity } from "../../lib/profanity";

export default function UsernameScreen() {
  const user = useAuthStore((s) => s.user);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const trimmed = username.trim();

    if (trimmed.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (trimmed.length > 20) {
      setError("Username must be 20 characters or less.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError("Username can only contain letters, numbers, and underscores.");
      return;
    }

    if (containsProfanity(trimmed)) {
      setError("That username is not allowed.");
      return;
    }

    if (!user) return;

    setLoading(true);
    setError("");

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", trimmed)
      .neq("id", user.id)
      .maybeSingle();

    if (existing) {
      setLoading(false);
      setError("Username is already taken.");
      return;
    }

    const { data: updateResult, error: updateError } = await supabase
      .rpc("update_profile", {
        p_username: trimmed,
        p_display_name: trimmed,
      });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    const result = updateResult as any;
    if (result && !result.success) {
      setError(result.error ?? "Failed to update profile");
      return;
    }

    await fetchProfile();
    completeOnboarding();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Choose Your Tag</Text>
        <Text style={styles.subtitle}>
          Pick a username. This is your identity on the streets.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
        />

        <Text style={styles.hint}>
          3-20 characters. Letters, numbers, and underscores only.
        </Text>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#1a1a2e" />
          ) : (
            <Text style={styles.buttonText}>Claim Username</Text>
          )}
        </Pressable>
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
    marginBottom: 16,
  },
  error: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 8,
  },
  input: {
    backgroundColor: "#2a2a4a",
    color: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#3a3a5a",
    textAlign: "center",
    fontWeight: "bold",
  },
  hint: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4ecdc4",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
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
});
