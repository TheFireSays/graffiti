import { View, Text, FlatList, StyleSheet } from "react-native";
import type { CrewMember, ActivityScore } from "../../stores/crew-store";

interface CrewRosterProps {
  members: CrewMember[];
  ogEligibleIds: string[];
  activityScores: ActivityScore[];
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

export function CrewRoster({ members, ogEligibleIds = [], activityScores = [] }: CrewRosterProps) {
  const scoreMap = new Map(activityScores.map((s) => [s.userId, s]));

  return (
    <FlatList
      data={members}
      keyExtractor={(item) => item.userId}
      ListHeaderComponent={
        activityScores.length > 0 ? (
          <Text style={styles.headerHint}>Scores based on 14-day activity (XP + tags)</Text>
        ) : null
      }
      renderItem={({ item }) => {
        const isOgEligible = ogEligibleIds.includes(item.userId);
        const score = scoreMap.get(item.userId);
        return (
          <View style={styles.item}>
            <View style={styles.nameRow}>
              <View style={styles.nameWithBadge}>
                <Text style={styles.username}>{item.username}</Text>
                {isOgEligible && (
                  <View style={styles.ogBadge}>
                    <Text style={styles.ogBadgeText}>OG</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.role, { color: ROLE_COLORS[item.role] ?? "#999" }]}>
                {ROLE_LABELS[item.role] ?? item.role}
              </Text>
            </View>
            <Text style={styles.stats}>
              Level {item.level} · {item.xp} XP
            </Text>
            {score != null && (
              <Text style={styles.activityScore}>
                Score: {score.compositeScore.toLocaleString()} · #{score.rank}
              </Text>
            )}
          </View>
        );
      }}
      ListEmptyComponent={<Text style={styles.empty}>No members</Text>}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  headerHint: { color: "#888", fontSize: 11, paddingHorizontal: 16, paddingBottom: 4, fontStyle: "italic" },
  item: { paddingVertical: 12, paddingHorizontal: 16, gap: 4 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  username: { color: "#fff", fontSize: 15, fontWeight: "600" },
  role: { fontSize: 12, fontWeight: "bold", textTransform: "uppercase" },
  stats: { color: "#666", fontSize: 12 },
  activityScore: { color: "#999", fontSize: 11 },
  empty: { color: "#666", textAlign: "center", paddingVertical: 24 },
  nameWithBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  ogBadge: {
    borderWidth: 1,
    borderColor: "#f4c430",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  ogBadgeText: {
    color: "#f4c430",
    fontSize: 10,
    fontWeight: "bold",
  },
});
