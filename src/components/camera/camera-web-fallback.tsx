import { View, Text, Pressable, StyleSheet } from "react-native";

interface CameraWebFallbackProps {
  hasSelectedTag: boolean;
  onOpenLibrary: () => void;
  onPlaceTag: () => void;
  isPlacing: boolean;
  latitude: number | null;
  longitude: number | null;
  heading: number | null;
}

export function CameraWebFallback({
  hasSelectedTag,
  onOpenLibrary,
  onPlaceTag,
  isPlacing,
  latitude,
  longitude,
  heading,
}: CameraWebFallbackProps) {
  return (
    <View style={styles.container}>
      {/* Simulated camera background */}
      <View style={styles.cameraPlaceholder}>
        <View style={styles.brickPattern}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={[styles.brick, { opacity: 0.3 + Math.random() * 0.3 }]} />
          ))}
        </View>
        <View style={styles.overlay}>
          <Text style={styles.overlayIcon}>📷</Text>
          <Text style={styles.overlayText}>Camera Preview</Text>
          <Text style={styles.overlaySubtext}>Not available on web</Text>
        </View>
      </View>

      {/* HUD — same as native */}
      <View style={styles.hud}>
        <View style={styles.gpsBar}>
          <Text style={styles.gpsText}>
            {latitude != null && longitude != null
              ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              : "Demo Location"}
          </Text>
          <Text style={styles.gpsText}>
            {heading != null ? `${Math.round(heading)}°` : "180°"}
          </Text>
        </View>

        <View style={styles.crosshair}>
          <View style={styles.crosshairDot} />
        </View>

        <View style={styles.actionBar}>
          <Pressable style={styles.libraryButton} onPress={onOpenLibrary}>
            <Text style={styles.libraryButtonText}>
              {hasSelectedTag ? "Change Tag" : "Select Tag"}
            </Text>
          </Pressable>
          {hasSelectedTag && (
            <Pressable
              style={[styles.placeButton, isPlacing && styles.placeButtonDisabled]}
              onPress={onPlaceTag}
              disabled={isPlacing}
            >
              <Text style={styles.placeButtonText}>
                {isPlacing ? "Placing..." : "Place Tag"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: "#2a2a3a",
    justifyContent: "center",
    alignItems: "center",
  },
  brickPattern: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 4,
    gap: 2,
  },
  brick: {
    width: 60,
    height: 25,
    backgroundColor: "#3a3a4a",
    borderRadius: 2,
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  overlayIcon: { fontSize: 48 },
  overlayText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  overlaySubtext: { color: "#888", fontSize: 12 },
  hud: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "space-between",
  },
  gpsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 60,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  gpsText: { color: "#4ecdc4", fontSize: 12, fontWeight: "600" },
  crosshair: {
    alignSelf: "center",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  crosshairDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4ecdc4",
  },
  actionBar: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 32,
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  libraryButton: {
    flex: 1,
    backgroundColor: "#2a2a4a",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  libraryButtonText: { color: "#4ecdc4", fontWeight: "bold", fontSize: 14 },
  placeButton: {
    flex: 1,
    backgroundColor: "#4ecdc4",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  placeButtonDisabled: { opacity: 0.5 },
  placeButtonText: { color: "#1a1a2e", fontWeight: "bold", fontSize: 14 },
});
