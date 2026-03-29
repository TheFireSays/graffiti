import { useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import type { LeaderboardUser, LeaderboardCrew, SeasonLeaderboardEntry, SeasonInfo } from "../../stores/profile-store";

interface LeaderboardsProps {
  topUsers: LeaderboardUser[];
  topCrews: LeaderboardCrew[];
  seasonEntries: SeasonLeaderboardEntry[];
  activeSeason: SeasonInfo | null;
  currentUserId: string;
  isLoading: boolean;
}

type Tab = "taggers" | "crews" | "season";

export function Leaderboards({ topUsers, topCrews, seasonEntries, activeSeason, currentUserId, isLoading }: LeaderboardsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("taggers");

  if (isLoading) {
    return <Text style={styles.empty}>Loading leaderboards...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Leaderboards</Text>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === "taggers" && styles.activeTab]}
          onPress={() => setActiveTab("taggers")}
        >
          <Text style={[styles.tabText, activeTab === "taggers" && styles.activeTabText]}>Top Taggers</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "crews" && styles.activeTab]}
          onPress={() => setActiveTab("crews")}
        >
          <Text style={[styles.tabText, activeTab === "crews" && styles.activeTabText]}>Top Crews</Text>
        </Pressable>
        {activeSeason && (
          <Pressable
            style={[styles.tab, activeTab === "season" && styles.activeTab]}
            onPress={() => setActiveTab("season")}
          >
            <Text style={[styles.tabText, activeTab === "season" && styles.activeTabText]}>Season</Text>
          </Pressable>
        )}
      </View>

      {activeTab === "taggers" && (
        <FlatList
          data={topUsers}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View style={[styles.leaderItem, item.id === currentUserId && styles.leaderItemSelf]}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <View style={styles.leaderInfo}>
                <Text style={styles.leaderName}>{item.username}</Text>
                <Text style={styles.leaderMeta}>
                  Level {item.level}{item.crewAbbreviation ? ` · ${item.crewAbbreviation}` : ""}
                </Text>
              </View>
              <Text style={styles.leaderXp}>{item.xp.toLocaleString()} XP</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No taggers yet</Text>}
        />
      )}

      {activeTab === "crews" && (
        <FlatList
          data={topCrews}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View style={styles.leaderItem}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <View style={[styles.crewDot, { backgroundColor: item.color }]} />
              <View style={styles.leaderInfo}>
                <Text style={styles.leaderName}>{item.name}</Text>
                <Text style={styles.leaderMeta}>
                  {item.memberCount} members · {item.zonesControlled} zones
                </Text>
              </View>
              <Text style={styles.leaderXp}>{item.totalXp.toLocaleString()} XP</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No crews yet</Text>}
        />
      )}

      {activeTab === "season" && activeSeason && (
        <FlatList
          data={seasonEntries}
          keyExtractor={(item) => item.crewId}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.leaderItem}>
              <Text style={styles.rank}>#{item.rank}</Text>
              <View style={[styles.crewDot, { backgroundColor: item.crewColor }]} />
              <View style={styles.leaderInfo}>
                <Text style={styles.leaderName}>{item.crewName}</Text>
                <Text style={styles.leaderMeta}>
                  {item.tagsPlaced} tags · {item.zonesHeld} zones
                </Text>
              </View>
              <Text style={styles.leaderXp}>{item.totalXp.toLocaleString()} XP</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No season data yet</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  tabs: { flexDirection: "row", gap: 4, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#2a2a4a" },
  tabText: { color: "#666", fontSize: 13, fontWeight: "600" },
  activeTabText: { color: "#4ecdc4" },
  leaderItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  leaderItemSelf: { backgroundColor: "rgba(78, 205, 196, 0.1)", borderRadius: 8, paddingHorizontal: 8 },
  rank: { color: "#4ecdc4", fontSize: 14, fontWeight: "bold", width: 30 },
  crewDot: { width: 12, height: 12, borderRadius: 6 },
  leaderInfo: { flex: 1 },
  leaderName: { color: "#fff", fontSize: 14, fontWeight: "600" },
  leaderMeta: { color: "#666", fontSize: 12 },
  leaderXp: { color: "#ffcc00", fontSize: 13, fontWeight: "bold" },
  empty: { color: "#666", textAlign: "center", paddingVertical: 24, fontSize: 14 },
});
