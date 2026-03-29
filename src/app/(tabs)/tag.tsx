import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocation } from "../../hooks/use-location";
import { useAuthStore } from "../../stores/auth-store";
import { useTagStore } from "../../stores/tag-store";
import { useMapStore } from "../../stores/map-store";
import { placeTag } from "../../lib/tag-placement";
import { CameraViewWithHUD } from "../../components/camera/camera-view";
import { TagLibrarySheet } from "../../components/camera/tag-library-sheet";
import { ColorPicker } from "../../components/camera/color-picker";
import { PlacementConfirmation } from "../../components/camera/placement-confirmation";

export default function TagScreen() {
  const { location, error: locationError, isLoading: locationLoading } = useLocation();
  const profile = useAuthStore((s) => s.profile);

  const selectedImage = useTagStore((s) => s.selectedImage);
  const customColors = useTagStore((s) => s.customColors);
  const isPlacing = useTagStore((s) => s.isPlacing);
  const placementError = useTagStore((s) => s.placementError);
  const placementSuccess = useTagStore((s) => s.placementSuccess);
  const loadTagLibrary = useTagStore((s) => s.loadTagLibrary);
  const setPlacing = useTagStore((s) => s.setPlacing);
  const setPlacementError = useTagStore((s) => s.setPlacementError);
  const setPlacementSuccess = useTagStore((s) => s.setPlacementSuccess);
  const reset = useTagStore((s) => s.reset);

  const loadMapData = useMapStore((s) => s.loadMapData);

  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    if (profile) {
      loadTagLibrary(profile.level);
    }
  }, [profile, loadTagLibrary]);

  const handlePlaceTag = useCallback(async () => {
    if (!location || !selectedImage || !profile) return;

    setPlacing(true);
    setPlacementError(null);

    const result = await placeTag({
      userId: profile.id,
      crewId: profile.crew_id,
      tagImageId: selectedImage.id,
      customColors,
      latitude: location.latitude,
      longitude: location.longitude,
      compassHeading: location.heading ?? 0,
    });

    setPlacing(false);

    if (result.success) {
      setPlacementSuccess(true);
      loadMapData();
    } else {
      setPlacementError(result.error ?? "Failed to place tag");
    }
  }, [
    location, selectedImage, profile, customColors,
    setPlacing, setPlacementError, setPlacementSuccess, loadMapData,
  ]);

  const handleDismissConfirmation = useCallback(() => {
    reset();
  }, [reset]);

  if (locationLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4ecdc4" />
        <Text style={styles.loadingText}>Acquiring location...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>{locationError}</Text>
        <Text style={styles.loadingText}>Camera requires location access</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraViewWithHUD
        latitude={location?.latitude ?? null}
        longitude={location?.longitude ?? null}
        heading={location?.heading ?? null}
        hasSelectedTag={selectedImage !== null}
        onOpenLibrary={() => setShowLibrary(true)}
        onPlaceTag={handlePlaceTag}
        isPlacing={isPlacing}
      />

      {selectedImage && !showLibrary && !placementSuccess && <ColorPicker />}

      {placementError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{placementError}</Text>
        </View>
      )}

      {showLibrary && (
        <TagLibrarySheet onClose={() => setShowLibrary(false)} />
      )}

      {placementSuccess && (
        <PlacementConfirmation onDismiss={handleDismissConfirmation} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  loading: { flex: 1, backgroundColor: "#1a1a2e", alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: "#666", fontSize: 14 },
  errorText: { color: "#ff4444", fontSize: 16 },
  errorBanner: { position: "absolute", top: 100, left: 16, right: 16, backgroundColor: "rgba(255, 68, 68, 0.9)", borderRadius: 12, padding: 12 },
  errorBannerText: { color: "#fff", fontSize: 14, textAlign: "center" },
});
