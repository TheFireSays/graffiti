import { useNotificationStore } from "@/stores/notification-store";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;

function resetStore() {
  useNotificationStore.setState({
    notifications: [],
    unreadCount: 0,
    pushToken: null,
    permissionStatus: null,
    isLoading: false,
    error: null,
  });
}

describe("useNotificationStore", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe("registerToken", () => {
    it("calls register_push_token RPC and stores token", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await useNotificationStore
        .getState()
        .registerToken("ExponentPushToken[abc123]", "ios");

      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("register_push_token", {
        p_token: "ExponentPushToken[abc123]",
        p_platform: "ios",
      });
      expect(useNotificationStore.getState().pushToken).toBe(
        "ExponentPushToken[abc123]"
      );
    });

    it("returns error on RPC failure", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });

      const result = await useNotificationStore
        .getState()
        .registerToken("token", "ios");

      expect(result.success).toBe(false);
      expect(result.error).toBe("DB error");
    });
  });

  describe("unregisterToken", () => {
    it("calls unregister_push_token RPC and clears token", async () => {
      useNotificationStore.setState({ pushToken: "ExponentPushToken[abc]" });
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      await useNotificationStore.getState().unregisterToken();

      expect(mockRpc).toHaveBeenCalledWith("unregister_push_token", {
        p_token: "ExponentPushToken[abc]",
      });
      expect(useNotificationStore.getState().pushToken).toBeNull();
    });
  });

  describe("fetchNotifications", () => {
    it("loads unread notifications from notification_queue", async () => {
      const mockNotifications = [
        {
          id: "n1",
          event_type: "zone_flipped",
          title: "Zone Lost!",
          body: "Downtown was taken",
          metadata: {},
          is_read: false,
          created_at: "2026-03-29T00:00:00Z",
        },
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockNotifications,
          error: null,
        }),
      });

      await useNotificationStore.getState().fetchNotifications();

      expect(useNotificationStore.getState().notifications).toEqual(
        mockNotifications
      );
      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });
  });

  describe("markAsRead", () => {
    it("calls mark_notifications_read RPC and updates local state", async () => {
      useNotificationStore.setState({
        notifications: [
          {
            id: "n1",
            event_type: "zone_flipped",
            title: "Zone Lost!",
            body: "test",
            metadata: {},
            is_read: false,
            created_at: "2026-03-29T00:00:00Z",
          },
        ],
        unreadCount: 1,
      });

      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      await useNotificationStore.getState().markAsRead(["n1"]);

      expect(mockRpc).toHaveBeenCalledWith("mark_notifications_read", {
        p_notification_ids: ["n1"],
      });
      const state = useNotificationStore.getState();
      expect(state.notifications[0].is_read).toBe(true);
      expect(state.unreadCount).toBe(0);
    });
  });

  describe("fetchUnreadCount", () => {
    it("calls get_unread_notification_count RPC", async () => {
      mockRpc.mockResolvedValue({ data: 5, error: null });

      await useNotificationStore.getState().fetchUnreadCount();

      expect(useNotificationStore.getState().unreadCount).toBe(5);
    });
  });

  describe("setPermissionStatus", () => {
    it("sets permission status", () => {
      useNotificationStore.getState().setPermissionStatus("granted");
      expect(useNotificationStore.getState().permissionStatus).toBe("granted");
    });
  });
});
