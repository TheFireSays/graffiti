import { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/auth-store";
import { containsProfanity } from "../../lib/profanity";
import { useProfileStore } from "../../stores/profile-store";
import { useAchievementStore } from "../../stores/achievement-store";
import { StatCards } from "../../components/profile/stat-cards";
import { TagHistory } from "../../components/profile/tag-history";
import { Leaderboards } from "../../components/profile/leaderboards";
import { AvatarPicker } from "../../components/profile/avatar-picker";
import { AchievementsList } from "../../components/profile/achievements-list";

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const tagHistory = useProfileStore((s) => s.tagHistory);
  const tagCount = useProfileStore((s) => s.tagCount);
  const topUsers = useProfileStore((s) => s.topUsers);
  const topCrews = useProfileStore((s) => s.topCrews);
  const isLoadingHistory = useProfileStore((s) => s.isLoadingHistory);
  const isLoadingLeaderboards = useProfileStore((s) => s.isLoadingLeaderboards);
  const loadTagHistory = useProfileStore((s) => s.loadTagHistory);
  const loadLeaderboards = useProfileStore((s) => s.loadLeaderboards);
  const activeSeason = useProfileStore((s) => s.activeSeason);
  const seasonLeaderboard = useProfileStore((s) => s.seasonLeaderboard);
  const loadActiveSeason = useProfileStore((s) => s.loadActiveSeason);
  const loadSeasonLeaderboard = useProfileStore((s) => s.loadSeasonLeaderboard);
  const achievements = useAchievementStore((s) => s.achievements);
  const isLoadingAchievements = useAchievementStore((s) => s.isLoading);
  const loadAchievements = useAchievementStore((s) => s.loadAchievements);

  useEffect(() => {
    if (profile) {
      loadTagHistory(profile.id);
      loadLeaderboards();
      loadActiveSeason();
      loadAchievements(profile.id);
    }
  }, [profile, loadTagHistory, loadLeaderboards, loadActiveSeason, loadAchievements]);

  useEffect(() => {
    if (activeSeason) {
      loadSeasonLeaderboard(activeSeason.id);
    }
  }, [activeSeason, loadSeasonLeaderboard]);

  async function handleSaveDisplayName() {
    const trimmed = displayName.trim();
    if (!trimmed) {
      Alert.alert("Error", "Display name cannot be empty.");
      return;
    }
    if (containsProfanity(trimmed)) {
      Alert.alert("Error", "That name is not allowed.");
      return;
    }
    const { error } = await supabase.rpc("update_profile", {
      p_display_name: trimmed,
    });
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    await fetchProfile();
    setEditing(false);
  }

  if (!profile) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Settings gear */}
      <View style={styles.settingsRow}>
        <Pressable
          style={styles.settingsButton}
          onPress={() => router.push("/settings")}
        >
          <Text style={styles.settingsText}>Settings</Text>
        </Pressable>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <AvatarPicker />
        <Text style={styles.username}>{profile.username}</Text>
        {achievements.length > 0 && (
          <Text style={styles.achievementCount}>
            {achievements.filter((a) => a.unlocked).length}/{achievements.length} Achievements
          </Text>
        )}
        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.editInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name"
              placeholderTextColor="#666"
              maxLength={30}
            />
            <Pressable onPress={handleSaveDisplayName}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
            <Pressable onPress={() => setEditing(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => {
              setDisplayName(profile.display_name ?? "");
              setEditing(true);
            }}
          >
            <Text style={styles.crewLabel}>
              {profile.display_name ?? "Tap to set display name"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Stats */}
      <StatCards
        level={profile.level}
        xp={profile.xp}
        sprayCans={profile.spray_cans}
        tagCount={tagCount}
      />

      {/* Achievements */}
      <View style={styles.section}>
        <AchievementsList achievements={achievements} isLoading={isLoadingAchievements} />
      </View>

      {/* Tag History */}
      <View style={styles.section}>
        <TagHistory tags={tagHistory} isLoading={isLoadingHistory} />
      </View>

      {/* Leaderboards */}
      <View style={styles.section}>
        <Leaderboards
          topUsers={topUsers}
          topCrews={topCrews}
          seasonEntries={seasonLeaderboard}
          activeSeason={activeSeason}
          currentUserId={profile.id}
          isLoading={isLoadingLeaderboards}
        />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#1a1a2e" },
  content: { paddingTop: 60, paddingBottom: 120, gap: 24 },
  loading: { flex: 1, backgroundColor: "#1a1a2e", alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#666", fontSize: 14 },
  settingsRow: { alignItems: "flex-end", paddingHorizontal: 16 },
  settingsButton: { padding: 8 },
  settingsText: { color: "#4ecdc4", fontSize: 14, fontWeight: "600" },
  header: { alignItems: "center", gap: 8 },
  username: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  achievementCount: { color: "#4ecdc4", fontSize: 12, fontWeight: "600" },
  crewLabel: { color: "#999", fontSize: 14 },
  editRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16 },
  editInput: {
    flex: 1,
    backgroundColor: "#2a2a4a",
    color: "#fff",
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#3a3a5a",
  },
  saveText: { color: "#4ecdc4", fontSize: 14, fontWeight: "600" },
  cancelText: { color: "#999", fontSize: 14 },
  section: { marginTop: 8 },
});
