import { useCrewStore } from "@/stores/crew-store";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;

function resetStore() {
  useCrewStore.setState({
    crew: null,
    members: [],
    invites: [],
    userRole: null,
    isLoading: false,
    error: null,
  });
}

function mockChain(resolvedValue: any) {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolvedValue),
    order: jest.fn().mockResolvedValue(resolvedValue),
    limit: jest.fn().mockResolvedValue(resolvedValue),
  };
  return chain;
}

describe("useCrewStore", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("has correct defaults", () => {
      const state = useCrewStore.getState();
      expect(state.crew).toBeNull();
      expect(state.members).toEqual([]);
      expect(state.invites).toEqual([]);
      expect(state.userRole).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("loadCrew", () => {
    it("loads crew data by ID", async () => {
      const mockCrew = {
        id: "c1",
        name: "TestCrew",
        abbreviation: "TC",
        color: "#FF0000",
        founder_id: "u1",
        member_count: 3,
        total_xp: 5000,
        zones_controlled: 2,
        created_at: "2026-01-01",
      };

      mockFrom.mockReturnValue(mockChain({ data: mockCrew, error: null }));

      await useCrewStore.getState().loadCrew("c1");

      const state = useCrewStore.getState();
      expect(state.crew).not.toBeNull();
      expect(state.crew!.name).toBe("TestCrew");
      expect(state.crew!.totalXp).toBe(5000);
      expect(state.isLoading).toBe(false);
    });

    it("sets error on failure", async () => {
      mockFrom.mockReturnValue(
        mockChain({ data: null, error: { message: "Not found" } })
      );

      await useCrewStore.getState().loadCrew("bad-id");
      expect(useCrewStore.getState().error).toBe("Not found");
      expect(useCrewStore.getState().isLoading).toBe(false);
    });
  });

  describe("createCrew", () => {
    it("calls create_crew RPC and returns success", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true, crew_id: "c-new" },
        error: null,
      });

      const result = await useCrewStore.getState().createCrew("MyCrew", "MC", "#00FF00");
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("create_crew", {
        p_name: "MyCrew",
        p_abbreviation: "MC",
        p_color: "#00FF00",
      });
    });

    it("returns error when RPC fails", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "Name taken" },
      });

      const result = await useCrewStore.getState().createCrew("Taken", "TK", "#000");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Name taken");
    });

    it("returns error from RPC business logic", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Already in a crew" },
        error: null,
      });

      const result = await useCrewStore.getState().createCrew("X", "XX", "#000");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Already in a crew");
    });
  });

  describe("joinCrew", () => {
    it("calls join_crew RPC and returns success", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true, crew_id: "c1" },
        error: null,
      });

      const result = await useCrewStore.getState().joinCrew("ABC123");
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("join_crew", {
        p_invite_code: "ABC123",
      });
    });

    it("returns error from RPC on invalid code", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Invalid invite code" },
        error: null,
      });

      const result = await useCrewStore.getState().joinCrew("INVALID");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid invite code");
    });

    it("returns error from RPC on fully used invite", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "This invite has been fully used" },
        error: null,
      });

      const result = await useCrewStore.getState().joinCrew("USED");
      expect(result.success).toBe(false);
      expect(result.error).toBe("This invite has been fully used");
    });
  });

  describe("leaveCrew", () => {
    it("calls leave_crew RPC and clears crew state", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      useCrewStore.setState({
        crew: { id: "c1", name: "Crew" } as any,
        members: [{ userId: "u1" } as any],
      });

      const result = await useCrewStore.getState().leaveCrew();
      expect(result.success).toBe(true);
      expect(useCrewStore.getState().crew).toBeNull();
      expect(useCrewStore.getState().members).toEqual([]);
      expect(mockRpc).toHaveBeenCalledWith("leave_crew");
    });

    it("returns error when founder tries to leave", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Founders cannot leave — transfer ownership or disband first" },
        error: null,
      });

      const result = await useCrewStore.getState().leaveCrew();
      expect(result.success).toBe(false);
      expect(result.error).toContain("Founders cannot leave");
    });
  });

  describe("clearCrew", () => {
    it("resets all crew state", () => {
      useCrewStore.setState({
        crew: { id: "c1" } as any,
        members: [{ userId: "u1" } as any],
        invites: [{ id: "inv1" } as any],
        userRole: "og",
        error: "some error",
      });

      useCrewStore.getState().clearCrew();

      const state = useCrewStore.getState();
      expect(state.crew).toBeNull();
      expect(state.members).toEqual([]);
      expect(state.invites).toEqual([]);
      expect(state.userRole).toBeNull();
      expect(state.error).toBeNull();
    });
  });
});
