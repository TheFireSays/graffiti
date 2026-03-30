import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { DEMO_MODE } from "../lib/config";
import { mockCrew, mockCrewMembers } from "../lib/mock-data";

interface CrewMember {
  userId: string;
  username: string;
  displayName: string;
  role: string;
  level: number;
  xp: number;
  joinedAt: string;
}

interface CrewInvite {
  id: string;
  code: string;
  createdByUsername: string;
  maxUses: number;
  useCount: number;
  expiresAt: string | null;
  createdAt: string;
}

interface CrewInfo {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
  founderId: string;
  memberCount: number;
  totalXp: number;
  zonesControlled: number;
  createdAt: string;
  lastTaggedAt: string | null;
}

interface JoinRequest {
  id: string;
  userId: string;
  username: string;
  message: string | null;
  status: string;
  createdAt: string;
}

interface DirectInvite {
  id: string;
  crewId: string;
  targetUsername: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface PendingIncomingInvite {
  id: string;
  crewId: string;
  crewName: string;
  crewAbbreviation: string;
  crewColor: string;
  invitedByUsername: string;
  expiresAt: string;
  createdAt: string;
}

interface PendingOutgoingRequest {
  id: string;
  crewId: string;
  crewName: string;
  crewAbbreviation: string;
  crewColor: string;
  message: string | null;
  status: string;
  createdAt: string;
}

interface CrewState {
  crew: CrewInfo | null;
  members: CrewMember[];
  invites: CrewInvite[];
  joinRequests: JoinRequest[];
  directInvites: DirectInvite[];
  pendingIncomingInvites: PendingIncomingInvite[];
  pendingOutgoingRequests: PendingOutgoingRequest[];
  userRole: string | null;
  isLoading: boolean;
  error: string | null;

