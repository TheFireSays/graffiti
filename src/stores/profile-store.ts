import { create } from "zustand";
import { supabase } from "../lib/supabase";

interface TagHistoryItem {
  id: string;
  tagImageName: string;
  tagCategory: string;
  crewAbbreviation: string | null;
  crewColor: string | null;
  status: string;
  createdAt: string;
  zoneName: string | null;
}

interface LeaderboardUser {
  id: string;
  username: string;
  level: number;
  xp: number;
  crewAbbreviation: string | null;
  crewColor: string | null;
}

interface LeaderboardCrew {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
  totalXp: number;
  zonesControlled: number;
  memberCount: number;
}

interface ProfileStoreState {
  tagHistory: TagHistoryItem[];
  tagCount: number;
  topUsers: LeaderboardUser[];
  topCrews: LeaderboardCrew[];
  isLoadingHistory: boolean;
  isLoadingLeaderboards: boolean;

  loadTagHistory: (userId: string) => Promise<void>;
  loadLeaderboards: () => Promise<void>;
}

export type { TagHistoryItem, LeaderboardUser, LeaderboardCrew };

export const useProfileStore = create<ProfileStoreState>((set) => ({
  tagHistory: [],
  tagCount: 0,
  topUsers: [],
  topCrews: [],
  isLoadingHistory: false,
  isLoadingLeaderboards: false,

  loadTagHistory: async (userId) => {
    set({ isLoadingHistory: true });

    const { data, error, count } = await supabase
      .from("tags")
      .select(`
        id,
        status,
        created_at,
        tag_image:tag_images!tags_tag_image_id_fkey(name, category),
        crew:crews(abbreviation, color),
        zone:zones(name)
      `, { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      set({
        tagHistory: data.map((row: any) => ({
          id: row.id,
          tagImageName: row.tag_image?.name ?? "Unknown",
          tagCategory: row.tag_image?.category ?? "tag",
          crewAbbreviation: row.crew?.abbreviation ?? null,
          crewColor: row.crew?.color ?? null,
          status: row.status,
          createdAt: row.created_at,
          zoneName: row.zone?.name ?? null,
        })),
        tagCount: count ?? 0,
        isLoadingHistory: false,
      });
    } else {
      set({ isLoadingHistory: false });
    }
  },

  loadLeaderboards: async () => {
    set({ isLoadingLeaderboards: true });

    const [usersResult, crewsResult] = await Promise.all([
      supabase
        .from("users")
        .select(`
          id,
          username,
          level,
          xp,
          crew:crews(abbreviation, color)
        `)
        .eq("is_banned", false)
        .order("xp", { ascending: false })
        .limit(20),
      supabase
        .from("crews")
        .select("id, name, abbreviation, color, total_xp, zones_controlled, member_count")
        .order("total_xp", { ascending: false })
        .limit(20),
    ]);

    const topUsers = usersResult.data
      ? usersResult.data.map((row: any) => ({
          id: row.id,
          username: row.username,
          level: row.level,
          xp: row.xp,
          crewAbbreviation: row.crew?.abbreviation ?? null,
          crewColor: row.crew?.color ?? null,
        }))
      : [];

    const topCrews = crewsResult.data
      ? crewsResult.data.map((row: any) => ({
          id: row.id,
          name: row.name,
          abbreviation: row.abbreviation,
          color: row.color,
          totalXp: Number(row.total_xp),
          zonesControlled: row.zones_controlled,
          memberCount: row.member_count,
        }))
      : [];

    set({ topUsers, topCrews, isLoadingLeaderboards: false });
  },
}));
