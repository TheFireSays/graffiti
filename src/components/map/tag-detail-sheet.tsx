import { View, Text, Pressable, StyleSheet } from "react-native";
import type { MapTag } from "../../lib/geo";

interface TagDetailSheetProps {
  tag: MapTag;
  onClose: () => void;
}

export function TagDetailSheet({ tag, onClose }: TagDetailSheetProps) {
  const timeAgo = getTimeAgo(tag.createdAt);

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <View style={[styles.crewBadge, { backgroundColor: tag.crewColor ?? "#666" }]}>
          <Text style={styles.crewBadgeText}>{tag.crewAbbreviation ?? "---"}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.tagName}>{tag.tagImageName}</Text>
          <Text style={styles.tagCategory}>{tag.tagCategory}</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>X</Text>
        </Pressable>
      </View>
      <View style={styles.details}>
        <DetailRow label="Placed by" value={tag.username} />
        <DetailRow label="When" value={timeAgo} />
        <DetailRow label="Heading" value={`${Math.round(tag.compassHeading)}\u00B0`} />
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  handle: { width: 40, height: 4, backgroundColor: "#444", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  crewBadge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  crewBadgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  headerText: { flex: 1 },
  tagName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  tagCategory: { color: "#4ecdc4", fontSize: 13, textTransform: "capitalize" },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#2a2a4a", alignItems: "center", justifyContent: "center" },
  closeText: { color: "#999", fontSize: 14, fontWeight: "bold" },
  details: { gap: 8 },
  detailRow: { flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { color: "#666", fontSize: 14 },
  detailValue: { color: "#fff", fontSize: 14 },
});
