import { useState, useEffect } from "react";
import { ScrollView, Text, Pressable, StyleSheet } from "react-native";
import { CreateCrewForm } from "./create-crew-form";
import { JoinCrewForm } from "./join-crew-form";
import { PendingMemberships } from "./pending-memberships";
import { useCrewStore } from "../../stores/crew-store";

interface NoCrewViewProps {
  onCrewChanged: () => void;
  userId: string;
}

type Screen = "choose" | "create" | "join";

export function NoCrewView({ onCrewChanged, userId }: NoCrewViewProps) {
  const [screen, setScreen] = useState<Screen>("choose");

  const pendingIncomingInvites = useCrewStore((s) => s.pendingIncomingInvites);
  const pendingOutgoingRequests = useCrewStore((s) => s.pendingOutgoingRequests);
  const loadPendingMemberships = useCrewStore((s) => s.loadPendingMemberships);

  useEffect(() => {
    loadPendingMemberships(userId);
  }, [userId]);

  if (screen === "create") {
    return <CreateCrewForm onBack={() => setScreen("choose")} onCreated={onCrewChanged} />;
  }

  if (screen === "join") {
    return <JoinCrewForm onBack={() => setScreen("choose")} onJoined={onCrewChanged} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>No Crew</Text>
      <Text style={styles.subtitle}>Create your own crew or join one with an invite code</Text>

      <Pressable style={styles.createButton} onPress={() => setScreen("create")}>
        <Text style={styles.createButtonText}>Create a Crew</Text>
      </Pressable>

      <Pressable style={styles.joinButton} onPress={() => setScreen("join")}>
        <Text style={styles.joinButtonText}>Join with Invite Code</Text>
      </Pressable>

      <PendingMemberships
        incomingInvites={pendingIncomingInvites}
        outgoingRequests={pendingOutgoingRequests}
        onCrewJoined={onCrewChanged}
      />
    </ScrollView>
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
