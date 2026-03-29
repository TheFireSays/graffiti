import { useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CameraView as ExpoCameraView, useCameraPermissions } from "expo-camera";

interface CameraHUDProps {
  latitude: number | null;
  longitude: number | null;
  heading: number | null;
  hasSelectedTag: boolean;
  onOpenLibrary: () => void;
  onPlaceTag: () => void;
  isPlacing: boolean;
}

export function CameraViewWithHUD({
  latitude,
  longitude,
  heading,
  hasSelectedTag,
  onOpenLibrary,
  onPlaceTag,
  isPlacing,
}: CameraHUDProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is needed to place tags</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExpoCameraView ref={cameraRef} style={styles.camera} facing="back" />
      <View style={styles.hud}>
        <View style={styles.gpsBar}>
          <Text style={styles.gpsText}>
            {latitude != null && longitude != null
              ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              : "Acquiring GPS..."}
          </Text>
          <Text style={styles.gpsText}>
            {heading != null ? `${Math.round(heading)}\u00B0` : "--\u00B0"}
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
              disabled={isPlacing || latitude == null}
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
  camera: { flex: 1 },
  permissionContainer: { flex: 1, backgroundColor: "#1a1a2e", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 },
  permissionText: { color: "#999", fontSize: 16, textAlign: "center" },
  permissionButton: { backgroundColor: "#4ecdc4", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  permissionButtonText: { color: "#1a1a2e", fontSize: 16, fontWeight: "bold" },
  hud: { ...StyleSheet.absoluteFillObject, justifyContent: "space-between" },
  gpsBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8, backgroundColor: "rgba(0, 0, 0, 0.4)" },
  gpsText: { color: "#4ecdc4", fontSize: 13, fontWeight: "600", fontVariant: ["tabular-nums"] },
  crosshair: { alignSelf: "center", width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  crosshairDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "#4ecdc4", backgroundColor: "transparent" },
  actionBar: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingBottom: 100, justifyContent: "center" },
  libraryButton: { backgroundColor: "rgba(42, 42, 74, 0.9)", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, minWidth: 120, alignItems: "center" },
  libraryButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  placeButton: { backgroundColor: "#4ecdc4", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, minWidth: 120, alignItems: "center" },
  placeButtonDisabled: { opacity: 0.5 },
  placeButtonText: { color: "#1a1a2e", fontSize: 14, fontWeight: "bold" },
});
