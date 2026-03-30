import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useCrewStore } from "../../stores/crew-store";

export function DirectInviteForm() {
  const [username, setUsername] = useState("");
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendDirectInvite = useCrewStore((s) => s.sendDirectInvite);

  const isDisabled = sending || username.trim().length === 0;

  const handleSend = async () => {
    const trimmed = username.trim();
    if (!trimmed) return;

    setSending(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const result = await sendDirectInvite(trimmed);

    setSending(false);

    if (result.success) {
      setSuccessMessage(`Invite sent to ${trimmed}`);
      setUsername("");
    } else {
      setErrorMessage(result.error ?? "Failed to send invite.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>INVITE BY USERNAME</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
          placeholder="@username"
          placeholderTextColor="#555"
          autoCapitalize="none"
          autoCorrect={false}
          testID="direct-invite-input"
        />
        <Pressable
          style={[styles.sendButton, isDisabled && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isDisabled}
          testID="direct-invite-send"
        >
          {sending ? (
            <ActivityIndicator size="small" color="#1a1a2e" />
          ) : (
            <Text style={[styles.sendButtonText, isDisabled && styles.sendButtonTextDisabled]}>
              Send
            </Text>
          )}
        </Pressable>
      </View>
      {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: "#888",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#2a2a4a",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: "#4ecdc4",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#1a1a2e",
    fontWeight: "600",
    fontSize: 15,
  },
  sendButtonTextDisabled: {
    color: "#1a1a2e",
  },
  successText: {
    color: "#4ecdc4",
    fontSize: 13,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 13,
  },
});
