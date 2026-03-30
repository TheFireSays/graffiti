import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CreateCrewForm } from "./create-crew-form";
import { JoinCrewForm } from "./join-crew-form";

interface NoCrewViewProps {
  onCrewChanged: () => void;
}

type Screen = "choose" | "create" | "join";

export function NoCrewView({ onCrewChanged }: NoCrewViewProps) {
  const [screen, setScreen] = useState<Screen>("choose");

  if (screen === "create") {
    return <CreateCrewForm onBack={() => setScreen("choose")} onCreated={onCrewChanged} />;
  }

  if (screen === "join") {
    return <JoinCrewForm onBack={() => setScreen("choose")} onJoined={onCrewChanged} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>No Crew</Text>
      <Text style={styles.subtitle}>Create your own crew or join one with an invite code</Text>

      <Pressable style={styles.createButton} onPress={() => setScreen("create")} accessibilityLabel="Create a Crew" accessibilityRole="button">
        <Text style={styles.createButtonText}>Create a Crew</Text>
      </Pressable>

      <Pressable style={styles.joinButton} onPress={() => setScreen("join")} accessibilityLabel="Join with Invite Code" accessibilityRole="button">
        <Text style={styles.joinButtonText}>Join with Invite Code</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  title: { color: "#4ecdc4", fontSize: 28, fontWeight: "bold" },
  subtitle: { color: "#999", fontSize: 14, textAlign: "center", marginBottom: 16 },
  createButton: { backgroundColor: "#4ecdc4", borderRadius: 12, paddingVertical: 16, paddingHorizontal: 32, width: "100%", alignItems: "center" },
  createButtonText: { color: "#1a1a2e", fontSize: 16, fontWeight: "bold" },
  joinButton: { backgroundColor: "#2a2a4a", borderRadius: 12, paddingVertical: 16, paddingHorizontal: 32, width: "100%", alignItems: "center" },
  joinButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
