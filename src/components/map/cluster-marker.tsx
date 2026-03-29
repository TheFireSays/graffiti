import { Marker } from "react-native-maps";
import { View, Text, StyleSheet } from "react-native";
import type { TagCluster } from "../../lib/clustering";

interface ClusterMarkerProps {
  cluster: TagCluster;
  onPress: (cluster: TagCluster) => void;
}

export function ClusterMarker({ cluster, onPress }: ClusterMarkerProps) {
  if (cluster.count === 1) {
    return null; // Single tags are rendered by TagMarker
  }

  const size = Math.min(56, 28 + cluster.count * 2);

  return (
    <Marker
      coordinate={{
        latitude: cluster.latitude,
        longitude: cluster.longitude,
      }}
      onPress={() => onPress(cluster)}
      tracksViewChanges={false}
    >
      <View style={[styles.cluster, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={styles.count}>{cluster.count}</Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  cluster: {
    backgroundColor: "#4ecdc4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(78, 205, 196, 0.3)",
  },
  count: {
    color: "#0d0d1a",
    fontSize: 12,
    fontWeight: "bold",
  },
});
