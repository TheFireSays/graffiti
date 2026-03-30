import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { supabase } from "../../lib/supabase";
import { useRealtime } from "../../hooks/use-realtime";
import { DEMO_MODE } from "../../lib/config";
import { mockActivityFeed } from "../../lib/mock-data";
import { useMapStore } from "../../stores/map-store";

interface FeedEvent {
  id: string;
  eventType: string;
  actorUsername: string;
  crewName: string | null;
  zoneName: string | null;
  zoneId: string | null;
  createdAt: string;
}

export function FeedTab() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      if (DEMO_MODE) {
        setEvents(mockActivityFeed.map((e) => ({
          id: e.id,
          eventType: e.event_type,
          actorUsername: e.actor_username,
          crewName: e.crew_name,
          zoneName: e.zone_name,
          zoneId: e.zone_id ?? null,
          createdAt: e.created_at,
        })));
        setLoading(false);
        return;
      }
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
            zoneId: row.zone_id ?? null,
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
        zoneId: (data as any).zone_id ?? null,
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

  const zones = useMapStore((s) => s.zones);
  const selectZone = useMapStore((s) => s.selectZone);
  const selectedZone = useMapStore((s) => s.selectedZone);

  if (loading) {
    return <Text style={styles.empty}>Loading feed...</Text>;
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FeedItem
          event={item}
          isSelected={!!item.zoneId && selectedZone?.id === item.zoneId}
          onPress={() => {
            if (!item.zoneId) return;
            const zone = zones.find((z) => z.id === item.zoneId);
            if (zone) selectZone(zone);
          }}
        />
      )}
      ListEmptyComponent={<Text style={styles.empty}>No activity yet</Text>}
      contentContainerStyle={styles.list}
    />
  );
}

function FeedItem({
  event,
  isSelected,
  onPress,
}: {
  event: FeedEvent;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.item, isSelected && styles.itemSelected]}
      onPress={onPress}
      disabled={!event.zoneId}
    >
      <Text style={styles.eventIcon}>{getEventIcon(event.eventType)}</Text>
      <View style={styles.itemText}>
        <Text style={styles.eventDescription}>{formatEvent(event)}</Text>
        <Text style={styles.eventTime}>{getTimeAgo(event.createdAt)}</Text>
      </View>
      {event.zoneId && <Text style={styles.tapHint}>›</Text>}
    </Pressable>
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
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 16 },
  itemSelected: { backgroundColor: "rgba(78,205,196,0.12)", borderLeftWidth: 3, borderLeftColor: "#4ecdc4" },
  eventIcon: { color: "#4ecdc4", fontSize: 14, fontWeight: "bold", width: 20, textAlign: "center" },
  itemText: { flex: 1 },
  eventDescription: { color: "#fff", fontSize: 14 },
  eventTime: { color: "#666", fontSize: 12, marginTop: 2 },
  tapHint: { color: "#4ecdc4", fontSize: 18, marginLeft: 4 },
  empty: { color: "#666", textAlign: "center", paddingVertical: 24, fontSize: 14 },
});
