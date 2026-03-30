import { View, Text, StyleSheet } from "react-native";
import type { Achievement } from "../../stores/achievement-store";

const RARITY_COLORS: Record<string, string> = {
  common: "#9e9e9e",
  rare: "#2196f3",
  epic: "#9c27b0",
  legendary: "#ff9800",
};

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const borderColor = RARITY_COLORS[achievement.rarity] ?? "#9e9e9e";
  const isLocked = !achievement.unlocked;

  return (
    <View style={[styles.card, { borderColor }, isLocked && styles.locked]}>
      <Text style={styles.icon}>{achievement.icon}</Text>
      <View style={styles.info}>
        <Text style={[styles.name, isLocked && styles.lockedText]}>
          {achievement.name}
        </Text>
        <Text style={[styles.description, isLocked && styles.lockedText]}>
          {achievement.description}
        </Text>
        <View style={styles.rewardRow}>
          <Text style={[styles.rarity, { color: borderColor }]}>
            {achievement.rarity.toUpperCase()}
          </Text>
          {achievement.reward_xp > 0 && (
            <Text style={styles.reward}>+{achievement.reward_xp} XP</Text>
          )}
          {achievement.reward_spray > 0 && (
            <Text style={styles.reward}>+{achievement.reward_spray} Spray</Text>
          )}
        </View>
      </View>
      {achievement.unlocked && <Text style={styles.check}>✓</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#2a2a4a",
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    alignItems: "center",
    gap: 12,
  },
  locked: { opacity: 0.5 },
  icon: { fontSize: 28 },
  info: { flex: 1, gap: 2 },
  name: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  description: { color: "#999", fontSize: 12 },
  lockedText: { color: "#555" },
  rewardRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  rarity: { fontSize: 10, fontWeight: "bold" },
  reward: { color: "#ffcc00", fontSize: 10 },
  check: { color: "#4ecdc4", fontSize: 20 },
});
