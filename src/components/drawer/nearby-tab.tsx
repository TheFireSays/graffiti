import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useMapStore } from "../../stores/map-store";
import type { MapTag } from "../../lib/geo";

interface NearbyTabProps {
  userLatitude: number | null;
  userLongitude: number | null;
}

export function NearbyTab({ userLatitude, userLongitude }: NearbyTabProps) {
  const tags = useMapStore((s) => s.tags);
  const selectTag = useMapStore((s) => s.selectTag);
  const selectedTag = useMapStore((s) => s.selectedTag);

  const sorted =
    userLatitude != null && userLongitude != null
      ? [...tags].sort(
          (a, b) =>
            distance(userLatitude, userLongitude, a.latitude, a.longitude) -
            distance(userLatitude, userLongitude, b.latitude, b.longitude)
        )
      : tags;

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NearbyItem
          tag={item}
          isSelected={selectedTag?.id === item.id}
          distanceM={
            userLatitude != null && userLongitude != null
              ? distance(userLatitude, userLongitude, item.latitude, item.longitude)
              : null
          }
          onPress={() => selectTag(item)}
        />
      )}
      ListEmptyComponent={<Text style={styles.empty}>No tags nearby</Text>}
      contentContainerStyle={styles.list}
    />
  );
}

function NearbyItem({
  tag,
  distanceM,
  isSelected,
  onPress,
}: {
  tag: MapTag;
  distanceM: number | null;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.item, isSelected && styles.itemSelected]}
      onPress={onPress}
    >
      <View style={[styles.dot, { backgroundColor: tag.crewColor ?? "#666" }]} />
      <View style={styles.itemText}>
        <Text style={styles.itemTitle}>{tag.tagImageName ?? "Tag"}</Text>
        <Text style={styles.itemSub}>{tag.username} · {tag.crewAbbreviation ?? "Solo"}</Text>
      </View>
      {distanceM != null && <Text style={styles.distance}>{formatDistance(distanceM)}</Text>}
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

function distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 16 },
  itemSelected: { backgroundColor: "rgba(78,205,196,0.12)", borderLeftWidth: 3, borderLeftColor: "#4ecdc4" },
  dot: { width: 12, height: 12, borderRadius: 6 },
  itemText: { flex: 1 },
  itemTitle: { color: "#fff", fontSize: 14, fontWeight: "600" },
  itemSub: { color: "#666", fontSize: 12 },
  distance: { color: "#4ecdc4", fontSize: 12, fontWeight: "600" },
  arrow: { color: "#4ecdc4", fontSize: 18, marginLeft: 4 },
  empty: { color: "#666", textAlign: "center", paddingVertical: 24, fontSize: 14 },
});
