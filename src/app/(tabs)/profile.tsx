import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuthStore } from "../../stores/auth-store";

export default function ProfileScreen() {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {profile ? (
        <>
          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.stat}>Level {profile.level} · {profile.xp} XP</Text>
          <Text style={styles.stat}>{profile.spray_cans} spray cans</Text>
        </>
      ) : (
        <Text style={styles.subtitle}>Loading profile...</Text>
      )}

      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  title: {
    color: "#4ecdc4",
    fontSize: 24,
    fontWeight: "bold",
  },
  username: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  stat: {
    color: "#999",
    fontSize: 14,
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
  },
  signOutButton: {
    marginTop: 24,
    backgroundColor: "#3a3a5a",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  signOutText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "600",
  },
});
