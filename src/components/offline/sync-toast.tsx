import { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { useOfflineStore } from "../../stores/offline-store";

export function SyncToast() {
  const message = useOfflineStore((s) => s.lastSyncMessage);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [message, opacity]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 100,
    left: 24,
    right: 24,
    backgroundColor: "rgba(78, 205, 196, 0.95)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  text: { color: "#1a1a2e", fontSize: 14, fontWeight: "bold" },
});
