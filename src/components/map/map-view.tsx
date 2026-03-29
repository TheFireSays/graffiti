import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, Platform } from "react-native";
import { useMapStore } from "../../stores/map-store";
import { ZonePolygon } from "./zone-polygon";
import { TagMarker } from "./tag-marker";
import type { MapCoordinate } from "../../lib/geo";

interface GraffitiMapViewProps {
  userLocation: MapCoordinate | null;
}

const DEFAULT_REGION = {
  latitude: 30.2672,
  longitude: -97.7431,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export function GraffitiMapView({ userLocation }: GraffitiMapViewProps) {
  const zones = useMapStore((s) => s.zones);
  const tags = useMapStore((s) => s.tags);
  const selectTag = useMapStore((s) => s.selectTag);

  const initialRegion = userLocation
    ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : DEFAULT_REGION;

  return (
    <MapView
      style={styles.map}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton
      showsCompass
      customMapStyle={darkMapStyle}
    >
      {zones.map((zone) => (
        <ZonePolygon key={zone.id} zone={zone} />
      ))}
      {tags.map((tag) => (
        <TagMarker key={tag.id} tag={tag} onPress={selectTag} />
      ))}
    </MapView>
  );
}

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#666" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a4a" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#555" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d0d1a" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const styles = StyleSheet.create({
  map: { flex: 1 },
});
