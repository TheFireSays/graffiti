import { useEffect, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useAuthStore } from "../../stores/auth-store";
import { useCrewStore } from "../../stores/crew-store";
import { NoCrewView } from "../../components/crew/no-crew-view";
import { CrewDashboard } from "../../components/crew/crew-dashboard";

export default function CrewScreen() {
  const profile = useAuthStore((s) => s.profile);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  const crew = useCrewStore((s) => s.crew);
  const members = useCrewStore((s) => s.members);
  const invites = useCrewStore((s) => s.invites);
  const joinRequests = useCrewStore((s) => s.joinRequests);
  const directInvites = useCrewStore((s) => s.directInvites);
  const isLoading = useCrewStore((s) => s.isLoading);
  const loadCrew = useCrewStore((s) => s.loadCrew);
  const loadMembers = useCrewStore((s) => s.loadMembers);
  const loadInvites = useCrewStore((s) => s.loadInvites);
  const loadJoinRequests = useCrewStore((s) => s.loadJoinRequests);
  const loadDirectInvites = useCrewStore((s) => s.loadDirectInvites);
  const clearCrew = useCrewStore((s) => s.clearCrew);

  useEffect(() => {
    if (profile?.crew_id) {
      loadCrew(profile.crew_id);
      loadMembers(profile.crew_id);
      loadInvites(profile.crew_id);
      loadJoinRequests(profile.crew_id);
      loadDirectInvites(profile.crew_id);
    } else {
      clearCrew();
    }
  }, [profile?.crew_id, loadCrew, loadMembers, loadInvites, loadJoinRequests, loadDirectInvites, clearCrew]);

  const userRole = members.find((m) => m.userId === profile?.id)?.role ?? null;

  const handleCrewChanged = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!profile) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4ecdc4" />
      </View>
    );
  }

  if (isLoading && profile.crew_id) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4ecdc4" />
      </View>
    );
  }

  if (!profile.crew_id || !crew) {
    return (
      <View style={styles.container}>
        <NoCrewView onCrewChanged={handleCrewChanged} userId={profile.id} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CrewDashboard
        crew={crew}
        members={members}
        invites={invites}
        joinRequests={joinRequests}
        directInvites={directInvites}
        userId={profile.id}
        userRole={userRole ?? "member"}
        isOgEligible={userRole === "og" || userRole === "core"}
        onLeft={handleCrewChanged}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    paddingTop: 60,
  },
  loading: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
});
