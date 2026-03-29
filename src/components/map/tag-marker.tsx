import { Marker } from "react-native-maps";
import { View, Text, StyleSheet } from "react-native";
import type { MapTag } from "../../lib/geo";

interface TagMarkerProps {
  tag: MapTag;
  onPress: (tag: MapTag) => void;
}

const DEFAULT_COLOR = "#999999";

export function TagMarker({ tag, onPress }: TagMarkerProps) {
  const color = tag.crewColor ?? DEFAULT_COLOR;
  const label = tag.crewAbbreviation ?? "?";

  return (
    <Marker
      coordinate={{
        latitude: tag.latitude,
        longitude: tag.longitude,
      }}
      onPress={() => onPress(tag)}
      tracksViewChanges={false}
    >
      <View style={[styles.marker, { backgroundColor: color }]}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  label: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
});
