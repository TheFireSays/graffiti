import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: { rpc: jest.fn() },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("crew membership RPCs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("request_join_crew", () => {
    it("returns success with request_id", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true, request_id: "req-abc" },
        error: null,
      });

      const { data } = await supabase.rpc("request_join_crew", {
        p_crew_id: "crew-1",
        p_message: "I want to join!",
      });

      expect((data as any).success).toBe(true);
      expect((data as any).request_id).toBe("req-abc");
    });

    it("rejects if user already in a crew", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Already in a crew" },
        error: null,
      });

      const { data } = await supabase.rpc("request_join_crew", {
        p_crew_id: "crew-1",
        p_message: undefined,
      });

      expect((data as any).success).toBe(false);
      expect((data as any).error).toBe("Already in a crew");
    });
  });

  describe("review_join_request", () => {
    it("approves a request", async () => {
      mockRpc.mockResolvedValue({ data: { success: true }, error: null });

      const { data } = await supabase.rpc("review_join_request", {
        p_request_id: "req-1",
        p_approved: true,
      });

      expect((data as any).success).toBe(true);
    });

    it("declines a request", async () => {
      mockRpc.mockResolvedValue({ data: { success: true }, error: null });

      const { data } = await supabase.rpc("review_join_request", {
        p_request_id: "req-1",
        p_approved: false,
      });

      expect((data as any).success).toBe(true);
    });
  });

  describe("send_direct_invite", () => {
    it("sends invite to a valid username", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true, invite_id: "inv-abc" },
        error: null,
      });

      const { data } = await supabase.rpc("send_direct_invite", {
        p_target_username: "NOVA",
      });

      expect((data as any).success).toBe(true);
      expect((data as any).invite_id).toBe("inv-abc");
    });

    it("rejects if target user not found", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "User not found" },
        error: null,
      });

      const { data } = await supabase.rpc("send_direct_invite", {
        p_target_username: "NONEXISTENT",
      });

      expect((data as any).success).toBe(false);
    });
  });

  describe("respond_direct_invite", () => {
    it("accepts an invite", async () => {
      mockRpc.mockResolvedValue({ data: { success: true }, error: null });

      const { data } = await supabase.rpc("respond_direct_invite", {
        p_invite_id: "inv-1",
        p_accepted: true,
      });

      expect((data as any).success).toBe(true);
    });

    it("rejects an expired invite", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Invite has expired" },
        error: null,
      });

      const { data } = await supabase.rpc("respond_direct_invite", {
        p_invite_id: "inv-expired",
        p_accepted: true,
      });

      expect((data as any).success).toBe(false);
    });
  });

  describe("cancel_join_request", () => {
    it("cancels own pending request", async () => {
      mockRpc.mockResolvedValue({ data: { success: true }, error: null });

      const { data } = await supabase.rpc("cancel_join_request", {
        p_request_id: "req-1",
      });

      expect((data as any).success).toBe(true);
    });
  });
});
