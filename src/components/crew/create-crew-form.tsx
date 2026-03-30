import { useState } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator,
} from "react-native";
import { useCrewStore } from "../../stores/crew-store";
import { useAuthStore } from "../../stores/auth-store";
import { containsProfanity } from "../../lib/profanity";

interface CreateCrewFormProps {
  onBack: () => void;
  onCreated: () => void;
}

const CREW_COLORS = [
  "#ff3333", "#ff6600", "#ffcc00", "#33cc33", "#3366ff",
  "#cc00ff", "#ff0066", "#00cccc", "#ff9900", "#00cc88",
];

export function CreateCrewForm({ onBack, onCreated }: CreateCrewFormProps) {
  const profile = useAuthStore((s) => s.profile);
  const createCrew = useCrewStore((s) => s.createCrew);

  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [color, setColor] = useState(CREW_COLORS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) { setError("Crew name is required."); return; }
    if (abbreviation.trim().length !== 3) { setError("Abbreviation must be exactly 3 characters."); return; }
    if (containsProfanity(name.trim()) || containsProfanity(abbreviation.trim())) {
      setError("That name is not allowed.");
      return;
    }
    if (!profile) return;

    setLoading(true);
    setError("");

    const result = await createCrew(name.trim(), abbreviation.trim(), color);
    setLoading(false);

    if (result.success) {
      onCreated();
    } else {
      setError(result.error ?? "Failed to create crew");
    }
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.backButton} accessibilityLabel="Back" accessibilityRole="button">
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.title}>Create a Crew</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Crew Name"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
        maxLength={30}
      />

      <TextInput
        style={styles.input}
        placeholder="3-Letter Tag (e.g. UKG)"
        placeholderTextColor="#666"
        value={abbreviation}
        onChangeText={(t) => setAbbreviation(t.toUpperCase())}
        maxLength={3}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Crew Color</Text>
      <View style={styles.colorRow}>
        {CREW_COLORS.map((c) => (
          <Pressable
            key={c}
            style={[styles.colorSwatch, { backgroundColor: c }, color === c && styles.colorSelected]}
            onPress={() => setColor(c)}
            accessibilityLabel={`Select crew color ${c}`}
            accessibilityRole="button"
          />
        ))}
      </View>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={loading}
        accessibilityLabel="Create Crew"
        accessibilityRole="button"
      >
        {loading ? (
          <ActivityIndicator color="#1a1a2e" />
        ) : (
          <Text style={styles.buttonText}>Create Crew</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  backButton: { alignSelf: "flex-start", padding: 8 },
  backText: { color: "#4ecdc4", fontSize: 14, fontWeight: "600" },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center" },
  error: { color: "#ff4444", fontSize: 14, textAlign: "center", backgroundColor: "rgba(255,68,68,0.1)", padding: 12, borderRadius: 8 },
  input: { backgroundColor: "#2a2a4a", color: "#fff", borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: "#3a3a5a" },
  label: { color: "#999", fontSize: 13, fontWeight: "600" },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: "transparent" },
  colorSelected: { borderColor: "#fff" },
  button: { backgroundColor: "#4ecdc4", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#1a1a2e", fontSize: 16, fontWeight: "bold" },
});
