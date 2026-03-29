import { View, Pressable, Text, StyleSheet } from "react-native";

interface MapControlsProps {
  onCenterOnMe: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function MapControls({ onCenterOnMe, onZoomIn, onZoomOut }: MapControlsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={onCenterOnMe}
        testID="center-on-me"
        accessibilityLabel="Center map on my location"
      >
        <Text style={styles.locationIcon}>{"\u2316"}</Text>
      </Pressable>
      <View style={styles.zoomGroup}>
        <Pressable
          style={[styles.button, styles.zoomTop]}
          onPress={onZoomIn}
          testID="zoom-in"
          accessibilityLabel="Zoom in"
        >
          <Text style={styles.icon}>+</Text>
        </Pressable>
        <View style={styles.divider} />
        <Pressable
          style={[styles.button, styles.zoomBottom]}
          onPress={onZoomOut}
          testID="zoom-out"
          accessibilityLabel="Zoom out"
        >
          <Text style={styles.icon}>-</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    bottom: 200,
    gap: 12,
    alignItems: "center",
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  zoomGroup: {
    borderRadius: 22,
    overflow: "hidden",
  },
  zoomTop: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  zoomBottom: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
  },
  icon: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  locationIcon: {
    color: "#4ecdc4",
    fontSize: 20,
    fontWeight: "bold",
  },
});
