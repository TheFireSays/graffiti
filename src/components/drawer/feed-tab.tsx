import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { supabase } from "../../lib/supabase";
import { useRealtime } from "../../hooks/use-realtime";

interface FeedEvent {
  id: string;
  eventType: string;
  actorUsername: string;
  crewName: string | null;
  zoneName: string | null;
  createdAt: string;
}

export function FeedTab() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      const { data, error } = await supabase
        .from("activity_feed")
        .select(`
          id,
          event_type,
          created_at,
          actor:users!activity_feed_actor_id_fkey(username),
          crew:crews(name),
          zone:zones(name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setEvents(
          data.map((row: any) => ({
            id: row.id,
            eventType: row.event_type,
            actorUsername: row.actor?.username ?? "Unknown",
            crewName: row.crew?.name ?? null,
            zoneName: row.zone?.name ?? null,
            createdAt: row.created_at,
          }))
        );
      }
      setLoading(false);
    }
    loadFeed();
  }, []);

  // Realtime: prepend new events
  const handleNewEvent = useCallback(async (payload: any) => {
    if (payload.eventType !== "INSERT") return;
    const row = payload.new;

    // Fetch related data for the new event
    const { data } = await supabase
      .from("activity_feed")
      .select(`
        id,
        event_type,
        created_at,
        actor:users!activity_feed_actor_id_fkey(username),
        crew:crews(name),
        zone:zones(name)
      `)
      .eq("id", row.id)
      .single();

    if (data) {
      const newEvent: FeedEvent = {
        id: data.id,
        eventType: data.event_type,
        actorUsername: (data as any).actor?.username ?? "Unknown",
        crewName: (data as any).crew?.name ?? null,
        zoneName: (data as any).zone?.name ?? null,
        createdAt: data.created_at,
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, 50));
    }
  }, []);

  useRealtime({
    table: "activity_feed",
    event: "INSERT",
    onEvent: handleNewEvent,
  });

  if (loading) {
    return <Text style={styles.empty}>Loading feed...</Text>;
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <FeedItem event={item} />}
      ListEmptyComponent={<Text style={styles.empty}>No activity yet</Text>}
      contentContainerStyle={styles.list}
    />
  );
}

function FeedItem({ event }: { event: FeedEvent }) {
  return (
    <View style={styles.item}>
      <Text style={styles.eventIcon}>{getEventIcon(event.eventType)}</Text>
      <View style={styles.itemText}>
        <Text style={styles.eventDescription}>{formatEvent(event)}</Text>
        <Text style={styles.eventTime}>{getTimeAgo(event.createdAt)}</Text>
      </View>
    </View>
  );
}

function getEventIcon(eventType: string): string {
  switch (eventType) {
    case "tag_placed": return "T";
    case "tag_gone_over": return "X";
    case "zone_flipped": return "Z";
    case "crew_joined": return "C";
    case "level_up": return "L";
    default: return "?";
  }
}

function formatEvent(event: FeedEvent): string {
  switch (event.eventType) {
    case "tag_placed":
      return `${event.actorUsername} tagged${event.zoneName ? ` in ${event.zoneName}` : ""}`;
    case "tag_gone_over":
      return `${event.actorUsername} went over a tag${event.zoneName ? ` in ${event.zoneName}` : ""}`;
    case "zone_flipped":
      return `${event.crewName ?? event.actorUsername} flipped ${event.zoneName ?? "a zone"}`;
    case "crew_joined":
      return `${event.actorUsername} joined ${event.crewName ?? "a crew"}`;
    case "level_up":
      return `${event.actorUsername} leveled up`;
    default:
      return `${event.actorUsername} did something`;
  }
}

function getTimeAgo(dateString: string): string {
  const diffMin = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  item: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 10, paddingHorizontal: 16 },
  eventIcon: { color: "#4ecdc4", fontSize: 14, fontWeight: "bold", width: 20, textAlign: "center", marginTop: 2 },
  itemText: { flex: 1 },
  eventDescription: { color: "#fff", fontSize: 14 },
  eventTime: { color: "#666", fontSize: 12, marginTop: 2 },
  empty: { color: "#666", textAlign: "center", paddingVertical: 24, fontSize: 14 },
});
