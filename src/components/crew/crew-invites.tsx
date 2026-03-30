import { useState } from "react";
import {
  View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator,
} from "react-native";
import { useCrewStore } from "../../stores/crew-store";
import type { CrewInvite } from "../../stores/crew-store";

interface CrewInvitesProps {
  invites: CrewInvite[];
  crewId: string;
  userId: string;
  canCreateInvites: boolean;
}

export function CrewInvites({ invites, crewId, userId, canCreateInvites }: CrewInvitesProps) {
  const createInvite = useCrewStore((s) => s.createInvite);
  const loadInvites = useCrewStore((s) => s.loadInvites);
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    const result = await createInvite(crewId, userId, 5);
    setCreating(false);

    if (result.success && result.code) {
      setNewCode(result.code);
      loadInvites(crewId);
    }
  }

  return (
    <View style={styles.container}>
      {canCreateInvites && (
        <Pressable
          style={[styles.createButton, creating && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={creating}
          accessibilityLabel="Generate Invite Code"
          accessibilityRole="button"
        >
          {creating ? (
            <ActivityIndicator color="#1a1a2e" />
          ) : (
            <Text style={styles.createButtonText}>Generate Invite Code</Text>
          )}
        </Pressable>
      )}

      {newCode && (
        <View style={styles.newCodeBanner}>
          <Text style={styles.newCodeLabel}>New invite code:</Text>
          <Text style={styles.newCodeValue}>{newCode}</Text>
        </View>
      )}

      <FlatList
        data={invites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.inviteItem}>
            <Text style={styles.inviteCode}>{item.code}</Text>
            <Text style={styles.inviteMeta}>
              {item.useCount}/{item.maxUses} used · by {item.createdByUsername}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No invites yet</Text>}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  createButton: { backgroundColor: "#4ecdc4", borderRadius: 12, padding: 14, alignItems: "center", marginHorizontal: 16, marginVertical: 8 },
  createButtonDisabled: { opacity: 0.6 },
  createButtonText: { color: "#1a1a2e", fontSize: 14, fontWeight: "bold" },
  newCodeBanner: { backgroundColor: "#2a2a4a", borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 8, alignItems: "center", gap: 4 },
  newCodeLabel: { color: "#999", fontSize: 12 },
  newCodeValue: { color: "#4ecdc4", fontSize: 20, fontWeight: "bold", letterSpacing: 2 },
  list: { paddingVertical: 8 },
  inviteItem: { paddingVertical: 12, paddingHorizontal: 16, gap: 4 },
  inviteCode: { color: "#fff", fontSize: 16, fontWeight: "bold", fontVariant: ["tabular-nums"] },
  inviteMeta: { color: "#666", fontSize: 12 },
  empty: { color: "#666", textAlign: "center", paddingVertical: 24 },
});
