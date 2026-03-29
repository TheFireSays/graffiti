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

interface SeasonInfo {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  status: string;
}

interface SeasonLeaderboardEntry {
  crewId: string;
  crewName: string;
  crewAbbreviation: string;
  crewColor: string;
  zonesHeld: number;
  tagsPlaced: number;
  tagsGoneOver: number;
  totalXp: number;
  rank: number;
}

interface ProfileStoreState {
  tagHistory: TagHistoryItem[];
  tagCount: number;
  topUsers: LeaderboardUser[];
  topCrews: LeaderboardCrew[];
  isLoadingHistory: boolean;
  isLoadingLeaderboards: boolean;
  activeSeason: SeasonInfo | null;
  seasonLeaderboard: SeasonLeaderboardEntry[];
  isLoadingSeason: boolean;

  loadTagHistory: (userId: string) => Promise<void>;
  loadLeaderboards: () => Promise<void>;
  loadActiveSeason: () => Promise<void>;
  loadSeasonLeaderboard: (seasonId: string) => Promise<void>;
}

export type { TagHistoryItem, LeaderboardUser, LeaderboardCrew, SeasonInfo, SeasonLeaderboardEntry };

export const useProfileStore = create<ProfileStoreState>((set) => ({
  tagHistory: [],
  tagCount: 0,
  topUsers: [],
  topCrews: [],
  isLoadingHistory: false,
  isLoadingLeaderboards: false,
  activeSeason: null,
  seasonLeaderboard: [],
  isLoadingSeason: false,

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

  loadActiveSeason: async () => {
    set({ isLoadingSeason: true });
    const { data, error } = await supabase.rpc("get_active_season");
    if (!error && data && data !== null) {
      const season = data as any;
      if (season && season.id) {
        set({
          activeSeason: {
            id: season.id,
            name: season.name,
            startsAt: season.starts_at,
            endsAt: season.ends_at,
            status: season.status,
          },
          isLoadingSeason: false,
        });
      } else {
        set({ activeSeason: null, isLoadingSeason: false });
      }
    } else {
      set({ activeSeason: null, isLoadingSeason: false });
    }
  },

  loadSeasonLeaderboard: async (seasonId) => {
    const { data, error } = await supabase.rpc("get_season_leaderboard", {
      p_season_id: seasonId,
    });
    if (!error && data) {
      set({
        seasonLeaderboard: (data as any[]).map((row) => ({
          crewId: row.crew_id,
          crewName: row.crew_name,
          crewAbbreviation: row.crew_abbreviation,
          crewColor: row.crew_color,
          zonesHeld: row.zones_held,
          tagsPlaced: row.tags_placed,
          tagsGoneOver: row.tags_gone_over,
          totalXp: row.total_xp,
          rank: Number(row.rank),
        })),
      });
    }
  },
}));
