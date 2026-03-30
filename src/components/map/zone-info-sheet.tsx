import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { MapZone } from "../../lib/geo";
import { useMapStore } from "../../stores/map-store";
import { JoinRequestForm } from "../crew/join-request-form";

interface ZoneInfoSheetProps {
  zone: MapZone;
  onClose: () => void;
  userCrewId?: string | null;
}

export function ZoneInfoSheet({ zone, onClose, userCrewId = null }: ZoneInfoSheetProps) {
  const crews = useMapStore((s) => s.crews);
  const crewLookup = Object.fromEntries(
    crews.map((c) => [c.id, { abbreviation: c.abbreviation, color: c.color }])
  );

  const totalTags = Object.values(zone.tagCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const isControlled = zone.controllingCrewId != null;
  const crewColor = zone.controllingCrewColor ?? "#666";
  const [showJoinForm, setShowJoinForm] = useState(false);
  const canRequestJoin = !userCrewId && isControlled;

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <View
          style={[styles.zoneBadge, { backgroundColor: crewColor }]}
        >
          <Text style={styles.zoneBadgeText}>
            {zone.controllingCrewAbbreviation ?? "---"}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.zoneName}>{zone.name}</Text>
          <Text style={styles.zoneStatus}>
            {isControlled
              ? `Controlled by ${zone.controllingCrewAbbreviation}`
              : "Unclaimed territory"}
          </Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeButton} testID="zone-close">
          <Text style={styles.closeText}>X</Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <StatBox label="Total Tags" value={String(totalTags)} />
        <StatBox
          label="Crews Active"
          value={String(Object.keys(zone.tagCounts).length)}
        />
      </View>

      {Object.keys(zone.tagCounts).length > 0 && (
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Tag Breakdown</Text>
          {Object.entries(zone.tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([crewId, count]) => {
              const crew = crewLookup[crewId];
              const label = crew?.abbreviation ?? crewId.slice(0, 6);
              const color = crew?.color ?? "#999";
              const isControlling = crewId === zone.controllingCrewId;
              return (
                <View key={crewId} style={styles.breakdownRow}>
                  <View style={styles.breakdownCrewRow}>
                    <View style={[styles.crewDot, { backgroundColor: color }]} />
                    <Text style={styles.breakdownCrew}>{label}</Text>
                    {isControlling && <Text style={styles.crownBadge}>👑</Text>}
                  </View>
                  <Text style={[styles.breakdownCount, { color }]}>{count} tags</Text>
                </View>
              );
            })}
        </View>
      )}

      {canRequestJoin && !showJoinForm && (
        <Pressable
          style={styles.joinRequestButton}
          onPress={() => setShowJoinForm(true)}
          testID="request-join-button"
        >
          <Text style={styles.joinRequestText}>
            Request to Join {zone.controllingCrewAbbreviation}
          </Text>
        </Pressable>
      )}

      {showJoinForm && zone.controllingCrewId && (
        <JoinRequestForm
          crewId={zone.controllingCrewId}
          crewName={zone.controllingCrewAbbreviation ?? "this crew"}
          onSubmitted={() => setShowJoinForm(false)}
          onCancel={() => setShowJoinForm(false)}
        />
      )}
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#444",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  zoneBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  zoneBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  headerText: { flex: 1 },
  zoneName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  zoneStatus: {
    color: "#4ecdc4",
    fontSize: 13,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2a2a4a",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "bold",
  },
  stats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#2a2a4a",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  breakdown: {
    gap: 8,
  },
  breakdownTitle: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownCrewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  crewDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  crownBadge: {
    fontSize: 12,
  },
  breakdownCrew: {
    color: "#ccc",
    fontSize: 14,
  },
  breakdownCount: {
    color: "#4ecdc4",
    fontSize: 14,
    fontWeight: "600",
  },
  joinRequestButton: {
    backgroundColor: "#4ecdc4",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  joinRequestText: {
    color: "#1a1a2e",
    fontSize: 14,
    fontWeight: "bold",
  },
});
