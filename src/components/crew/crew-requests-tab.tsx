import { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useCrewStore } from "../../stores/crew-store";
import type { JoinRequest } from "../../stores/crew-store";

interface CrewRequestsTabProps {
  crewId: string;
}

export function CrewRequestsTab({ crewId }: CrewRequestsTabProps) {
  const joinRequests = useCrewStore((s) => s.joinRequests);
  const reviewJoinRequest = useCrewStore((s) => s.reviewJoinRequest);
  const loadJoinRequests = useCrewStore((s) => s.loadJoinRequests);

  const [reviewingId, setReviewingId] = useState<string | null>(null);

  async function handleReview(id: string, approved: boolean) {
    setReviewingId(id);
    await reviewJoinRequest(id, approved);
    await loadJoinRequests(crewId);
    setReviewingId(null);
  }

  return (
    <FlatList
      data={joinRequests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <RequestRow
          request={item}
          isReviewing={reviewingId === item.id}
          onApprove={() => handleReview(item.id, true)}
          onDecline={() => handleReview(item.id, false)}
        />
      )}
      ListEmptyComponent={<Text style={styles.empty}>No pending requests</Text>}
      contentContainerStyle={styles.list}
    />
  );
}

interface RequestRowProps {
  request: JoinRequest;
  isReviewing: boolean;
  onApprove: () => void;
  onDecline: () => void;
}

function RequestRow({ request, isReviewing, onApprove, onDecline }: RequestRowProps) {
  const formattedDate = new Date(request.createdAt).toLocaleDateString();

  return (
    <View style={styles.row}>
      <View style={styles.rowInfo}>
        <Text style={styles.username}>{request.username}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
        {request.message ? (
          <Text style={styles.message}>"{request.message}"</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {isReviewing ? (
          <ActivityIndicator color="#4ecdc4" style={styles.spinner} />
        ) : (
          <>
            <Pressable
              testID={`approve-request-${request.id}`}
              style={[styles.button, styles.approveButton]}
              onPress={onApprove}
            >
              <Text style={styles.approveText}>Approve</Text>
            </Pressable>
            <Pressable
              testID={`decline-request-${request.id}`}
              style={[styles.button, styles.declineButton]}
              onPress={onDecline}
            >
              <Text style={styles.declineText}>Decline</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
  empty: {
    color: "#666",
    textAlign: "center",
    paddingVertical: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowInfo: {
    flex: 1,
    gap: 4,
  },
  username: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  date: {
    color: "#666",
    fontSize: 12,
  },
  message: {
    color: "#aaa",
    fontSize: 12,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  spinner: {
    paddingHorizontal: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#4ecdc4",
  },
  approveText: {
    color: "#1a1a2e",
    fontSize: 13,
    fontWeight: "700",
  },
  declineButton: {
    backgroundColor: "#3a3a5a",
  },
  declineText: {
    color: "#ff4444",
    fontSize: 13,
    fontWeight: "600",
  },
});
