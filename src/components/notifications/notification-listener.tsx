import { useEffect, useCallback } from "react";
import { useNotificationStore } from "../../stores/notification-store";
import { useRealtime } from "../../hooks/use-realtime";
import { useAuthStore } from "../../stores/auth-store";

export function NotificationListener() {
  const session = useAuthStore((s) => s.session);
  const fetchNotifications = useNotificationStore(
    (s) => s.fetchNotifications
  );
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session, fetchNotifications]);

  const handleNewNotification = useCallback(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  useRealtime({
    table: "notification_queue",
    event: "INSERT",
    onEvent: handleNewNotification,
    enabled: !!session,
  });

  return null;
}
