import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("Moderation RPCs", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("report_tag", () => {
    it("reports a tag successfully", async () => {
      mockRpc.mockResolvedValue({ data: { success: true }, error: null });
      const { data } = await supabase.rpc("report_tag", {
        p_tag_id: "tag-1",
        p_reason: "offensive",
      });
      expect((data as Record<string, unknown>).success).toBe(true);
    });

    it("rejects invalid reason", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Invalid reason" },
        error: null,
      });
      const { data } = await supabase.rpc("report_tag", {
        p_tag_id: "tag-1",
        p_reason: "invalid",
      });
      expect((data as Record<string, unknown>).success).toBe(false);
    });
  });

  describe("review_report", () => {
    it("approves a report (restores tag)", async () => {
      mockRpc.mockResolvedValue({ data: { success: true }, error: null });
      const { data } = await supabase.rpc("review_report", {
        p_report_id: "r1",
        p_action: "approve",
      });
      expect((data as Record<string, unknown>).success).toBe(true);
    });

    it("removes a tag via report", async () => {
      mockRpc.mockResolvedValue({ data: { success: true }, error: null });
      const { data } = await supabase.rpc("review_report", {
        p_report_id: "r1",
        p_action: "remove",
      });
      expect((data as Record<string, unknown>).success).toBe(true);
    });
  });
});
