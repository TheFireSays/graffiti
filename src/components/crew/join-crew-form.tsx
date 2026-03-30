import { useState } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator,
} from "react-native";
import { useCrewStore } from "../../stores/crew-store";
import { useAuthStore } from "../../stores/auth-store";

interface JoinCrewFormProps {
  onBack: () => void;
  onJoined: () => void;
}

export function JoinCrewForm({ onBack, onJoined }: JoinCrewFormProps) {
  const profile = useAuthStore((s) => s.profile);
  const joinCrew = useCrewStore((s) => s.joinCrew);

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!code.trim()) { setError("Enter an invite code."); return; }
    if (!profile) return;

    setLoading(true);
    setError("");

    const result = await joinCrew(code.trim());
    setLoading(false);

    if (result.success) {
      onJoined();
    } else {
      setError(result.error ?? "Failed to join crew");
    }
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.backButton} accessibilityLabel="Back" accessibilityRole="button">
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.title}>Join a Crew</Text>
      <Text style={styles.subtitle}>Enter the invite code from a crew member</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Invite Code"
        placeholderTextColor="#666"
        value={code}
        onChangeText={setCode}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleJoin}
        disabled={loading}
        accessibilityLabel="Join Crew"
        accessibilityRole="button"
      >
        {loading ? (
          <ActivityIndicator color="#1a1a2e" />
        ) : (
          <Text style={styles.buttonText}>Join Crew</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16, justifyContent: "center" },
  backButton: { alignSelf: "flex-start", padding: 8 },
  backText: { color: "#4ecdc4", fontSize: 14, fontWeight: "600" },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center" },
  subtitle: { color: "#999", fontSize: 14, textAlign: "center" },
  error: { color: "#ff4444", fontSize: 14, textAlign: "center", backgroundColor: "rgba(255,68,68,0.1)", padding: 12, borderRadius: 8 },
  input: { backgroundColor: "#2a2a4a", color: "#fff", borderRadius: 12, padding: 16, fontSize: 18, borderWidth: 1, borderColor: "#3a3a5a", textAlign: "center", fontWeight: "bold" },
  button: { backgroundColor: "#4ecdc4", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#1a1a2e", fontSize: 16, fontWeight: "bold" },
});
