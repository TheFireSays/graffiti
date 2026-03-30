import { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import ViewShot from "react-native-view-shot";

interface TagShareCardProps {
  tagName: string;
  username: string;
  zoneName?: string | null;
  crewAbbreviation?: string | null;
  crewColor?: string | null;
}

interface ProfileShareCardProps {
  username: string;
  level: number;
  tagCount: number;
  crewName?: string | null;
}

export const TagShareCard = forwardRef<ViewShot, TagShareCardProps>(
  function TagShareCard({ tagName, username, zoneName, crewAbbreviation, crewColor }, ref) {
    return (
      <ViewShot ref={ref} options={{ format: "png", quality: 1.0 }}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {crewAbbreviation && (
              <View style={[styles.crewBadge, { backgroundColor: crewColor ?? "#666" }]}>
                <Text style={styles.crewText}>{crewAbbreviation}</Text>
              </View>
            )}
            <Text style={styles.tagName}>{tagName}</Text>
          </View>
          <Text style={styles.username}>by {username}</Text>
          {zoneName && <Text style={styles.zone}>{zoneName}</Text>}
          <Text style={styles.branding}>Placed with Graffiti</Text>
        </View>
      </ViewShot>
    );
  }
);

export const ProfileShareCard = forwardRef<ViewShot, ProfileShareCardProps>(
  function ProfileShareCard({ username, level, tagCount, crewName }, ref) {
    return (
      <ViewShot ref={ref} options={{ format: "png", quality: 1.0 }}>
        <View style={styles.card}>
          <Text style={styles.profileUsername}>{username}</Text>
          <Text style={styles.profileStat}>Level {level}</Text>
          <Text style={styles.profileStat}>{tagCount} tags placed</Text>
          {crewName && <Text style={styles.profileCrew}>Crew: {crewName}</Text>}
          <Text style={styles.branding}>Graffiti</Text>
        </View>
      </ViewShot>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 24,
    gap: 8,
    borderWidth: 2,
    borderColor: "#4ecdc4",
    width: 320,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  crewBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  crewText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  tagName: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  username: { color: "#999", fontSize: 14 },
  zone: { color: "#4ecdc4", fontSize: 13 },
  branding: { color: "#555", fontSize: 11, marginTop: 8, textAlign: "right" },
  profileUsername: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  profileStat: { color: "#999", fontSize: 16 },
  profileCrew: { color: "#4ecdc4", fontSize: 14 },
});
