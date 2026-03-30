import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  requirements: { action: string; count: number; zone_id?: string | null };
  reward_xp: number;
  reward_spray: number;
  starts_at: string;
  expires_at: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

interface MissionStoreState {
  missions: Mission[];
  isLoading: boolean;
  error: string | null;

  loadMissions: (userId: string) => Promise<void>;
  claimReward: (userId: string, missionId: string) => Promise<{ xp_awarded?: number; spray_awarded?: number; error?: string }>;
  clear: () => void;
}

export const useMissionStore = create<MissionStoreState>((set, get) => ({
  missions: [],
  isLoading: false,
  error: null,

  loadMissions: async (userId) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.rpc("get_active_missions", {
      p_user_id: userId,
    });

    if (error) {
      set({ isLoading: false, error: error.message });
    } else {
      set({ missions: (data as unknown as Mission[]) ?? [], isLoading: false });
    }
  },

  claimReward: async (userId, missionId) => {
    const { data, error } = await supabase.rpc("claim_mission_reward", {
      p_user_id: userId,
      p_mission_id: missionId,
    });

    if (error) {
      return { error: error.message };
    }

    const result = data as unknown as { success?: boolean; error?: string; xp_awarded?: number; spray_awarded?: number };

    if (result.error) {
      return { error: result.error };
    }

    // Refresh missions list
    await get().loadMissions(userId);

    return { xp_awarded: result.xp_awarded, spray_awarded: result.spray_awarded };
  },

  clear: () => set({ missions: [], isLoading: false, error: null }),
}));
