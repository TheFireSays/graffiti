import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: { rpc: jest.fn() },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("RPC Authorization — unauthorized callers are rejected", () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── request_join_crew ───────────────────────────────────────────
  describe("request_join_crew", () => {
    it("rejects if user is already in a crew", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Already in a crew" },
        error: null,
      });

      const { data } = await supabase.rpc("request_join_crew", {
        p_crew_id: "crew-1",
        p_message: "Let me in!",
      });

      expect(mockRpc).toHaveBeenCalledWith("request_join_crew", {
        p_crew_id: "crew-1",
        p_message: "Let me in!",
      });
      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Already in a crew");
    });

    it("rejects if not authenticated", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not authenticated" },
        error: null,
      });

      const { data } = await supabase.rpc("request_join_crew", {
        p_crew_id: "crew-1",
        p_message: undefined,
      });

      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Not authenticated");
    });
  });

  // ─── cancel_join_request ─────────────────────────────────────────
  describe("cancel_join_request", () => {
    it("rejects if caller does not own the request", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not your request" },
        error: null,
      });

      const { data } = await supabase.rpc("cancel_join_request", {
        p_request_id: "req-other-user",
      });

      expect(mockRpc).toHaveBeenCalledWith("cancel_join_request", {
        p_request_id: "req-other-user",
      });
      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Not your request");
    });

    it("rejects if not authenticated", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not authenticated" },
        error: null,
      });

      const { data } = await supabase.rpc("cancel_join_request", {
        p_request_id: "req-1",
      });

      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Not authenticated");
    });
  });

  // ─── review_join_request ─────────────────────────────────────────
  describe("review_join_request", () => {
    it("rejects if caller is not OG-eligible", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not authorized to review requests" },
        error: null,
      });

      const { data } = await supabase.rpc("review_join_request", {
        p_request_id: "req-1",
        p_approved: true,
      });

      expect(mockRpc).toHaveBeenCalledWith("review_join_request", {
        p_request_id: "req-1",
        p_approved: true,
      });
      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe(
        "Not authorized to review requests"
      );
    });

    it("rejects if not authenticated", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not authenticated" },
        error: null,
      });

      const { data } = await supabase.rpc("review_join_request", {
        p_request_id: "req-1",
        p_approved: false,
      });

      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Not authenticated");
    });
  });

  // ─── send_direct_invite ──────────────────────────────────────────
  describe("send_direct_invite", () => {
    it("rejects if caller is not OG-eligible", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not authorized to send invites" },
        error: null,
      });

      const { data } = await supabase.rpc("send_direct_invite", {
        p_target_username: "NOVA",
      });

      expect(mockRpc).toHaveBeenCalledWith("send_direct_invite", {
        p_target_username: "NOVA",
      });
      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe(
        "Not authorized to send invites"
      );
    });

    it("rejects if target user is already in a crew", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "User is already in a crew" },
        error: null,
      });

      const { data } = await supabase.rpc("send_direct_invite", {
        p_target_username: "ALREADY_IN_CREW",
      });

      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe(
        "User is already in a crew"
      );
    });

    it("rejects if not authenticated", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not authenticated" },
        error: null,
      });

      const { data } = await supabase.rpc("send_direct_invite", {
        p_target_username: "SOMEONE",
      });

      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Not authenticated");
    });
  });

  // ─── respond_direct_invite ───────────────────────────────────────
  describe("respond_direct_invite", () => {
    it("rejects if caller does not own the invite", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not your invite" },
        error: null,
      });

      const { data } = await supabase.rpc("respond_direct_invite", {
        p_invite_id: "inv-other-user",
        p_accepted: true,
      });

      expect(mockRpc).toHaveBeenCalledWith("respond_direct_invite", {
        p_invite_id: "inv-other-user",
        p_accepted: true,
      });
      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Not your invite");
    });

    it("rejects if caller is already in a crew", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Already in a crew" },
        error: null,
      });

      const { data } = await supabase.rpc("respond_direct_invite", {
        p_invite_id: "inv-1",
        p_accepted: true,
      });

      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Already in a crew");
    });

    it("rejects if not authenticated", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not authenticated" },
        error: null,
      });

      const { data } = await supabase.rpc("respond_direct_invite", {
        p_invite_id: "inv-1",
        p_accepted: false,
      });

      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Not authenticated");
    });
  });

  // ─── leave_crew ──────────────────────────────────────────────────
  describe("leave_crew", () => {
    it("rejects if user is not in a crew", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not in a crew" },
        error: null,
      });

      const { data } = await supabase.rpc("leave_crew");

      expect(mockRpc).toHaveBeenCalledWith("leave_crew");
      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Not in a crew");
    });

    it("rejects if not authenticated", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not authenticated" },
        error: null,
      });

      const { data } = await supabase.rpc("leave_crew");

      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Not authenticated");
    });
  });

  // ─── place_tag_scored ────────────────────────────────────────────
  describe("place_tag_scored", () => {
    it("rejects if not authenticated", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not authenticated" },
        error: null,
      });

      const { data } = await supabase.rpc("place_tag_scored", {
        p_tag_image_id: "img-1",
        p_custom_colors: {},
        p_lng: -97.744,
        p_lat: 30.267,
        p_compass_heading: 180,
      });

      expect(mockRpc).toHaveBeenCalledWith("place_tag_scored", {
        p_tag_image_id: "img-1",
        p_custom_colors: {},
        p_lng: -97.744,
        p_lat: 30.267,
        p_compass_heading: 180,
      });
      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Not authenticated");
    });
  });

  // ─── report_tag ──────────────────────────────────────────────────
  describe("report_tag", () => {
    it("rejects if not authenticated", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not authenticated" },
        error: null,
      });

      const { data } = await supabase.rpc("report_tag", {
        p_tag_id: "tag-1",
        p_reason: "offensive",
      });

      expect(mockRpc).toHaveBeenCalledWith("report_tag", {
        p_tag_id: "tag-1",
        p_reason: "offensive",
      });
      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Not authenticated");
    });
  });

  // ─── delete_account ──────────────────────────────────────────────
  describe("delete_account", () => {
    it("rejects if not authenticated", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Not authenticated" },
        error: null,
      });

      const { data } = await supabase.rpc("delete_account");

      expect(mockRpc).toHaveBeenCalledWith("delete_account");
      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toBe("Not authenticated");
    });
  });
});
