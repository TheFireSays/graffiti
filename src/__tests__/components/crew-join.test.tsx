import { useCrewStore } from "@/stores/crew-store";

// Mock supabase for the store
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe("Crew Join Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCrewStore.setState({
      crew: null,
      members: [],
      invites: [],
      userRole: null,
      isLoading: false,
      error: null,
    });
  });

  describe("useCrewStore join mechanics", () => {
    it("starts with no crew", () => {
      expect(useCrewStore.getState().crew).toBeNull();
    });

    it("clearCrew resets all crew state", () => {
      useCrewStore.setState({
        crew: { id: "c1", name: "TestCrew" } as any,
        members: [{ userId: "u1" } as any],
        invites: [{ id: "inv1" } as any],
        userRole: "member",
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

    it("can set loading state during crew operations", () => {
      useCrewStore.setState({ isLoading: true });
      expect(useCrewStore.getState().isLoading).toBe(true);
    });

    it("can set error state", () => {
      useCrewStore.setState({ error: "Crew not found" });
      expect(useCrewStore.getState().error).toBe("Crew not found");
    });

    it("stores crew info with correct shape after loading", () => {
      const crewInfo = {
        id: "c1",
        name: "Night Writers",
        abbreviation: "NW",
        color: "#4ecdc4",
        founderId: "u1",
        memberCount: 5,
        totalXp: 12000,
        zonesControlled: 3,
        createdAt: "2026-01-01T00:00:00Z",
      };

      useCrewStore.setState({ crew: crewInfo });

      const crew = useCrewStore.getState().crew;
      expect(crew).not.toBeNull();
      expect(crew!.name).toBe("Night Writers");
      expect(crew!.abbreviation).toBe("NW");
      expect(crew!.memberCount).toBe(5);
    });

    it("stores members with correct shape", () => {
      const members = [
        {
          userId: "u1",
          username: "og_writer",
          displayName: "OG Writer",
          role: "og",
          level: 15,
          xp: 5000,
          joinedAt: "2026-01-01",
        },
        {
          userId: "u2",
          username: "newbie",
          displayName: "New Kid",
          role: "member",
          level: 2,
          xp: 100,
          joinedAt: "2026-03-28",
        },
      ];

      useCrewStore.setState({ members });

      expect(useCrewStore.getState().members).toHaveLength(2);
      expect(useCrewStore.getState().members[0].role).toBe("og");
      expect(useCrewStore.getState().members[1].role).toBe("member");
    });
  });
});
