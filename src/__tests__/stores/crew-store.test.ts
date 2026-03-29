import { useCrewStore } from "@/stores/crew-store";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockFrom = supabase.from as jest.Mock;

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
    it("creates crew, adds founder, updates user", async () => {
      // First call: insert crew
      const insertChain: any = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: "c-new" }, error: null }),
      };
      // Second call: insert crew_member
      const memberChain: any = {
        insert: jest.fn().mockResolvedValue({ error: null }),
      };
      // Third call: update user
      const userChain: any = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      mockFrom
        .mockReturnValueOnce(insertChain)
        .mockReturnValueOnce(memberChain)
        .mockReturnValueOnce(userChain);

      const result = await useCrewStore.getState().createCrew("MyCrew", "MC", "#00FF00", "u1");
      expect(result.success).toBe(true);
    });

    it("returns error when crew insert fails", async () => {
      const insertChain: any = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: "Name taken" } }),
      };
      mockFrom.mockReturnValue(insertChain);

      const result = await useCrewStore.getState().createCrew("Taken", "TK", "#000", "u1");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Name taken");
    });
  });

  describe("joinCrew", () => {
    it("validates invite and joins crew", async () => {
      // Find invite
      const inviteChain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: "inv1", crew_id: "c1", max_uses: 10, use_count: 3, expires_at: null },
          error: null,
        }),
      };
      // Insert member
      const memberChain: any = {
        insert: jest.fn().mockResolvedValue({ error: null }),
      };
      // Update user
      const userChain: any = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      // Update invite use_count
      const updateInviteChain: any = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      mockFrom
        .mockReturnValueOnce(inviteChain)
        .mockReturnValueOnce(memberChain)
        .mockReturnValueOnce(userChain)
        .mockReturnValueOnce(updateInviteChain);

      const result = await useCrewStore.getState().joinCrew("ABC123", "u2");
      expect(result.success).toBe(true);
    });

    it("rejects invalid invite code", async () => {
      const inviteChain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
      };
      mockFrom.mockReturnValue(inviteChain);

      const result = await useCrewStore.getState().joinCrew("INVALID", "u2");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid invite code");
    });

    it("rejects fully used invite", async () => {
      const inviteChain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: "inv1", crew_id: "c1", max_uses: 5, use_count: 5, expires_at: null },
          error: null,
        }),
      };
      mockFrom.mockReturnValue(inviteChain);

      const result = await useCrewStore.getState().joinCrew("USED", "u2");
      expect(result.success).toBe(false);
      expect(result.error).toBe("This invite has been fully used");
    });
  });

  describe("leaveCrew", () => {
    it("removes member and clears crew state", async () => {
      const deleteChain: any = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      deleteChain.eq.mockReturnValueOnce(deleteChain).mockResolvedValueOnce({ error: null });

      const userChain: any = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      mockFrom.mockReturnValueOnce(deleteChain).mockReturnValueOnce(userChain);

      useCrewStore.setState({
        crew: { id: "c1", name: "Crew" } as any,
        members: [{ userId: "u1" } as any],
      });

      const result = await useCrewStore.getState().leaveCrew("c1", "u1");
      expect(result.success).toBe(true);
      expect(useCrewStore.getState().crew).toBeNull();
      expect(useCrewStore.getState().members).toEqual([]);
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
