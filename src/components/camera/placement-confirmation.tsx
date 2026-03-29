import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

interface PlacementConfirmationProps {
  onDismiss: () => void;
}

export function PlacementConfirmation({ onDismiss }: PlacementConfirmationProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.checkmark}>OK</Text>
        <Text style={styles.title}>Tag Placed!</Text>
        <Text style={styles.subtitle}>Your mark is on the map</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0, 0, 0, 0.6)", alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: "#1a1a2e", borderRadius: 20, padding: 32, alignItems: "center", gap: 8 },
  checkmark: { fontSize: 32, fontWeight: "bold", color: "#4ecdc4", marginBottom: 8 },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  subtitle: { color: "#999", fontSize: 14 },
});
