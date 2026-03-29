import { View, Text, StyleSheet } from "react-native";

export default function CrewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crew</Text>
      <Text style={styles.subtitle}>Crew management coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#4ecdc4",
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
    marginTop: 8,
  },
});
