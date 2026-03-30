import { useAchievementStore } from "@/stores/achievement-store";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

function resetStore() {
  useAchievementStore.setState({
    achievements: [],
    newlyUnlocked: [],
    isLoading: false,
  });
}

describe("useAchievementStore", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe("loadAchievements", () => {
    it("loads achievements via get_user_achievements RPC", async () => {
      const mockAchievements = [
        {
          id: "a1",
          name: "First Tag",
          description: "Place your first tag",
          icon: "🎨",
          category: "tagging",
          requirement_type: "tags_placed",
          requirement_value: 1,
          reward_xp: 50,
          reward_spray: 5,
          rarity: "common",
          unlocked: true,
          unlocked_at: "2026-03-30T00:00:00Z",
        },
        {
          id: "a2",
          name: "Street Artist",
          description: "Place 25 tags",
          icon: "🖌️",
          category: "tagging",
          requirement_type: "tags_placed",
          requirement_value: 25,
          reward_xp: 200,
          reward_spray: 10,
          rarity: "common",
          unlocked: false,
          unlocked_at: null,
        },
      ];

      mockRpc.mockResolvedValue({ data: mockAchievements, error: null });

      await useAchievementStore.getState().loadAchievements("user-1");

      expect(mockRpc).toHaveBeenCalledWith("get_user_achievements", {
        p_user_id: "user-1",
      });

      const state = useAchievementStore.getState();
      expect(state.achievements).toHaveLength(2);
      expect(state.achievements[0].name).toBe("First Tag");
      expect(state.achievements[0].unlocked).toBe(true);
      expect(state.achievements[1].unlocked).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it("handles RPC error gracefully", async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: "DB error" } });

      await useAchievementStore.getState().loadAchievements("user-1");

      const state = useAchievementStore.getState();
      expect(state.achievements).toHaveLength(0);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("addNewlyUnlocked", () => {
    it("adds newly unlocked achievements to the queue", () => {
      const items = [
        {
          id: "a1",
          name: "First Tag",
          description: "Place your first tag",
          icon: "🎨",
          rarity: "common",
          reward_xp: 50,
          reward_spray: 5,
        },
      ];

      useAchievementStore.getState().addNewlyUnlocked(items);

      expect(useAchievementStore.getState().newlyUnlocked).toHaveLength(1);
      expect(useAchievementStore.getState().newlyUnlocked[0].name).toBe("First Tag");
    });

    it("appends to existing queue", () => {
      useAchievementStore.setState({
        newlyUnlocked: [
          { id: "a1", name: "First Tag", description: "", icon: "🎨", rarity: "common", reward_xp: 50, reward_spray: 5 },
        ],
      });

      useAchievementStore.getState().addNewlyUnlocked([
        { id: "a2", name: "Crew Up", description: "", icon: "🤝", rarity: "common", reward_xp: 100, reward_spray: 5 },
      ]);

      expect(useAchievementStore.getState().newlyUnlocked).toHaveLength(2);
    });

    it("does not add when empty array passed", () => {
      useAchievementStore.getState().addNewlyUnlocked([]);
      expect(useAchievementStore.getState().newlyUnlocked).toHaveLength(0);
    });
  });

  describe("clearNewlyUnlocked", () => {
    it("clears the newly unlocked queue", () => {
      useAchievementStore.setState({
        newlyUnlocked: [
          { id: "a1", name: "First Tag", description: "", icon: "🎨", rarity: "common", reward_xp: 50, reward_spray: 5 },
        ],
      });

      useAchievementStore.getState().clearNewlyUnlocked();

      expect(useAchievementStore.getState().newlyUnlocked).toHaveLength(0);
    });
  });
});
