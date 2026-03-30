import { create } from "zustand";
import { supabase } from "../lib/supabase";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  reward_xp: number;
  reward_spray: number;
  rarity: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

interface NewlyUnlocked {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  reward_xp: number;
  reward_spray: number;
}

interface AchievementStoreState {
  achievements: Achievement[];
  newlyUnlocked: NewlyUnlocked[];
  isLoading: boolean;

  loadAchievements: (userId: string) => Promise<void>;
  addNewlyUnlocked: (items: NewlyUnlocked[]) => void;
  clearNewlyUnlocked: () => void;
}

export type { Achievement, NewlyUnlocked };

export const useAchievementStore = create<AchievementStoreState>((set) => ({
  achievements: [],
  newlyUnlocked: [],
  isLoading: false,

  loadAchievements: async (userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase.rpc("get_user_achievements", {
      p_user_id: userId,
    });

    if (!error && data) {
      set({ achievements: data as unknown as Achievement[], isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  addNewlyUnlocked: (items) => {
    if (items.length > 0) {
      set((state) => ({
        newlyUnlocked: [...state.newlyUnlocked, ...items],
      }));
    }
  },

  clearNewlyUnlocked: () => {
    set({ newlyUnlocked: [] });
  },
}));
