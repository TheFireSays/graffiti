import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useTagStore } from "../../stores/tag-store";

const PALETTE = [
  "#ff3333", "#ff6600", "#ffcc00", "#33cc33", "#3366ff",
  "#cc00ff", "#ff0066", "#00cccc", "#ffffff", "#000000",
  "#ff9999", "#ffcc99", "#ffff99", "#99ff99", "#9999ff",
  "#cc99ff", "#ff99cc", "#99cccc", "#cccccc", "#666666",
];

export function ColorPicker() {
  const selectedImage = useTagStore((s) => s.selectedImage);
  const customColors = useTagStore((s) => s.customColors);
  const setColor = useTagStore((s) => s.setColor);

  if (!selectedImage || selectedImage.customizableColors.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {selectedImage.customizableColors.map((slot) => (
        <View key={slot.slot} style={styles.slotContainer}>
          <View style={styles.slotHeader}>
            <Text style={styles.slotLabel}>{slot.slot}</Text>
            <View style={[styles.currentColor, { backgroundColor: customColors[slot.slot] ?? slot.default }]} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.paletteRow}>
              {PALETTE.map((color) => (
                <Pressable
                  key={color}
                  style={[styles.colorSwatch, { backgroundColor: color }, customColors[slot.slot] === color && styles.colorSwatchSelected]}
                  onPress={() => setColor(slot.slot, color)}
                  accessibilityLabel={`Select color ${color}`}
                  accessibilityRole="button"
                />
              ))}
            </View>
          </ScrollView>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", bottom: 160, left: 0, right: 0, backgroundColor: "rgba(26, 26, 46, 0.9)", paddingVertical: 12, paddingHorizontal: 16, gap: 12 },
  slotContainer: { gap: 6 },
  slotHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  slotLabel: { color: "#999", fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  currentColor: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: "#444" },
  paletteRow: { flexDirection: "row", gap: 6 },
  colorSwatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: "#333" },
  colorSwatchSelected: { borderWidth: 3, borderColor: "#4ecdc4" },
});
