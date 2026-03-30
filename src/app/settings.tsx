import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";
import { containsProfanity } from "../lib/profanity";

export default function SettingsScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const signOut = useAuthStore((s) => s.signOut);

  const [username, setUsername] = useState(profile?.username ?? "");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSave() {
    const trimmedUsername = username.trim();
    const trimmedDisplay = displayName.trim();

    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (trimmedUsername.length > 20) {
      setError("Username must be 20 characters or less.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setError("Username can only contain letters, numbers, and underscores.");
      return;
    }
    if (containsProfanity(trimmedUsername) || containsProfanity(trimmedDisplay)) {
      setError("That name is not allowed.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const { data, error: rpcError } = await supabase.rpc("update_profile", {
      p_username: trimmedUsername,
      p_display_name: trimmedDisplay || trimmedUsername,
    });

    setSaving(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    const result = data as { success: boolean; error?: string };
    if (!result.success) {
      setError(result.error ?? "Failed to update profile");
      return;
    }

    await fetchProfile();
    setSuccess("Profile updated!");
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account, remove you from your crew, and clear all personal data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            const { data, error: rpcError } = await supabase.rpc("delete_account");
            setDeleting(false);

            if (rpcError) {
              Alert.alert("Error", rpcError.message);
              return;
            }

            const result = data as { success: boolean; error?: string };
            if (result.success) {
              await signOut();
            } else {
              Alert.alert("Error", result.error ?? "Failed to delete account");
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      {/* Profile Section */}
      <Text style={styles.sectionTitle}>Profile</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={20}
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        maxLength={30}
        placeholderTextColor="#666"
      />

      <Pressable
        style={[styles.saveButton, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving}
        accessibilityLabel="Save changes"
        accessibilityRole="button"
      >
        {saving ? (
          <ActivityIndicator color="#1a1a2e" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </Pressable>

      {/* Account Section */}
      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Account</Text>

      <Pressable style={styles.actionButton} onPress={signOut} accessibilityLabel="Sign out" accessibilityRole="button">
        <Text style={styles.actionText}>Sign Out</Text>
      </Pressable>

      <Pressable
        style={[styles.dangerButton, deleting && styles.buttonDisabled]}
        onPress={handleDeleteAccount}
        disabled={deleting}
        accessibilityLabel="Delete account"
        accessibilityRole="button"
      >
        {deleting ? (
          <ActivityIndicator color="#ff4444" />
        ) : (
          <Text style={styles.dangerText}>Delete Account</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#1a1a2e" },
  content: { paddingTop: 60, paddingBottom: 60, paddingHorizontal: 24, gap: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: { width: 60 },
  backText: { color: "#4ecdc4", fontSize: 14, fontWeight: "600" },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginTop: 8, marginBottom: 4 },
  sectionTitleSpaced: { marginTop: 32 },
  label: { color: "#999", fontSize: 13, fontWeight: "600", marginTop: 8 },
  input: {
    backgroundColor: "#2a2a4a",
    color: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3a3a5a",
  },
  error: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(255,68,68,0.1)",
    padding: 12,
    borderRadius: 8,
  },
  success: {
    color: "#4ecdc4",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(78,205,196,0.1)",
    padding: 12,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: "#4ecdc4",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#1a1a2e", fontSize: 16, fontWeight: "bold" },
  actionButton: {
    backgroundColor: "#2a2a4a",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  dangerButton: {
    backgroundColor: "rgba(255,68,68,0.1)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.3)",
  },
  dangerText: { color: "#ff4444", fontSize: 14, fontWeight: "600" },
});
