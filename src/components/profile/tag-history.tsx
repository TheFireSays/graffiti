import { View, Text, FlatList, StyleSheet } from "react-native";
import type { TagHistoryItem } from "../../stores/profile-store";

interface TagHistoryProps {
  tags: TagHistoryItem[];
  isLoading: boolean;
}

export function TagHistory({ tags, isLoading }: TagHistoryProps) {
  if (isLoading) {
    return <Text style={styles.empty}>Loading tags...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Tag History</Text>
      <FlatList
        data={tags}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={[styles.dot, { backgroundColor: item.crewColor ?? "#666" }]} />
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>{item.tagImageName}</Text>
              <Text style={styles.itemMeta}>
                {item.tagCategory}{item.zoneName ? ` · ${item.zoneName}` : ""}
              </Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={[styles.status, item.status === "active" ? styles.statusActive : styles.statusArchived]}>
                {item.status}
              </Text>
              <Text style={styles.time}>{getTimeAgo(item.createdAt)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tags placed yet</Text>}
      />
    </View>
  );
}

function getTimeAgo(dateString: string): string {
  const diffMin = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  itemText: { flex: 1 },
  itemTitle: { color: "#fff", fontSize: 14, fontWeight: "600" },
  itemMeta: { color: "#666", fontSize: 12, textTransform: "capitalize" },
  itemRight: { alignItems: "flex-end", gap: 2 },
  status: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  statusActive: { color: "#4ecdc4" },
  statusArchived: { color: "#666" },
  time: { color: "#666", fontSize: 11 },
  empty: { color: "#666", textAlign: "center", paddingVertical: 24, fontSize: 14 },
});
