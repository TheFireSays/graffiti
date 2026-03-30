import { useState } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator,
} from "react-native";
import { useCrewStore } from "../../stores/crew-store";

interface JoinRequestFormProps {
  crewId: string;
  crewName: string;
  onSubmitted: () => void;
  onCancel: () => void;
}

const MAX_MESSAGE_LENGTH = 200;

export function JoinRequestForm({ crewId, crewName, onSubmitted, onCancel }: JoinRequestFormProps) {
  const requestJoinCrew = useCrewStore((s) => s.requestJoinCrew);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleMessageChange(text: string) {
    if (text.length <= MAX_MESSAGE_LENGTH) {
      setMessage(text);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const result = await requestJoinCrew(crewId, message.trim() || undefined);
    setLoading(false);

    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        onSubmitted();
      }, 1500);
    } else {
      setError(result.error ?? "Failed to send request");
    }
  }

  if (submitted) {
    return (
      <View style={styles.container}>
        <Text style={styles.successText}>Request sent to {crewName}!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request to Join</Text>
      <Text style={styles.subtitle}>Send a join request to {crewName}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Add a message (optional)"
          placeholderTextColor="#666"
          value={message}
          onChangeText={handleMessageChange}
          multiline
          numberOfLines={4}
          maxLength={MAX_MESSAGE_LENGTH}
          testID="join-request-message"
        />
        <Text style={styles.charCount}>
          {message.length}/{MAX_MESSAGE_LENGTH}
        </Text>
      </View>

      <Pressable
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        testID="join-request-submit"
      >
        {loading ? (
          <ActivityIndicator color="#1a1a2e" />
        ) : (
          <Text style={styles.submitButtonText}>Send Request</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.cancelButton}
        onPress={onCancel}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },
  error: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(255,68,68,0.1)",
    padding: 12,
    borderRadius: 8,
  },
  inputWrapper: {
    gap: 6,
  },
  input: {
    backgroundColor: "#2a2a4a",
    color: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#3a3a5a",
    textAlignVertical: "top",
    minHeight: 96,
  },
  charCount: {
    color: "#666",
    fontSize: 12,
    textAlign: "right",
  },
  submitButton: {
    backgroundColor: "#4ecdc4",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#1a1a2e",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#999",
    fontSize: 15,
    fontWeight: "600",
  },
  successText: {
    color: "#4ecdc4",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 24,
  },
});
