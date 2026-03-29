import { create } from "zustand";
import { supabase } from "../lib/supabase";

interface Notification {
  id: string;
  event_type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  pushToken: string | null;
  permissionStatus: string | null;
  isLoading: boolean;
  error: string | null;

  registerToken: (
    token: string,
    platform: string
  ) => Promise<{ success: boolean; error?: string }>;
  unregisterToken: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (ids: string[]) => Promise<void>;
  setPermissionStatus: (status: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pushToken: null,
  permissionStatus: null,
  isLoading: false,
  error: null,

  registerToken: async (token, platform) => {
    const { data, error } = await supabase.rpc("register_push_token", {
      p_token: token,
      p_platform: platform,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const result = data as { success: boolean; error?: string };
    if (!result.success) {
      return { success: false, error: result.error };
    }

    set({ pushToken: token });
    return { success: true };
  },

  unregisterToken: async () => {
    const { pushToken } = get();
    if (!pushToken) return;

    await supabase.rpc("unregister_push_token", {
      p_token: pushToken,
    });

    set({ pushToken: null });
  },

  fetchNotifications: async () => {
    set({ isLoading: true });

    const { data, error } = await supabase
      .from("notification_queue")
      .select("*")
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }

    set({
      notifications: (data ?? []) as Notification[],
      unreadCount: (data ?? []).length,
      isLoading: false,
      error: null,
    });
  },

  fetchUnreadCount: async () => {
    const { data, error } = await supabase.rpc(
      "get_unread_notification_count"
    );

    if (!error && data !== null) {
      set({ unreadCount: data as number });
    }
  },

  markAsRead: async (ids) => {
    const { data, error } = await supabase.rpc("mark_notifications_read", {
      p_notification_ids: ids,
    });

    if (!error) {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          ids.includes(n.id) ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(
          0,
          state.unreadCount -
            state.notifications.filter(
              (n) => ids.includes(n.id) && !n.is_read
            ).length
        ),
      }));
    }
  },

  setPermissionStatus: (status) => {
    set({ permissionStatus: status });
  },
}));
