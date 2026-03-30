import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { mockMissions } from "../../lib/mock-data";
import { useMapStore } from "../../stores/map-store";

type Mission = typeof mockMissions[number];

export function MissionsTab() {
  const zones = useMapStore((s) => s.zones);
  const selectZone = useMapStore((s) => s.selectZone);
  const selectedZone = useMapStore((s) => s.selectedZone);

  // Zone Raider / Zone Dominator missions highlight the most contested zone
  function handleMissionPress(mission: Mission) {
    if (!mission.requirements.action.includes("zone")) return;
    // Highlight the zone with the most tags as the target
    const hotZone = zones.reduce((best, z) => {
      const count = Object.values((z as any).tagCounts ?? {}).reduce((s: number, v) => s + (v as number), 0);
      const bestCount = Object.values((best as any).tagCounts ?? {}).reduce((s: number, v) => s + (v as number), 0);
      return count > bestCount ? z : best;
    }, zones[0]);
    if (hotZone) selectZone(hotZone);
  }

  const canHighlight = (mission: Mission) => mission.requirements.action.includes("zone");

  return (
    <FlatList
      data={mockMissions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MissionItem
          mission={item}
          isSelected={canHighlight(item) && !!selectedZone}
          onPress={() => handleMissionPress(item)}
          highlightable={canHighlight(item)}
        />
      )}
      ListEmptyComponent={<Text style={styles.empty}>No active missions</Text>}
      contentContainerStyle={styles.list}
    />
  );
}

function MissionItem({
  mission,
  isSelected,
  onPress,
  highlightable,
}: {
  mission: Mission;
  isSelected: boolean;
  onPress: () => void;
  highlightable: boolean;
}) {
  const progress = mission.progress / mission.requirements.count;
  const pct = Math.min(progress, 1);

  return (
    <Pressable
      style={[styles.item, isSelected && styles.itemSelected]}
      onPress={onPress}
      disabled={!highlightable}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.typeBadge}>{mission.type.toUpperCase()}</Text>
          <Text style={styles.title}>{mission.title}</Text>
        </View>
        {highlightable && <Text style={styles.arrow}>›</Text>}
      </View>
      <Text style={styles.description}>{mission.description}</Text>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct * 100}%` as any }]} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.progressText}>
          {mission.progress}/{mission.requirements.count}
        </Text>
        <View style={styles.rewards}>
          {mission.reward_xp > 0 && <Text style={styles.reward}>+{mission.reward_xp} XP</Text>}
          {mission.reward_spray > 0 && <Text style={styles.reward}>+{mission.reward_spray} 🎨</Text>}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  item: {
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: "#1e1e30",
    gap: 6,
  },
  itemSelected: { backgroundColor: "rgba(78,205,196,0.12)", borderLeftWidth: 3, borderLeftColor: "#4ecdc4" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  typeBadge: { color: "#4ecdc4", fontSize: 9, fontWeight: "bold", borderWidth: 1, borderColor: "#4ecdc4", borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1 },
  title: { color: "#fff", fontSize: 14, fontWeight: "600", flex: 1 },
  arrow: { color: "#4ecdc4", fontSize: 18 },
  description: { color: "#888", fontSize: 12 },
  progressTrack: { height: 4, backgroundColor: "#2a2a3e", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, backgroundColor: "#4ecdc4", borderRadius: 2 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressText: { color: "#666", fontSize: 11 },
  rewards: { flexDirection: "row", gap: 8 },
  reward: { color: "#f4c430", fontSize: 11, fontWeight: "600" },
  empty: { color: "#666", textAlign: "center", paddingVertical: 24, fontSize: 14 },
});
