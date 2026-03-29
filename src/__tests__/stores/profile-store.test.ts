import { useProfileStore } from "@/stores/profile-store";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockFrom = supabase.from as jest.Mock;

function resetStore() {
  useProfileStore.setState({
    tagHistory: [],
    tagCount: 0,
    topUsers: [],
    topCrews: [],
    isLoadingHistory: false,
    isLoadingLeaderboards: false,
  });
}

describe("useProfileStore", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("has correct defaults", () => {
      const state = useProfileStore.getState();
      expect(state.tagHistory).toEqual([]);
      expect(state.tagCount).toBe(0);
      expect(state.topUsers).toEqual([]);
      expect(state.topCrews).toEqual([]);
      expect(state.isLoadingHistory).toBe(false);
      expect(state.isLoadingLeaderboards).toBe(false);
    });
  });

  describe("loadTagHistory", () => {
    it("loads and maps tag history for user", async () => {
      const mockData = [
        {
          id: "t1",
          status: "active",
          created_at: "2026-03-29T00:00:00Z",
          tag_image: { name: "Basic Tag", category: "tag" },
          crew: { abbreviation: "TC", color: "#FF0000" },
          zone: { name: "Zone A" },
        },
      ];

      const chain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: mockData, error: null, count: 1 }),
      };
      mockFrom.mockReturnValue(chain);

      await useProfileStore.getState().loadTagHistory("u1");

      const state = useProfileStore.getState();
      expect(state.tagHistory).toHaveLength(1);
      expect(state.tagHistory[0].tagImageName).toBe("Basic Tag");
      expect(state.tagHistory[0].crewAbbreviation).toBe("TC");
      expect(state.tagHistory[0].zoneName).toBe("Zone A");
      expect(state.tagCount).toBe(1);
      expect(state.isLoadingHistory).toBe(false);
    });

    it("handles error gracefully", async () => {
      const chain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: null, error: { message: "fail" }, count: null }),
      };
      mockFrom.mockReturnValue(chain);

      await useProfileStore.getState().loadTagHistory("u1");
      expect(useProfileStore.getState().isLoadingHistory).toBe(false);
      expect(useProfileStore.getState().tagHistory).toEqual([]);
    });
  });

  describe("loadLeaderboards", () => {
    it("loads top users and top crews", async () => {
      const mockUsers = [
        {
          id: "u1",
          username: "tagger1",
          level: 10,
          xp: 5000,
          crew: { abbreviation: "TC", color: "#FF0000" },
        },
      ];

      const mockCrews = [
        {
          id: "c1",
          name: "TopCrew",
          abbreviation: "TC",
          color: "#FF0000",
          total_xp: 15000,
          zones_controlled: 5,
          member_count: 8,
        },
      ];

      // Users query chain
      const usersChain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: mockUsers }),
      };

      // Crews query chain
      const crewsChain: any = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: mockCrews }),
      };

      mockFrom.mockReturnValueOnce(usersChain).mockReturnValueOnce(crewsChain);

      await useProfileStore.getState().loadLeaderboards();

      const state = useProfileStore.getState();
      expect(state.topUsers).toHaveLength(1);
      expect(state.topUsers[0].username).toBe("tagger1");
      expect(state.topCrews).toHaveLength(1);
      expect(state.topCrews[0].name).toBe("TopCrew");
      expect(state.topCrews[0].totalXp).toBe(15000);
      expect(state.isLoadingLeaderboards).toBe(false);
    });

    it("handles null data gracefully", async () => {
      const usersChain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: null }),
      };
      const crewsChain: any = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: null }),
      };

      mockFrom.mockReturnValueOnce(usersChain).mockReturnValueOnce(crewsChain);

      await useProfileStore.getState().loadLeaderboards();

      expect(useProfileStore.getState().topUsers).toEqual([]);
      expect(useProfileStore.getState().topCrews).toEqual([]);
      expect(useProfileStore.getState().isLoadingLeaderboards).toBe(false);
    });
  });
});