  loadCrew: (crewId: string) => Promise<void>;
  loadMembers: (crewId: string) => Promise<void>;
  loadInvites: (crewId: string) => Promise<void>;
  createCrew: (name: string, abbreviation: string, color: string) => Promise<{ success: boolean; error?: string }>;
  joinCrew: (inviteCode: string) => Promise<{ success: boolean; error?: string }>;
  createInvite: (crewId: string, userId: string, maxUses: number) => Promise<{ success: boolean; code?: string; error?: string }>;
  leaveCrew: () => Promise<{ success: boolean; error?: string }>;
  clearCrew: () => void;
  requestJoinCrew: (crewId: string, message?: string) => Promise<{ success: boolean; error?: string }>;
  cancelJoinRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  reviewJoinRequest: (requestId: string, approved: boolean) => Promise<{ success: boolean; error?: string }>;
  sendDirectInvite: (targetUsername: string) => Promise<{ success: boolean; error?: string }>;
  respondDirectInvite: (inviteId: string, accepted: boolean) => Promise<{ success: boolean; error?: string }>;
  loadJoinRequests: (crewId: string) => Promise<void>;
  loadDirectInvites: (crewId: string) => Promise<void>;
  loadPendingMemberships: (userId: string) => Promise<void>;
}

export type { CrewInfo, CrewMember, CrewInvite, JoinRequest, DirectInvite, PendingIncomingInvite, PendingOutgoingRequest };

export const useCrewStore = create<CrewState>((set, get) => ({
  crew: null,
  members: [],
  invites: [],
  joinRequests: [],
  directInvites: [],
  pendingIncomingInvites: [],
  pendingOutgoingRequests: [],
  userRole: null,
  isLoading: false,
  error: null,

  loadCrew: async (crewId) => {
    if (DEMO_MODE) {
      set({
        crew: {
          id: mockCrew.id,
          name: mockCrew.name,
          abbreviation: mockCrew.abbreviation,
          color: mockCrew.color,
          founderId: mockCrew.founder_id,
          memberCount: mockCrew.member_count,
          totalXp: 8800,
          zonesControlled: 2,
          createdAt: mockCrew.created_at,
          lastTaggedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        userRole: "og",
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from("crews")
      .select("*")
      .eq("id", crewId)
      .single();

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    set({
      crew: {
        id: data.id,
        name: data.name,
        abbreviation: data.abbreviation,
        color: data.color,
        founderId: data.founder_id,
        memberCount: data.member_count,
        totalXp: Number(data.total_xp),
        zonesControlled: data.zones_controlled,
        createdAt: data.created_at,
        lastTaggedAt: data.last_tagged_at ?? null,
      },
      isLoading: false,
    });
  },

  loadMembers: async (crewId) => {
    if (DEMO_MODE) {
      set({
        members: mockCrewMembers.map((m) => ({
          userId: m.userId,
          username: m.username,
          displayName: m.username,
          role: m.role,
          level: m.level ?? 1,
          xp: 0,
          joinedAt: "2026-03-01T00:00:00Z",
        })),
      });
      return;
    }

    const { data, error } = await supabase
      .from("crew_members")
      .select(`
        user_id,
        role,
        joined_at,
        user:users!crew_members_user_id_fkey(username, display_name, level, xp)
      `)
      .eq("crew_id", crewId)
      .order("role");

    if (!error && data) {
      set({
        members: data.map((row: any) => ({
          userId: row.user_id,
          username: row.user?.username ?? "Unknown",
          displayName: row.user?.display_name ?? "",
          role: row.role,
          level: row.user?.level ?? 1,
          xp: row.user?.xp ?? 0,
          joinedAt: row.joined_at,
        })),
      });
    }
  },

  loadInvites: async (crewId) => {
    if (DEMO_MODE) {
      set({
        invites: [{
          id: "inv1",
          code: "DEMO-JOIN",
          createdByUsername: "KRUSH",
          maxUses: 10,
          useCount: 3,
          expiresAt: null,
          createdAt: "2026-03-15T00:00:00Z",
        }],
      });
      return;
    }
    const { data, error } = await supabase
      .from("invites")
      .select(`
        id,
        code,
        max_uses,
        use_count,
        expires_at,
        created_at,
        creator:users!invites_created_by_fkey(username)
      `)
      .eq("crew_id", crewId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      set({
        invites: data.map((row: any) => ({
          id: row.id,
          code: row.code,
          createdByUsername: row.creator?.username ?? "Unknown",
          maxUses: row.max_uses,
          useCount: row.use_count,
          expiresAt: row.expires_at,
          createdAt: row.created_at,
        })),
      });
    }
  },

  createCrew: async (name, abbreviation, color) => {
    const { data, error } = await supabase.rpc("create_crew", {
      p_name: name,
      p_abbreviation: abbreviation,
      p_color: color,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const result = data as any;
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  },

  joinCrew: async (inviteCode) => {
    const { data, error } = await supabase.rpc("join_crew", {
      p_invite_code: inviteCode,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const result = data as any;
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  },

  createInvite: async (crewId, userId, maxUses) => {
    const { data, error } = await supabase
      .from("invites")
      .insert({
        crew_id: crewId,
        created_by: userId,
        max_uses: maxUses,
      })
      .select("code")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, code: data.code };
  },

  leaveCrew: async () => {
    const { data, error } = await supabase.rpc("leave_crew");

    if (error) {
      return { success: false, error: error.message };
    }

    const result = data as any;
    if (!result.success) {
      return { success: false, error: result.error };
    }

    set({ crew: null, members: [], invites: [], userRole: null });
    return { success: true };
  },

  clearCrew: () => {
    set({
      crew: null,
      members: [],
      invites: [],
      joinRequests: [],
      directInvites: [],
      pendingIncomingInvites: [],
      pendingOutgoingRequests: [],
      userRole: null,
      error: null,
    });
  },

  requestJoinCrew: async (crewId, message) => {
    const { data, error } = await supabase.rpc("request_join_crew", {
      p_crew_id: crewId,
      p_message: message ?? undefined,
    });
    if (error) return { success: false, error: error.message };
    const result = data as any;
    if (!result.success) return { success: false, error: result.error };
    return { success: true };
  },

  cancelJoinRequest: async (requestId) => {
    const { data, error } = await supabase.rpc("cancel_join_request", {
      p_request_id: requestId,
    });
    if (error) return { success: false, error: error.message };
    const result = data as any;
    if (!result.success) return { success: false, error: result.error };
    return { success: true };
  },

  reviewJoinRequest: async (requestId, approved) => {
    const { data, error } = await supabase.rpc("review_join_request", {
      p_request_id: requestId,
      p_approved: approved,
    });
    if (error) return { success: false, error: error.message };
    const result = data as any;
    if (!result.success) return { success: false, error: result.error };
    return { success: true };
  },

  sendDirectInvite: async (targetUsername) => {
    const { data, error } = await supabase.rpc("send_direct_invite", {
      p_target_username: targetUsername,
    });
    if (error) return { success: false, error: error.message };
    const result = data as any;
    if (!result.success) return { success: false, error: result.error };
    return { success: true };
  },

  respondDirectInvite: async (inviteId, accepted) => {
    const { data, error } = await supabase.rpc("respond_direct_invite", {
      p_invite_id: inviteId,
      p_accepted: accepted,
    });
    if (error) return { success: false, error: error.message };
    const result = data as any;
    if (!result.success) return { success: false, error: result.error };
    return { success: true };
  },

  loadJoinRequests: async (crewId) => {
    const { data, error } = await supabase
      .from("crew_join_requests")
      .select(
        `id, user_id, message, status, created_at, user:users!crew_join_requests_user_id_fkey(username)`
      )
      .eq("crew_id", crewId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error && data) {
      set({
        joinRequests: data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          username: row.user?.username ?? "Unknown",
          message: row.message,
          status: row.status,
          createdAt: row.created_at,
        })),
      });
    }
  },

  loadDirectInvites: async (crewId) => {
    const { data, error } = await supabase
      .from("crew_direct_invites")
      .select(
        `id, crew_id, target_user_id, status, expires_at, created_at, target:users!crew_direct_invites_target_user_id_fkey(username)`
      )
      .eq("crew_id", crewId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      set({
        directInvites: data.map((row: any) => ({
          id: row.id,
          crewId: row.crew_id,
          targetUsername: row.target?.username ?? "Unknown",
          status: row.status,
          expiresAt: row.expires_at,
          createdAt: row.created_at,
        })),
      });
    }
  },

  loadPendingMemberships: async (userId) => {
    // Incoming direct invites
    const { data: inviteData, error: inviteError } = await supabase
      .from("crew_direct_invites")
      .select(
        `id, crew_id, expires_at, created_at, crew:crews!crew_direct_invites_crew_id_fkey(name, abbreviation, color), inviter:users!crew_direct_invites_invited_by_fkey(username)`
      )
      .eq("target_user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    // Outgoing join requests
    const { data: requestData, error: requestError } = await supabase
      .from("crew_join_requests")
      .select(
        `id, crew_id, message, status, created_at, crew:crews!crew_join_requests_crew_id_fkey(name, abbreviation, color)`
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const pendingIncomingInvites =
      !inviteError && inviteData
        ? inviteData.map((row: any) => ({
            id: row.id,
            crewId: row.crew_id,
            crewName: row.crew?.name ?? "Unknown",
            crewAbbreviation: row.crew?.abbreviation ?? "",
            crewColor: row.crew?.color ?? "#888888",
            invitedByUsername: row.inviter?.username ?? "Unknown",
            expiresAt: row.expires_at,
            createdAt: row.created_at,
          }))
        : [];

    const pendingOutgoingRequests =
      !requestError && requestData
        ? requestData.map((row: any) => ({
            id: row.id,
            crewId: row.crew_id,
            crewName: row.crew?.name ?? "Unknown",
            crewAbbreviation: row.crew?.abbreviation ?? "",
            crewColor: row.crew?.color ?? "#888888",
            message: row.message,
            status: row.status,
            createdAt: row.created_at,
          }))
        : [];

    set({ pendingIncomingInvites, pendingOutgoingRequests });
  },
}));
