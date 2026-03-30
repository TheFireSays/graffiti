import { useMissionStore } from "@/stores/mission-store";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

function resetStore() {
  useMissionStore.setState({
    missions: [],
    isLoading: false,
    error: null,
  });
}

describe("mission-store", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  it("starts with empty state", () => {
    const state = useMissionStore.getState();
    expect(state.missions).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("loadMissions sets missions from RPC", async () => {
    const mockMissions = [
      { id: "m1", title: "Tag 3 Spots", type: "daily", progress: 1, completed: false, claimed: false },
      { id: "m2", title: "Zone Raider", type: "daily", progress: 0, completed: false, claimed: false },
    ];
    mockRpc.mockResolvedValueOnce({ data: mockMissions, error: null });

    await useMissionStore.getState().loadMissions("user-1");

    expect(mockRpc).toHaveBeenCalledWith("get_active_missions", { p_user_id: "user-1" });
    expect(useMissionStore.getState().missions).toEqual(mockMissions);
    expect(useMissionStore.getState().isLoading).toBe(false);
  });

  it("loadMissions sets error on failure", async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: "Network error" } });

    await useMissionStore.getState().loadMissions("user-1");

    expect(useMissionStore.getState().error).toBe("Network error");
    expect(useMissionStore.getState().missions).toEqual([]);
  });

  it("claimReward calls RPC and refreshes missions", async () => {
    mockRpc
      .mockResolvedValueOnce({ data: { success: true, xp_awarded: 50, spray_awarded: 1 }, error: null })
      .mockResolvedValueOnce({ data: [], error: null });

    const result = await useMissionStore.getState().claimReward("user-1", "mission-1");

    expect(mockRpc).toHaveBeenCalledWith("claim_mission_reward", {
      p_user_id: "user-1",
      p_mission_id: "mission-1",
    });
    expect(result).toEqual({ xp_awarded: 50, spray_awarded: 1 });
  });

  it("claimReward returns error if mission not completed", async () => {
    mockRpc.mockResolvedValueOnce({ data: { error: "Mission not completed" }, error: null });

    const result = await useMissionStore.getState().claimReward("user-1", "mission-1");

    expect(result).toEqual({ error: "Mission not completed" });
  });

  it("clear resets state", () => {
    useMissionStore.setState({
      missions: [{ id: "m1" } as any],
      isLoading: true,
      error: "some error",
    });

    useMissionStore.getState().clear();

    expect(useMissionStore.getState().missions).toEqual([]);
    expect(useMissionStore.getState().isLoading).toBe(false);
    expect(useMissionStore.getState().error).toBeNull();
  });
});
