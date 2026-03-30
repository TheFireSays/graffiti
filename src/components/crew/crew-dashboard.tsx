import { useState } from "react";
import {
  View, Text, Pressable, StyleSheet, Alert,
} from "react-native";
import { useCrewStore } from "../../stores/crew-store";
import { CrewRoster } from "./crew-roster";
import { CrewInvites } from "./crew-invites";
import { CrewRequestsTab } from "./crew-requests-tab";
import type { CrewInfo, CrewMember, CrewInvite, JoinRequest, DirectInvite } from "../../stores/crew-store";

interface CrewDashboardProps {
  crew: CrewInfo;
  members: CrewMember[];
  invites: CrewInvite[];
  joinRequests: JoinRequest[];
  directInvites: DirectInvite[];
  userId: string;
  userRole: string;
  isOgEligible: boolean;
  onLeft: () => void;
}

type Tab = "roster" | "invites" | "requests";

export function CrewDashboard({
  crew, members, invites, joinRequests, directInvites, userId, userRole, isOgEligible, onLeft,
}: CrewDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("roster");
  const leaveCrew = useCrewStore((s) => s.leaveCrew);

  const isFounder = userRole === "og";
  const canCreateInvites = isOgEligible;

  async function handleLeave() {
    if (isFounder) {
      Alert.alert("Cannot Leave", "As the founder, you cannot leave your crew.");
      return;
    }

    const result = await leaveCrew();
    if (result.success) {
      onLeft();
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.crewBadge, { backgroundColor: crew.color }]}>
          <Text style={styles.crewAbbr}>{crew.abbreviation}</Text>
        </View>
        <Text style={styles.crewName}>{crew.name}</Text>
        <View style={styles.statsRow}>
          <StatBox label="Members" value={crew.memberCount.toString()} />
          <StatBox label="Total XP" value={crew.totalXp.toString()} />
          <StatBox label="Zones" value={crew.zonesControlled.toString()} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === "roster" && styles.activeTab]}
          onPress={() => setActiveTab("roster")}
        >
          <Text style={[styles.tabText, activeTab === "roster" && styles.activeTabText]}>
            Roster ({members.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "invites" && styles.activeTab]}
          onPress={() => setActiveTab("invites")}
        >
          <Text style={[styles.tabText, activeTab === "invites" && styles.activeTabText]}>
            Invites
          </Text>
        </Pressable>
        {isOgEligible && (
          <Pressable
            style={[styles.tab, activeTab === "requests" && styles.activeTab]}
            onPress={() => setActiveTab("requests")}
          >
            <Text style={[styles.tabText, activeTab === "requests" && styles.activeTabText]}>
              Requests ({joinRequests.length})
            </Text>
          </Pressable>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "roster" && <CrewRoster members={members} />}
        {activeTab === "invites" && (
          <CrewInvites
            invites={invites}
            crewId={crew.id}
            userId={userId}
            canCreateInvites={canCreateInvites}
            isOgEligible={isOgEligible}
            directInvites={directInvites}
          />
        )}
        {activeTab === "requests" && isOgEligible && (
          <CrewRequestsTab crewId={crew.id} />
        )}
      </View>

      {/* Leave button (non-founders only) */}
      {!isFounder && (
        <Pressable style={styles.leaveButton} onPress={handleLeave}>
          <Text style={styles.leaveText}>Leave Crew</Text>
        </Pressable>
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
  container: { flex: 1 },
  header: { alignItems: "center", paddingTop: 16, paddingBottom: 8, gap: 8 },
  crewBadge: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  crewAbbr: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  crewName: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  statsRow: { flexDirection: "row", gap: 24, marginTop: 8 },
  statBox: { alignItems: "center" },
  statValue: { color: "#4ecdc4", fontSize: 18, fontWeight: "bold" },
  statLabel: { color: "#666", fontSize: 11 },
  tabs: { flexDirection: "row", paddingHorizontal: 16, gap: 4, marginTop: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#2a2a4a" },
  tabText: { color: "#666", fontSize: 14, fontWeight: "600" },
  activeTabText: { color: "#4ecdc4" },
  content: { flex: 1 },
  leaveButton: { padding: 16, alignItems: "center" },
  leaveText: { color: "#ff4444", fontSize: 14, fontWeight: "600" },
});
