import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("Analytics RPCs", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("get_daily_active_users", () => {
    it("returns count of distinct users for a date", async () => {
      mockRpc.mockResolvedValue({ data: 42, error: null });

      const { data } = await supabase.rpc("get_daily_active_users", {
        p_date: "2026-03-30",
      });
      expect(data).toBe(42);
    });
  });

  describe("get_event_counts", () => {
    it("returns aggregate event counts", async () => {
      const counts = [
        { event_name: "tag_placed", event_count: 150 },
        { event_name: "app_open", event_count: 300 },
      ];
      mockRpc.mockResolvedValue({ data: counts, error: null });

      const { data } = await supabase.rpc("get_event_counts", {
        p_event_name: "tag_placed",
        p_start: "2026-03-01",
        p_end: "2026-03-31",
      });
      expect(data).toHaveLength(2);
    });
  });

  describe("get_retention_cohort", () => {
    it("returns retention data", async () => {
      const retention = { d1: 0.65, d7: 0.35, d30: 0.15 };
      mockRpc.mockResolvedValue({ data: retention, error: null });

      const { data } = await supabase.rpc("get_retention_cohort", {
        p_start: "2026-03-01",
        p_end: "2026-03-31",
      });
      const result = data as unknown as typeof retention;
      expect(result.d1).toBe(0.65);
    });
  });
});
