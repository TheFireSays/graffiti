import { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMapStore } from "../../stores/map-store";

export default function TagDeepLink() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tags = useMapStore((s) => s.tags);
  const loadMapData = useMapStore((s) => s.loadMapData);
  const selectTag = useMapStore((s) => s.selectTag);
  const isLoading = useMapStore((s) => s.isLoading);

  useEffect(() => {
    if (tags.length === 0) {
      loadMapData();
    }
  }, [tags.length, loadMapData]);

  useEffect(() => {
    if (!id || isLoading) return;

    const tag = tags.find((t) => t.id === id);
    if (tag) {
      selectTag(tag);
      router.replace("/(tabs)");
    } else if (tags.length > 0) {
      // Tag not found — go to map anyway
      router.replace("/(tabs)");
    }
  }, [id, tags, isLoading, selectTag, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4ecdc4" />
      <Text style={styles.text}>Loading tag...</Text>
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
