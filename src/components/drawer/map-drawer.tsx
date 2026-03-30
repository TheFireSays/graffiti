import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { NearbyTab } from "./nearby-tab";
import { FeedTab } from "./feed-tab";
import { MissionsTab } from "./missions-tab";

const TABS = ["Nearby", "Feed", "Missions"] as const;
type TabName = (typeof TABS)[number];

interface MapDrawerProps {
  userLatitude: number | null;
  userLongitude: number | null;
}

const DRAWER_HEIGHT = Dimensions.get("window").height * 0.4;

export function MapDrawer({ userLatitude, userLongitude }: MapDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabName>("Nearby");
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.container, { height: expanded ? DRAWER_HEIGHT : 120 }]}>
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.handleArea} accessibilityLabel={expanded ? "Collapse drawer" : "Expand drawer"} accessibilityRole="button">
        <View style={styles.handle} />
      </Pressable>
      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => { setActiveTab(tab); if (!expanded) setExpanded(true); }}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            accessibilityLabel={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </Pressable>
        ))}
      </View>
      {expanded && (
        <View style={styles.content}>
          {activeTab === "Nearby" && <NearbyTab userLatitude={userLatitude} userLongitude={userLongitude} />}
          {activeTab === "Feed" && <FeedTab />}
          {activeTab === "Missions" && <MissionsTab />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#1a1a2e", borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden" },
  handleArea: { alignItems: "center", paddingVertical: 8 },
  handle: { width: 40, height: 4, backgroundColor: "#444", borderRadius: 2 },
  tabs: { flexDirection: "row", paddingHorizontal: 16, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#2a2a4a" },
  tabText: { color: "#666", fontSize: 13, fontWeight: "600" },
  activeTabText: { color: "#4ecdc4" },
  content: { flex: 1 },
});
