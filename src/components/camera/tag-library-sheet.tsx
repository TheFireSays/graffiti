import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { useTagStore, TagImageOption } from "../../stores/tag-store";

interface TagLibrarySheetProps {
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  tag: "Tags",
  throwup: "Throw-ups",
  piece: "Pieces",
};

export function TagLibrarySheet({ onClose }: TagLibrarySheetProps) {
  const tagImages = useTagStore((s) => s.tagImages);
  const selectedImage = useTagStore((s) => s.selectedImage);
  const selectImage = useTagStore((s) => s.selectImage);
  const isLoadingLibrary = useTagStore((s) => s.isLoadingLibrary);

  function handleSelect(image: TagImageOption) {
    selectImage(image);
    onClose();
  }

  if (isLoadingLibrary) {
    return (
      <View style={styles.container}>
        <View style={styles.handle} />
        <Text style={styles.loadingText}>Loading library...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <Text style={styles.title}>Tag Library</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>X</Text>
        </Pressable>
      </View>
      <FlatList
        data={tagImages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.tagItem, selectedImage?.id === item.id && styles.tagItemSelected]}
            onPress={() => handleSelect(item)}
          >
            <View style={[styles.tagPreview, { backgroundColor: item.customizableColors[0]?.default ?? "#666" }]} />
            <View style={styles.tagInfo}>
              <Text style={styles.tagName}>{item.name}</Text>
              <Text style={styles.tagMeta}>
                {CATEGORY_LABELS[item.category] ?? item.category} · Tier {item.tier}
              </Text>
            </View>
          </Pressable>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", backgroundColor: "#1a1a2e", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  handle: { width: 40, height: 4, backgroundColor: "#444", borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#2a2a4a", alignItems: "center", justifyContent: "center" },
  closeText: { color: "#999", fontSize: 14, fontWeight: "bold" },
  loadingText: { color: "#666", textAlign: "center", paddingVertical: 24 },
  list: { paddingBottom: 32 },
  tagItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12 },
  tagItemSelected: { backgroundColor: "#2a2a4a" },
  tagPreview: { width: 44, height: 44, borderRadius: 8 },
  tagInfo: { flex: 1 },
  tagName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  tagMeta: { color: "#666", fontSize: 12, marginTop: 2, textTransform: "capitalize" },
});
