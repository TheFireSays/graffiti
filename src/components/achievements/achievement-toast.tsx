import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useAchievementStore } from "../../stores/achievement-store";

const RARITY_COLORS: Record<string, string> = {
  common: "#9e9e9e",
  rare: "#2196f3",
  epic: "#9c27b0",
  legendary: "#ff9800",
};

export function AchievementToast() {
  const newlyUnlocked = useAchievementStore((s) => s.newlyUnlocked);
  const clearNewlyUnlocked = useAchievementStore((s) => s.clearNewlyUnlocked);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  const current = newlyUnlocked[0];

  useEffect(() => {
    if (!current) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        clearNewlyUnlocked();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [current, opacity, translateY, clearNewlyUnlocked]);

  if (!current) return null;

  const borderColor = RARITY_COLORS[current.rarity] ?? "#9e9e9e";

  return (
    <Animated.View
      style={[styles.container, { opacity, transform: [{ translateY }], borderColor }]}
      pointerEvents="none"
    >
      <Text style={styles.label}>Achievement Unlocked!</Text>
      <View style={styles.row}>
        <Text style={styles.icon}>{current.icon}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{current.name}</Text>
          <Text style={styles.description}>{current.description}</Text>
          <View style={styles.rewards}>
            {current.reward_xp > 0 && (
              <Text style={styles.reward}>+{current.reward_xp} XP</Text>
            )}
            {current.reward_spray > 0 && (
              <Text style={styles.reward}>+{current.reward_spray} Spray</Text>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    gap: 8,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  label: { color: "#ffcc00", fontSize: 12, fontWeight: "bold", textTransform: "uppercase", textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { fontSize: 36 },
  info: { flex: 1, gap: 2 },
  name: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  description: { color: "#999", fontSize: 12 },
  rewards: { flexDirection: "row", gap: 8, marginTop: 4 },
  reward: { color: "#ffcc00", fontSize: 12, fontWeight: "bold" },
});
