import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { DEMO_MODE } from "../lib/config";
import { useCrewStore } from "../stores/crew-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Subscribe to realtime changes on crew membership tables (join requests,
 * direct invites, crew members) and refresh the corresponding store slices.
 *
 * For crew-dashboard context: pass crewId to watch crew-scoped changes.
 * For crewless users: pass userId to watch user-scoped invite/request changes.
 */
export function useCrewRealtime(crewId: string | null) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (DEMO_MODE || !crewId) return;

    const { loadJoinRequests, loadDirectInvites, loadMembers } =
      useCrewStore.getState();

    const channel = supabase
      .channel(`crew-membership-${crewId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "crew_join_requests",
          filter: `crew_id=eq.${crewId}`,
        },
        () => {
          loadJoinRequests(crewId);
        }
      )
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "crew_direct_invites",
          filter: `crew_id=eq.${crewId}`,
        },
        () => {
          loadDirectInvites(crewId);
        }
      )
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "crew_members",
          filter: `crew_id=eq.${crewId}`,
        },
        () => {
          loadMembers(crewId);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [crewId]);
}

/**
 * Subscribe to realtime changes relevant to a crewless user — their incoming
 * invites and outgoing join requests. Refreshes pendingMemberships in the store.
 */
export function useUserMembershipRealtime(userId: string | null) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (DEMO_MODE || !userId) return;

    const { loadPendingMemberships } = useCrewStore.getState();

    const channel = supabase
      .channel(`user-membership-${userId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "crew_direct_invites",
          filter: `target_user_id=eq.${userId}`,
        },
        () => {
          loadPendingMemberships(userId);
        }
      )
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "crew_join_requests",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadPendingMemberships(userId);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId]);
}
