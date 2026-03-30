import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useMapStore } from "../../stores/map-store";

interface MapWebFallbackProps {
  userLocation: { latitude: number; longitude: number } | null;
}

export function MapWebFallback({ userLocation }: MapWebFallbackProps) {
  const zones = useMapStore((s) => s.zones);
  const tags = useMapStore((s) => s.tags);
  const selectTag = useMapStore((s) => s.selectTag);
  const selectZone = useMapStore((s) => s.selectZone);

  return (
    <View style={styles.container}>
      {/* Map header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Graffiti Map</Text>
        <Text style={styles.headerSubtitle}>
          {userLocation
            ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
            : "Downtown Austin, TX"}
        </Text>
      </View>

      {/* Zone grid */}
      <ScrollView style={styles.mapArea} contentContainerStyle={styles.mapContent}>
        <Text style={styles.sectionTitle}>Zones ({zones.length})</Text>
        <View style={styles.zoneGrid}>
          {zones.map((zone) => (
            <Pressable
              key={zone.id}
              style={[
                styles.zoneCard,
                { borderLeftColor: zone.controllingCrewColor ?? "#444" },
              ]}
              onPress={() => selectZone(zone)}
            >
              <Text style={styles.zoneName}>{zone.name}</Text>
              <Text style={styles.zoneControl}>
                {zone.controllingCrewAbbreviation
                  ? `Controlled by ${zone.controllingCrewAbbreviation}`
                  : "Uncontrolled"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
          Tags ({tags.length})
        </Text>
        <View style={styles.tagGrid}>
          {tags.map((tag) => (
            <Pressable
              key={tag.id}
              style={styles.tagDot}
              onPress={() => selectTag(tag)}
            >
              <View
                style={[
                  styles.tagMarker,
                  { backgroundColor: tag.crewColor ?? "#999" },
                ]}
              >
                <Text style={styles.tagLabel}>
                  {tag.crewAbbreviation ?? "?"}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d1a" },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: "#1a1a2e",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: { color: "#4ecdc4", fontSize: 24, fontWeight: "bold" },
  headerSubtitle: { color: "#666", fontSize: 12, marginTop: 4 },
  mapArea: { flex: 1 },
  mapContent: { padding: 16 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  zoneGrid: { gap: 8 },
  zoneCard: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
  zoneName: { color: "#fff", fontSize: 14, fontWeight: "600" },
  zoneControl: { color: "#888", fontSize: 12, marginTop: 2 },
  tagGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagDot: { alignItems: "center" },
  tagMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  tagLabel: { color: "#fff", fontSize: 9, fontWeight: "bold" },
});
