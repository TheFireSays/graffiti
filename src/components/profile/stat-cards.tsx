import { View, Text, StyleSheet } from "react-native";

interface StatCardsProps {
  level: number;
  xp: number;
  sprayCans: number;
  tagCount: number;
}

export function StatCards({ level, xp, sprayCans, tagCount }: StatCardsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard label="Level" value={level.toString()} color="#4ecdc4" />
        <StatCard label="XP" value={xp.toLocaleString()} color="#ffcc00" />
      </View>
      <View style={styles.row}>
        <StatCard label="Spray Cans" value={sprayCans.toString()} color="#ff6600" />
        <StatCard label="Tags Placed" value={tagCount.toString()} color="#cc00ff" />
      </View>
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingHorizontal: 16 },
  row: { flexDirection: "row", gap: 8 },
  card: {
    flex: 1,
    backgroundColor: "#2a2a4a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  cardValue: { fontSize: 24, fontWeight: "bold" },
  cardLabel: { color: "#666", fontSize: 11, fontWeight: "600" },
});
