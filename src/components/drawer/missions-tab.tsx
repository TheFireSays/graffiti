import { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useMissionStore, Mission } from "../../stores/mission-store";
import { useAuthStore } from "../../stores/auth-store";
import { trackEvent } from "../../lib/analytics";

function MissionCard({ mission, onClaim }: { mission: Mission; onClaim: (id: string) => void }) {
  const required = mission.requirements.count;
  const progressPct = Math.min(mission.progress / required, 1);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{mission.type.toUpperCase()}</Text>
        </View>
        {mission.completed && mission.claimed && (
          <Text style={styles.claimedBadge}>CLAIMED</Text>
        )}
      </View>
      <Text style={styles.cardTitle}>{mission.title}</Text>
      <Text style={styles.cardDesc}>{mission.description}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {mission.progress}/{required}
        </Text>
      </View>

      <View style={styles.rewardRow}>
        {mission.reward_xp > 0 && (
          <Text style={styles.rewardText}>+{mission.reward_xp} XP</Text>
        )}
        {mission.reward_spray > 0 && (
          <Text style={styles.rewardText}>+{mission.reward_spray} spray</Text>
        )}
      </View>

      {mission.completed && !mission.claimed && (
        <Pressable style={styles.claimButton} onPress={() => onClaim(mission.id)} accessibilityLabel="Claim Reward" accessibilityRole="button">
          <Text style={styles.claimText}>Claim Reward</Text>
        </Pressable>
      )}
    </View>
  );
}

export function MissionsTab() {
  const { missions, isLoading, error, loadMissions, claimReward } = useMissionStore();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) loadMissions(userId);
  }, [userId]);

  const handleClaim = async (missionId: string) => {
    if (userId) {
      const result = await claimReward(userId, missionId);
      if (!result.error) {
        trackEvent("mission_completed", { mission_id: missionId });
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4ecdc4" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load missions</Text>
      </View>
    );
  }

  if (missions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No Active Missions</Text>
        <Text style={styles.emptyDesc}>Check back soon for new challenges.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.list}>
      {missions.map((m) => (
        <MissionCard key={m.id} mission={m} onClaim={handleClaim} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 12, gap: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 32 },
  card: {
    backgroundColor: "#2a2a4a",
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typeBadge: {
    backgroundColor: "#4ecdc433",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: { color: "#4ecdc4", fontSize: 10, fontWeight: "700" },
  claimedBadge: { color: "#666", fontSize: 10, fontWeight: "700" },
  cardTitle: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  cardDesc: { color: "#999", fontSize: 12 },
  progressContainer: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#1a1a2e",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#4ecdc4", borderRadius: 3 },
  progressText: { color: "#888", fontSize: 11, fontWeight: "600", minWidth: 30 },
  rewardRow: { flexDirection: "row", gap: 12, marginTop: 2 },
  rewardText: { color: "#f7b731", fontSize: 12, fontWeight: "600" },
  claimButton: {
    backgroundColor: "#4ecdc4",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 6,
  },
  claimText: { color: "#1a1a2e", fontWeight: "bold", fontSize: 13 },
  emptyTitle: { color: "#4ecdc4", fontSize: 16, fontWeight: "bold" },
  emptyDesc: { color: "#666", fontSize: 12, marginTop: 4 },
  errorText: { color: "#ff6b6b", fontSize: 13 },
});
