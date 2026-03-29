import { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useLocation } from "../../hooks/use-location";
import { useMapStore } from "../../stores/map-store";
import { GraffitiMapView } from "../../components/map/map-view";
import { TagDetailSheet } from "../../components/map/tag-detail-sheet";
import { MapDrawer } from "../../components/drawer/map-drawer";

export default function MapScreen() {
  const { location, error: locationError, isLoading: locationLoading } = useLocation();
  const loadMapData = useMapStore((s) => s.loadMapData);
  const isLoading = useMapStore((s) => s.isLoading);
  const selectedTag = useMapStore((s) => s.selectedTag);
  const selectTag = useMapStore((s) => s.selectTag);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  if (isLoading || locationLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4ecdc4" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>{locationError}</Text>
        <Text style={styles.loadingText}>Map requires location permission</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GraffitiMapView
        userLocation={
          location
            ? { latitude: location.latitude, longitude: location.longitude }
            : null
        }
      />

      {selectedTag ? (
        <TagDetailSheet tag={selectedTag} onClose={() => selectTag(null)} />
      ) : (
        <MapDrawer
          userLatitude={location?.latitude ?? null}
          userLongitude={location?.longitude ?? null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  loading: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
  },
});
