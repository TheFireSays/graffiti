import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type ChangeEvent = "INSERT" | "UPDATE" | "DELETE";

interface UseRealtimeOptions {
  table: string;
  event?: ChangeEvent | "*";
  schema?: string;
  onEvent: (payload: RealtimePostgresChangesPayload<any>) => void;
  enabled?: boolean;
}

/**
 * Subscribe to Postgres changes on a table via Supabase Realtime.
 * Automatically cleans up on unmount.
 */
export function useRealtime({
  table,
  event = "*",
  schema = "public",
  onEvent,
  enabled = true,
}: UseRealtimeOptions) {
  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes" as any,
        { event, schema, table },
        (payload: RealtimePostgresChangesPayload<any>) => {
          onEvent(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, schema, enabled]); // intentionally exclude onEvent to avoid resubscribing on every render
}
