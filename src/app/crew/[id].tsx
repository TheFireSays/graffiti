import { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function CrewDeepLink() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    // Navigate to the crew tab — the crew store will load the crew by ID
    // For now, navigate to the crew tab where the user can find the crew
    router.replace("/(tabs)/crew");
  }, [id, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4ecdc4" />
      <Text style={styles.text}>Loading crew...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  text: {
    color: "#666",
    fontSize: 14,
  },
});
