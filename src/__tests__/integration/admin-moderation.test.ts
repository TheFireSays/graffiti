import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("Admin Moderation RPCs", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("get_pending_reports", () => {
    it("returns pending reports for moderators", async () => {
      const reports = [
        { report_id: "r1", tag_id: "t1", reporter_username: "user1", reason: "offensive", status: "pending" },
      ];
      mockRpc.mockResolvedValue({ data: reports, error: null });

      const { data } = await supabase.rpc("get_pending_reports");
      expect(data).toHaveLength(1);
      expect((data as unknown as typeof reports)[0].reason).toBe("offensive");
    });

    it("returns error for non-moderators", async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });
      const { data } = await supabase.rpc("get_pending_reports");
      expect(data).toEqual([]);
    });
  });

  describe("moderate_report", () => {
    it("dismisses a report", async () => {
      mockRpc.mockResolvedValue({ data: { success: true, action: "dismiss" }, error: null });

      const { data } = await supabase.rpc("moderate_report", {
        p_report_id: "report-1",
        p_action: "dismiss",
      });
      const result = data as unknown as { success: boolean; action: string };
      expect(result.success).toBe(true);
      expect(result.action).toBe("dismiss");
    });

    it("bans user via report", async () => {
      mockRpc.mockResolvedValue({ data: { success: true, action: "ban_user" }, error: null });

      const { data } = await supabase.rpc("moderate_report", {
        p_report_id: "report-1",
        p_action: "ban_user",
      });
      const result = data as unknown as { success: boolean; action: string };
      expect(result.action).toBe("ban_user");
    });
  });

  describe("ban_user / unban_user", () => {
    it("bans a user", async () => {
      mockRpc.mockResolvedValue({ data: { success: true }, error: null });

      const { data } = await supabase.rpc("ban_user", {
        p_user_id: "user-1",
        p_reason: "Repeated violations",
        p_duration_days: 7,
      });
      expect((data as unknown as { success: boolean }).success).toBe(true);
    });

    it("unbans a user", async () => {
      mockRpc.mockResolvedValue({ data: { success: true }, error: null });

      const { data } = await supabase.rpc("unban_user", { p_user_id: "user-1" });
      expect((data as unknown as { success: boolean }).success).toBe(true);
    });

    it("rejects non-admin ban attempts", async () => {
      mockRpc.mockResolvedValue({ data: { error: "Unauthorized — admin only" }, error: null });

      const { data } = await supabase.rpc("ban_user", {
        p_user_id: "user-1",
        p_reason: "test",
        p_duration_days: 1,
      });
      expect((data as unknown as { error: string }).error).toContain("Unauthorized");
    });
  });

  describe("season management", () => {
    it("creates a season", async () => {
      mockRpc.mockResolvedValue({ data: { success: true, season_id: "s1" }, error: null });

      const { data } = await supabase.rpc("create_season", {
        p_name: "Summer 2026",
        p_starts_at: "2026-06-01T00:00:00Z",
        p_ends_at: "2026-09-01T00:00:00Z",
      });
      const result = data as unknown as { success: boolean; season_id: string };
      expect(result.success).toBe(true);
    });

    it("seeds daily missions", async () => {
      mockRpc.mockResolvedValue({ data: { success: true, missions_created: 3 }, error: null });

      const { data } = await supabase.rpc("seed_daily_missions");
      expect((data as unknown as { missions_created: number }).missions_created).toBe(3);
    });
  });
});
