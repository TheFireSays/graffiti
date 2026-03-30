import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useCrewStore } from "../../stores/crew-store";
import type { PendingIncomingInvite, PendingOutgoingRequest } from "../../stores/crew-store";

interface PendingMembershipsProps {
  incomingInvites: PendingIncomingInvite[];
  outgoingRequests: PendingOutgoingRequest[];
  onCrewJoined: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f4c430",
  approved: "#4ecdc4",
  declined: "#ff4444",
};

export function PendingMemberships({
  incomingInvites,
  outgoingRequests,
  onCrewJoined,
}: PendingMembershipsProps) {
  const respondDirectInvite = useCrewStore((s) => s.respondDirectInvite);
  const cancelJoinRequest = useCrewStore((s) => s.cancelJoinRequest);

  // Track per-invite loading state: inviteId -> "accepting" | "declining" | null
  const [inviteLoading, setInviteLoading] = useState<Record<string, "accepting" | "declining">>({});
  // Track cancelled request IDs so rows disappear immediately
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set());
  // Track per-request cancel loading
  const [cancelLoading, setCancelLoading] = useState<Set<string>>(new Set());

  if (incomingInvites.length === 0 && outgoingRequests.length === 0) {
    return null;
  }

  const handleAccept = async (invite: PendingIncomingInvite) => {
    setInviteLoading((prev) => ({ ...prev, [invite.id]: "accepting" }));
    const result = await respondDirectInvite(invite.id, true);
    setInviteLoading((prev) => {
      const next = { ...prev };
      delete next[invite.id];
      return next;
    });
    if (result.success) {
      onCrewJoined();
    }
  };

  const handleDecline = async (invite: PendingIncomingInvite) => {
    setInviteLoading((prev) => ({ ...prev, [invite.id]: "declining" }));
    await respondDirectInvite(invite.id, false);
    setInviteLoading((prev) => {
      const next = { ...prev };
      delete next[invite.id];
      return next;
    });
  };

  const handleCancel = async (request: PendingOutgoingRequest) => {
    setCancelLoading((prev) => new Set(prev).add(request.id));
    const result = await cancelJoinRequest(request.id);
    setCancelLoading((prev) => {
      const next = new Set(prev);
      next.delete(request.id);
      return next;
    });
    if (result.success) {
      setCancelledIds((prev) => new Set(prev).add(request.id));
    }
  };

  const visibleRequests = outgoingRequests.filter((r) => !cancelledIds.has(r.id));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Pending</Text>

      {incomingInvites.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Incoming Invites</Text>
          {incomingInvites.map((invite) => {
            const loading = inviteLoading[invite.id];
            return (
              <View key={invite.id} style={styles.row}>
                <View style={[styles.crewDot, { backgroundColor: invite.crewColor }]} />
                <View style={styles.rowInfo}>
                  <Text style={styles.crewName}>{invite.crewName}</Text>
                  <Text style={styles.meta}>Invited by {invite.invitedByUsername}</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    testID={`accept-invite-${invite.id}`}
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAccept(invite)}
                    disabled={!!loading}
                  >
                    {loading === "accepting" ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.acceptText}>Accept</Text>
                    )}
                  </Pressable>
                  <Pressable
                    testID={`decline-invite-${invite.id}`}
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleDecline(invite)}
                    disabled={!!loading}
                  >
                    {loading === "declining" ? (
                      <ActivityIndicator size="small" color="#ff4444" />
                    ) : (
                      <Text style={styles.declineText}>Decline</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {visibleRequests.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Your Requests</Text>
          {visibleRequests.map((request) => {
            const isCancelling = cancelLoading.has(request.id);
            const statusColor = STATUS_COLORS[request.status] ?? "#888";
            return (
              <View key={request.id} style={styles.row}>
                <View style={[styles.crewDot, { backgroundColor: request.crewColor }]} />
                <View style={styles.rowInfo}>
                  <Text style={styles.crewName}>{request.crewName}</Text>
                  <View style={[styles.statusChip, { borderColor: statusColor }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Text>
                  </View>
                </View>
                {request.status === "pending" && (
                  <Pressable
                    testID={`cancel-request-${request.id}`}
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancel(request)}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <ActivityIndicator size="small" color="#999" />
                    ) : (
                      <Text style={styles.cancelText}>Cancel</Text>
                    )}
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4ecdc4",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  subsection: {
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a4a",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    gap: 10,
  },
  crewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  crewName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  meta: {
    fontSize: 12,
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
  },
  acceptButton: {
    backgroundColor: "#4ecdc4",
  },
  acceptText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  declineButton: {
    backgroundColor: "#3a3a5a",
  },
  declineText: {
    color: "#ff4444",
    fontSize: 13,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#3a3a5a",
  },
  cancelText: {
    color: "#999",
    fontSize: 13,
  },
  statusChip: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
