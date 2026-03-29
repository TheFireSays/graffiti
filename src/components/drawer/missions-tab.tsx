import { View, Text, StyleSheet } from "react-native";

export function MissionsTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Missions</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
      <Text style={styles.description}>Challenges and bombing runs will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 32, gap: 8 },
  title: { color: "#4ecdc4", fontSize: 18, fontWeight: "bold" },
  subtitle: { color: "#999", fontSize: 14 },
  description: { color: "#666", fontSize: 12, textAlign: "center", paddingHorizontal: 24 },
});
