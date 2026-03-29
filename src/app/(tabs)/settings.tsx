import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Switch,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/auth-store";
import { useNotificationStore } from "../../stores/notification-store";

export default function SettingsScreen() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const permissionStatus = useNotificationStore((s) => s.permissionStatus);
  const unregisterToken = useNotificationStore((s) => s.unregisterToken);
  const [deleting, setDeleting] = useState(false);

  const notificationsEnabled = permissionStatus === "granted";

  async function handleDeleteAccount() {
    Alert.alert(
      "Delete Account",
      "This will permanently deactivate your account. Your tags will remain but your profile will be anonymized. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            await unregisterToken();

            const { data, error } = await supabase.rpc("delete_account");

            if (error) {
              setDeleting(false);
              Alert.alert("Error", error.message);
              return;
            }

            const result = data as { success: boolean; error?: string };
            if (!result.success) {
              setDeleting(false);
              Alert.alert("Error", result.error ?? "Could not delete account");
              return;
            }

            await signOut();
          },
        },
      ]
    );
  }

  async function handleSignOut() {
    await unregisterToken();
    await signOut();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            disabled
            trackColor={{ false: "#3a3a5a", true: "#4ecdc4" }}
            thumbColor="#fff"
          />
        </View>
        <Text style={styles.hint}>
          {notificationsEnabled
            ? "Notifications are enabled. Manage in device settings."
            : "Enable notifications in your device settings."}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
        <Pressable
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          disabled={deleting}
        >
          <Text style={styles.deleteText}>
            {deleting ? "Deleting..." : "Delete Account"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e", paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  backButton: { width: 60 },
  backText: { color: "#4ecdc4", fontSize: 14, fontWeight: "600" },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  section: { paddingHorizontal: 16, marginBottom: 32, gap: 12 },
  sectionTitle: {
    color: "#999",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a2a4a",
    borderRadius: 12,
    padding: 16,
  },
  rowLabel: { color: "#fff", fontSize: 16 },
  hint: { color: "#666", fontSize: 12, paddingHorizontal: 4 },
  signOutButton: {
    backgroundColor: "#2a2a4a",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: { color: "#ff4444", fontSize: 14, fontWeight: "600" },
  deleteButton: {
    backgroundColor: "#2a2a4a",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteText: { color: "#ff6b6b", fontSize: 14, fontWeight: "600" },
});
