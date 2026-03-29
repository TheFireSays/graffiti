import { useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useAuthStore } from "../../stores/auth-store";
import { useProfileStore } from "../../stores/profile-store";
import { StatCards } from "../../components/profile/stat-cards";
import { TagHistory } from "../../components/profile/tag-history";
import { Leaderboards } from "../../components/profile/leaderboards";
import { AvatarPicker } from "../../components/profile/avatar-picker";

export default function ProfileScreen() {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  const tagHistory = useProfileStore((s) => s.tagHistory);
  const tagCount = useProfileStore((s) => s.tagCount);
  const topUsers = useProfileStore((s) => s.topUsers);
  const topCrews = useProfileStore((s) => s.topCrews);
  const isLoadingHistory = useProfileStore((s) => s.isLoadingHistory);
  const isLoadingLeaderboards = useProfileStore((s) => s.isLoadingLeaderboards);
  const loadTagHistory = useProfileStore((s) => s.loadTagHistory);
  const loadLeaderboards = useProfileStore((s) => s.loadLeaderboards);

  useEffect(() => {
    if (profile) {
      loadTagHistory(profile.id);
      loadLeaderboards();
    }
  }, [profile, loadTagHistory, loadLeaderboards]);

  if (!profile) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <AvatarPicker />
        <Text style={styles.username}>{profile.username}</Text>
        {profile.crew_id && (
          <Text style={styles.crewLabel}>
            {profile.display_name}
          </Text>
        )}
      </View>

      {/* Stats */}
      <StatCards
        level={profile.level}
        xp={profile.xp}
        sprayCans={profile.spray_cans}
        tagCount={tagCount}
      />

      {/* Tag History */}
      <View style={styles.section}>
        <TagHistory tags={tagHistory} isLoading={isLoadingHistory} />
      </View>

      {/* Leaderboards */}
      <View style={styles.section}>
        <Leaderboards
          topUsers={topUsers}
          topCrews={topCrews}
          currentUserId={profile.id}
          isLoading={isLoadingLeaderboards}
        />
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <Pressable style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#1a1a2e" },
  content: { paddingTop: 60, paddingBottom: 120, gap: 24 },
  loading: { flex: 1, backgroundColor: "#1a1a2e", alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#666", fontSize: 14 },
  header: { alignItems: "center", gap: 8 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#4ecdc4", alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#1a1a2e", fontSize: 28, fontWeight: "bold" },
  username: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  crewLabel: { color: "#999", fontSize: 14 },
  section: { marginTop: 8 },
  signOutButton: {
    marginHorizontal: 16, backgroundColor: "#2a2a4a", borderRadius: 12,
    paddingVertical: 14, alignItems: "center",
  },
  signOutText: { color: "#ff4444", fontSize: 14, fontWeight: "600" },
});
