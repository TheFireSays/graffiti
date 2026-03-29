import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("Notification RPCs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register_push_token", () => {
    it("registers a token successfully", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const { data, error } = await supabase.rpc("register_push_token", {
        p_token: "ExponentPushToken[test123]",
        p_platform: "ios",
      });

      expect(error).toBeNull();
      expect(data).toEqual({ success: true });
    });

    it("rejects invalid platform", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Invalid platform" },
        error: null,
      });

      const { data } = await supabase.rpc("register_push_token", {
        p_token: "token",
        p_platform: "invalid",
      });

      expect((data as Record<string, unknown>).success).toBe(false);
    });
  });

  describe("unregister_push_token", () => {
    it("unregisters a token successfully", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const { data, error } = await supabase.rpc("unregister_push_token", {
        p_token: "ExponentPushToken[test123]",
      });

      expect(error).toBeNull();
      expect(data).toEqual({ success: true });
    });
  });

  describe("mark_notifications_read", () => {
    it("marks notifications as read", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const { data, error } = await supabase.rpc("mark_notifications_read", {
        p_notification_ids: ["n1", "n2"],
      });

      expect(error).toBeNull();
      expect(data).toEqual({ success: true });
    });
  });

  describe("get_unread_notification_count", () => {
    it("returns unread count", async () => {
      mockRpc.mockResolvedValue({
        data: 3,
        error: null,
      });

      const { data, error } = await supabase.rpc(
        "get_unread_notification_count"
      );

      expect(error).toBeNull();
      expect(data).toBe(3);
    });
  });
});
