import { View, Text, FlatList, StyleSheet } from "react-native";
import type { CrewMember } from "../../stores/crew-store";

interface CrewRosterProps {
  members: CrewMember[];
}

const ROLE_LABELS: Record<string, string> = {
  og: "OG",
  core: "Core",
  member: "Member",
};

const ROLE_COLORS: Record<string, string> = {
  og: "#ffcc00",
  core: "#4ecdc4",
  member: "#999",
};

export function CrewRoster({ members }: CrewRosterProps) {
  return (
    <FlatList
      data={members}
      keyExtractor={(item) => item.userId}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={[styles.role, { color: ROLE_COLORS[item.role] ?? "#999" }]}>
              {ROLE_LABELS[item.role] ?? item.role}
            </Text>
          </View>
          <Text style={styles.stats}>
            Level {item.level} · {item.xp} XP
          </Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No members</Text>}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  item: { paddingVertical: 12, paddingHorizontal: 16, gap: 4 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  username: { color: "#fff", fontSize: 15, fontWeight: "600" },
  role: { fontSize: 12, fontWeight: "bold", textTransform: "uppercase" },
  stats: { color: "#666", fontSize: 12 },
  empty: { color: "#666", textAlign: "center", paddingVertical: 24 },
});
