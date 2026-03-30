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
}

interface CrewState {
  crew: CrewInfo | null;
  members: CrewMember[];
  invites: CrewInvite[];
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
}

export type { CrewInfo, CrewMember, CrewInvite };

export const useCrewStore = create<CrewState>((set, get) => ({
  crew: null,
  members: [],
  invites: [],
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
    set({ crew: null, members: [], invites: [], userRole: null, error: null });
  },
}));
