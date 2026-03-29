import { useRef, useCallback, useState } from "react";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { StyleSheet, Platform } from "react-native";
import { useMapStore } from "../../stores/map-store";
import { ZonePolygon } from "./zone-polygon";
import { TagMarker } from "./tag-marker";
import { ClusterMarker } from "./cluster-marker";
import { MapControls } from "./map-controls";
import { clusterTags, TagCluster } from "../../lib/clustering";
import type { MapCoordinate, MapZone } from "../../lib/geo";

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
  const mapRef = useRef<MapView>(null);
  const zones = useMapStore((s) => s.zones);
  const tags = useMapStore((s) => s.tags);
  const selectTag = useMapStore((s) => s.selectTag);
  const selectZone = useMapStore((s) => s.selectZone);

  const [region, setRegion] = useState<Region>(
    userLocation
      ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
      : DEFAULT_REGION
  );

  const clusters = clusterTags(
    tags,
    region.latitudeDelta,
    region.longitudeDelta,
    region.latitude,
    region.longitude
  );

  const handleClusterPress = useCallback(
    (cluster: TagCluster) => {
      mapRef.current?.animateToRegion(
        {
          latitude: cluster.latitude,
          longitude: cluster.longitude,
          latitudeDelta: region.latitudeDelta / 3,
          longitudeDelta: region.longitudeDelta / 3,
        },
        300
      );
    },
    [region]
  );

  const handleZonePress = useCallback(
    (zone: MapZone) => {
      selectZone(zone);
    },
    [selectZone]
  );

  const handleCenterOnMe = useCallback(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300
      );
    }
  }, [userLocation]);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.animateToRegion(
      {
        ...region,
        latitudeDelta: region.latitudeDelta / 2,
        longitudeDelta: region.longitudeDelta / 2,
      },
      200
    );
  }, [region]);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.animateToRegion(
      {
        ...region,
        latitudeDelta: region.latitudeDelta * 2,
        longitudeDelta: region.longitudeDelta * 2,
      },
      200
    );
  }, [region]);

  return (
    <>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        customMapStyle={darkMapStyle}
      >
        {zones.map((zone) => (
          <ZonePolygon key={zone.id} zone={zone} onPress={handleZonePress} />
        ))}
        {clusters.map((cluster) =>
          cluster.count === 1 ? (
            <TagMarker
              key={cluster.tags[0].id}
              tag={cluster.tags[0]}
              onPress={selectTag}
            />
          ) : (
            <ClusterMarker
              key={cluster.id}
              cluster={cluster}
              onPress={handleClusterPress}
            />
          )
        )}
      </MapView>
      <MapControls
        onCenterOnMe={handleCenterOnMe}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </>
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
