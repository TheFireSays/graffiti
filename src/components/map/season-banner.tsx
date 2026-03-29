import { View, Text, StyleSheet } from "react-native";
import type { SeasonInfo } from "../../stores/profile-store";

interface SeasonBannerProps {
  season: SeasonInfo;
}

export function SeasonBanner({ season }: SeasonBannerProps) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(season.endsAt).getTime() - Date.now()) / 86400000)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>SEASON ACTIVE</Text>
      <Text style={styles.name}>{season.name}</Text>
      <Text style={styles.timer}>{daysLeft}d remaining</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: "rgba(78, 205, 196, 0.9)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: "#1a1a2e",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  name: {
    color: "#1a1a2e",
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
  },
  timer: {
    color: "#1a1a2e",
    fontSize: 12,
    fontWeight: "600",
  },
});
