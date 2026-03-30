import { useState } from "react";
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, Share, Platform, Modal, ScrollView,
} from "react-native";
import { useCrewStore } from "../../stores/crew-store";
import type { CrewInvite, DirectInvite } from "../../stores/crew-store";
import { DirectInviteForm } from "./direct-invite-form";

// QR code only renders on native — web gets a text fallback
let QRCode: React.ComponentType<{ value: string; size: number; color: string; backgroundColor: string }> | null = null;
if (Platform.OS !== "web") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  QRCode = require("react-native-qrcode-svg").default;
}

const APP_BASE_URL = "https://graffiti.app";

interface CrewInvitesProps {
  invites: CrewInvite[];
  crewId: string;
  userId: string;
  canCreateInvites: boolean;
  isOgEligible: boolean;
  directInvites: DirectInvite[];
}

export function CrewInvites({ invites, crewId, userId, canCreateInvites, isOgEligible, directInvites }: CrewInvitesProps) {
  const createInvite = useCrewStore((s) => s.createInvite);
  const loadInvites = useCrewStore((s) => s.loadInvites);
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = newCode ? `${APP_BASE_URL}/join/${newCode}` : null;

  async function handleCreate() {
    setCreating(true);
    const result = await createInvite(crewId, userId, 5);
    setCreating(false);
    if (result.success && result.code) {
      setNewCode(result.code);
      loadInvites(crewId);
    }
  }

  async function handleShareLink() {
    if (!inviteLink) return;
    if (Platform.OS === "web") {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      await Share.share({ message: `Join my crew on Graffiti: ${inviteLink}`, url: inviteLink });
    }
  }

  return (
    <View style={styles.container}>
      {canCreateInvites && (
        <Pressable
          style={[styles.createButton, creating && styles.disabled]}
          onPress={handleCreate}
          disabled={creating}
        >
          {creating ? <ActivityIndicator color="#1a1a2e" /> : <Text style={styles.createButtonText}>Generate Invite Code</Text>}
        </Pressable>
      )}

      {newCode && inviteLink && (
        <View style={styles.codeBanner}>
          <Text style={styles.codeLabel}>Invite code</Text>
          <Text style={styles.codeValue}>{newCode}</Text>

          <Text style={styles.linkLabel}>Shareable link</Text>
          <Text style={styles.linkValue} numberOfLines={1}>{inviteLink}</Text>

          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={handleShareLink}>
              <Text style={styles.actionText}>
                {Platform.OS === "web" ? (copied ? "Copied!" : "Copy Link") : "Share Link"}
              </Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => setQrVisible(true)}>
              <Text style={styles.actionText}>Show QR</Text>
            </Pressable>
          </View>
        </View>
      )}

      <FlatList
        data={invites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <InviteRow invite={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No invites yet</Text>}
        contentContainerStyle={styles.list}
      />

      {isOgEligible && <DirectInviteForm />}

      {directInvites.length > 0 && (
        <View style={styles.directInvitesList}>
          <Text style={styles.directInvitesTitle}>Direct Invites</Text>
          {directInvites.map((di) => (
            <View key={di.id} style={styles.directInviteRow}>
              <Text style={styles.directInviteUser}>{di.targetUsername}</Text>
              <Text style={[
                styles.directInviteStatus,
                { color: di.status === "pending" ? "#f4c430" : di.status === "accepted" ? "#4ecdc4" : "#ff4444" },
              ]}>
                {di.status.charAt(0).toUpperCase() + di.status.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* QR Modal */}
      <Modal visible={qrVisible} transparent animationType="fade" onRequestClose={() => setQrVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setQrVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Scan to Join</Text>
            <Text style={styles.modalCode}>{newCode}</Text>

            <View style={styles.qrContainer}>
              {QRCode && inviteLink ? (
                <QRCode
                  value={inviteLink}
                  size={200}
                  color="#1a1a2e"
                  backgroundColor="#ffffff"
                />
              ) : (
                // Web fallback — display the link clearly
                <View style={styles.qrWebFallback}>
                  <Text style={styles.qrWebText}>{inviteLink}</Text>
                </View>
              )}
            </View>

            <Text style={styles.modalHint}>Share this link or have your crew member scan the QR code</Text>
            <Pressable style={styles.closeButton} onPress={() => setQrVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function InviteRow({ invite }: { invite: CrewInvite }) {
  const link = `${APP_BASE_URL}/join/${invite.code}`;
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (Platform.OS === "web") {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <View style={styles.inviteItem}>
      <View style={styles.inviteLeft}>
        <Text style={styles.inviteCode}>{invite.code}</Text>
        <Text style={styles.inviteMeta}>{invite.useCount}/{invite.maxUses} used · by {invite.createdByUsername}</Text>
      </View>
      {Platform.OS === "web" && (
        <Pressable onPress={handleCopy} style={styles.copyButton}>
          <Text style={styles.copyText}>{copied ? "Copied!" : "Copy"}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  createButton: { backgroundColor: "#4ecdc4", borderRadius: 12, padding: 14, alignItems: "center", marginHorizontal: 16, marginVertical: 8 },
  disabled: { opacity: 0.6 },
  createButtonText: { color: "#1a1a2e", fontSize: 14, fontWeight: "bold" },

  codeBanner: { backgroundColor: "#2a2a4a", borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 8, gap: 4 },
  codeLabel: { color: "#999", fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  codeValue: { color: "#4ecdc4", fontSize: 22, fontWeight: "bold", letterSpacing: 3, marginBottom: 8 },
  linkLabel: { color: "#999", fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  linkValue: { color: "#888", fontSize: 12, marginBottom: 12 },
  actions: { flexDirection: "row", gap: 8 },
  actionButton: { flex: 1, backgroundColor: "#3a3a5a", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  actionText: { color: "#4ecdc4", fontSize: 13, fontWeight: "600" },

  list: { paddingVertical: 8 },
  inviteItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, gap: 4 },
  inviteLeft: { flex: 1, gap: 4 },
  inviteCode: { color: "#fff", fontSize: 16, fontWeight: "bold", fontVariant: ["tabular-nums"] },
  inviteMeta: { color: "#666", fontSize: 12 },
  copyButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#2a2a4a", borderRadius: 6 },
  copyText: { color: "#4ecdc4", fontSize: 12, fontWeight: "600" },
  empty: { color: "#666", textAlign: "center", paddingVertical: 24 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  modalCard: { backgroundColor: "#1a1a2e", borderRadius: 20, padding: 28, alignItems: "center", gap: 12, width: 300, borderWidth: 1, borderColor: "#333" },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  modalCode: { color: "#4ecdc4", fontSize: 24, fontWeight: "bold", letterSpacing: 4 },
  qrContainer: { padding: 16, backgroundColor: "#ffffff", borderRadius: 12 },
  qrWebFallback: { width: 200, padding: 16, alignItems: "center", justifyContent: "center" },
  qrWebText: { color: "#1a1a2e", fontSize: 12, textAlign: "center", fontWeight: "600" },
  modalHint: { color: "#666", fontSize: 12, textAlign: "center", paddingHorizontal: 8 },
  closeButton: { backgroundColor: "#2a2a4a", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 32, marginTop: 4 },
  closeButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  directInvitesList: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  directInvitesTitle: { color: "#888", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  directInviteRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  directInviteUser: { color: "#fff", fontSize: 14, fontWeight: "600" },
  directInviteStatus: { fontSize: 12, fontWeight: "bold" },
});
