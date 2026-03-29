import { View, Text, StyleSheet } from "react-native";
import { useOfflineStore } from "../../stores/offline-store";

export function PendingBadge() {
  const count = useOfflineStore((s) => s.pendingTags.length);

  if (count === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>
        {count} tag{count > 1 ? "s" : ""} pending
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 204, 0, 0.9)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: { color: "#1a1a2e", fontSize: 12, fontWeight: "bold" },
});
