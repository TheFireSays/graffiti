import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("Seasons RPCs", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("get_active_season", () => {
    it("returns active season when one exists", async () => {
      mockRpc.mockResolvedValue({
        data: { id: "s1", name: "Spring 2026", starts_at: "2026-03-01", ends_at: "2026-04-01", status: "active" },
        error: null,
      });

      const { data } = await supabase.rpc("get_active_season");
      expect((data as Record<string, unknown>).name).toBe("Spring 2026");
      expect((data as Record<string, unknown>).status).toBe("active");
    });

    it("returns null when no active season", async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });
      const { data } = await supabase.rpc("get_active_season");
      expect(data).toBeNull();
    });
  });

  describe("get_season_leaderboard", () => {
    it("returns ranked crews for a season", async () => {
      mockRpc.mockResolvedValue({
        data: [
          { crew_id: "c1", crew_name: "Urban Kings", crew_abbreviation: "UKG", crew_color: "#ff3333", zones_held: 3, tags_placed: 25, tags_gone_over: 5, total_xp: 500, rank: 1 },
          { crew_id: "c2", crew_name: "Shadow Writers", crew_abbreviation: "SHW", crew_color: "#3366ff", zones_held: 1, tags_placed: 15, tags_gone_over: 2, total_xp: 300, rank: 2 },
        ],
        error: null,
      });

      const { data } = await supabase.rpc("get_season_leaderboard", { p_season_id: "s1" });
      const entries = data as Array<Record<string, unknown>>;
      expect(entries).toHaveLength(2);
      expect(entries[0].rank).toBe(1);
      expect(entries[0].crew_name).toBe("Urban Kings");
    });

    it("returns empty array for season with no activity", async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });
      const { data } = await supabase.rpc("get_season_leaderboard", { p_season_id: "s1" });
      expect(data).toHaveLength(0);
    });
  });
});
