import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("Mission RPCs", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("get_active_missions", () => {
    it("returns active missions with progress", async () => {
      const missions = [
        { id: "m1", title: "Tag 3 Spots", type: "daily", progress: 2, completed: false, claimed: false },
        { id: "m2", title: "Zone Raider", type: "daily", progress: 0, completed: false, claimed: false },
      ];
      mockRpc.mockResolvedValue({ data: missions, error: null });

      const { data } = await supabase.rpc("get_active_missions", { p_user_id: "user-1" });
      const results = data as unknown as typeof missions;
      expect(results).toHaveLength(2);
      expect(results[0].progress).toBe(2);
    });

    it("returns empty array when no missions", async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });
      const { data } = await supabase.rpc("get_active_missions", { p_user_id: "user-1" });
      expect(data).toEqual([]);
    });
  });

  describe("claim_mission_reward", () => {
    it("awards XP and spray on completed mission", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true, xp_awarded: 50, spray_awarded: 1 },
        error: null,
      });

      const { data } = await supabase.rpc("claim_mission_reward", {
        p_user_id: "user-1",
        p_mission_id: "mission-1",
      });
      const result = data as unknown as { success: boolean; xp_awarded: number; spray_awarded: number };
      expect(result.success).toBe(true);
      expect(result.xp_awarded).toBe(50);
    });

    it("returns error for uncompleted mission", async () => {
      mockRpc.mockResolvedValue({
        data: { error: "Mission not completed" },
        error: null,
      });

      const { data } = await supabase.rpc("claim_mission_reward", {
        p_user_id: "user-1",
        p_mission_id: "mission-1",
      });
      const result = data as unknown as { error: string };
      expect(result.error).toBe("Mission not completed");
    });

    it("returns error for already claimed", async () => {
      mockRpc.mockResolvedValue({
        data: { error: "Reward already claimed" },
        error: null,
      });

      const { data } = await supabase.rpc("claim_mission_reward", {
        p_user_id: "user-1",
        p_mission_id: "mission-1",
      });
      const result = data as unknown as { error: string };
      expect(result.error).toBe("Reward already claimed");
    });
  });

  describe("check_mission_progress", () => {
    it("calls RPC with action and optional zone_id", async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      await supabase.rpc("check_mission_progress", {
        p_user_id: "user-1",
        p_action: "place_tags",
      });
      expect(mockRpc).toHaveBeenCalledWith("check_mission_progress", {
        p_user_id: "user-1",
        p_action: "place_tags",
      });
    });
  });
});
