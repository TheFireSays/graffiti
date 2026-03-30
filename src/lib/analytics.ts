import { supabase } from "./supabase";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

interface AnalyticsEvent {
  event_name: string;
  event_data: Record<string, Json | undefined>;
  session_id: string | null;
  created_at: string;
}

let eventQueue: AnalyticsEvent[] = [];
let sessionId: string | null = null;
let flushTimer: ReturnType<typeof setInterval> | null = null;

const FLUSH_INTERVAL_MS = 30_000;
const MAX_BATCH_SIZE = 50;

export function startSession(): string {
  sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (!flushTimer) {
    flushTimer = setInterval(flushEvents, FLUSH_INTERVAL_MS);
  }
  return sessionId;
}

export function stopSession(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  flushEvents();
  sessionId = null;
}

export function trackEvent(
  name: string,
  data: Record<string, Json | undefined> = {}
): void {
  eventQueue.push({
    event_name: name,
    event_data: data,
    session_id: sessionId,
    created_at: new Date().toISOString(),
  });
}

export async function flushEvents(): Promise<number> {
  if (eventQueue.length === 0) return 0;

  const batch = eventQueue.splice(0, MAX_BATCH_SIZE);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Put events back if not authenticated
    eventQueue.unshift(...batch);
    return 0;
  }

  const rows = batch.map((e) => ({
    user_id: user.id,
    event_name: e.event_name,
    event_data: e.event_data,
    session_id: e.session_id,
    created_at: e.created_at,
  }));

  const { error } = await supabase.from("analytics_events").insert(rows);

  if (error) {
    // Put events back on failure
    eventQueue.unshift(...batch);
    return 0;
  }

  return batch.length;
}

export function getQueueLength(): number {
  return eventQueue.length;
}

export function getSessionId(): string | null {
  return sessionId;
}

// For testing
export function _resetForTesting(): void {
  eventQueue = [];
  sessionId = null;
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}
