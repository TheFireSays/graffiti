import { create } from "zustand";
import { supabase } from "../lib/supabase";

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
  createCrew: (name: string, abbreviation: string, color: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  joinCrew: (inviteCode: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  createInvite: (crewId: string, userId: string, maxUses: number) => Promise<{ success: boolean; code?: string; error?: string }>;
  leaveCrew: (crewId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
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

  createCrew: async (name, abbreviation, color, userId) => {
    // 1. Create the crew
    const { data: crew, error: crewError } = await supabase
      .from("crews")
      .insert({
        name,
        abbreviation: abbreviation.toUpperCase(),
        color,
        founder_id: userId,
      })
      .select("id")
      .single();

    if (crewError) {
      return { success: false, error: crewError.message };
    }

    // 2. Add founder as OG member
    const { error: memberError } = await supabase
      .from("crew_members")
      .insert({
        crew_id: crew.id,
        user_id: userId,
        role: "og",
      });

    if (memberError) {
      return { success: false, error: memberError.message };
    }

    // 3. Update user's crew_id
    const { error: userError } = await supabase
      .from("users")
      .update({ crew_id: crew.id })
      .eq("id", userId);

    if (userError) {
      return { success: false, error: userError.message };
    }

    return { success: true };
  },

  joinCrew: async (inviteCode, userId) => {
    // 1. Find the invite
    const { data: invite, error: findError } = await supabase
      .from("invites")
      .select("id, crew_id, max_uses, use_count, expires_at")
      .eq("code", inviteCode.trim())
      .single();

    if (findError || !invite) {
      return { success: false, error: "Invalid invite code" };
    }

    // 2. Validate invite
    if (invite.use_count >= invite.max_uses) {
      return { success: false, error: "This invite has been fully used" };
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return { success: false, error: "This invite has expired" };
    }

    // 3. Add user as member
    const { error: memberError } = await supabase
      .from("crew_members")
      .insert({
        crew_id: invite.crew_id,
        user_id: userId,
        role: "member",
      });

    if (memberError) {
      if (memberError.code === "23505") {
        return { success: false, error: "You are already in this crew" };
      }
      return { success: false, error: memberError.message };
    }

    // 4. Update user's crew_id
    await supabase
      .from("users")
      .update({ crew_id: invite.crew_id })
      .eq("id", userId);

    // 5. Increment invite use_count (service role would be better, but OK for MVP)
    await supabase
      .from("invites")
      .update({ use_count: invite.use_count + 1 })
      .eq("id", invite.id);

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

  leaveCrew: async (crewId, userId) => {
    const { error: memberError } = await supabase
      .from("crew_members")
      .delete()
      .eq("crew_id", crewId)
      .eq("user_id", userId);

    if (memberError) {
      return { success: false, error: memberError.message };
    }

    await supabase
      .from("users")
      .update({ crew_id: null })
      .eq("id", userId);

    set({ crew: null, members: [], invites: [], userRole: null });
    return { success: true };
  },

  clearCrew: () => {
    set({ crew: null, members: [], invites: [], userRole: null, error: null });
  },
}));
