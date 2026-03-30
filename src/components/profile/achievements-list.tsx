import { View, Text, StyleSheet } from "react-native";
import type { Achievement } from "../../stores/achievement-store";
import { AchievementCard } from "./achievement-card";

interface AchievementsListProps {
  achievements: Achievement[];
  isLoading: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  tagging: "Tagging",
  crew: "Crew",
  exploration: "Exploration",
  mastery: "Mastery",
  social: "Social",
};

export function AchievementsList({ achievements, isLoading }: AchievementsListProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.loading}>Loading achievements...</Text>
      </View>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const categories = [...new Set(achievements.map((a) => a.category))];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.count}>
          {unlockedCount}/{achievements.length}
        </Text>
      </View>

      {categories.map((category) => (
        <View key={category} style={styles.category}>
          <Text style={styles.categoryTitle}>
            {CATEGORY_LABELS[category] ?? category}
          </Text>
          <View style={styles.list}>
            {achievements
              .filter((a) => a.category === category)
              .map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  count: { color: "#4ecdc4", fontSize: 14, fontWeight: "bold" },
  loading: { color: "#666", fontSize: 14 },
  category: { gap: 8 },
  categoryTitle: { color: "#999", fontSize: 13, fontWeight: "600", textTransform: "uppercase" },
  list: { gap: 8 },
});
