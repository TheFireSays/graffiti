import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { useNotificationStore } from "../stores/notification-store";
import { useAuthStore } from "../stores/auth-store";
import { DEMO_MODE } from "../lib/config";

// Only set up notification handler on native
if (Platform.OS !== "web") {
  const Notifications = require("expo-notifications");
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function useNotifications() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const registerToken = useNotificationStore((s) => s.registerToken);
  const setPermissionStatus = useNotificationStore(
    (s) => s.setPermissionStatus
  );
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (!session || DEMO_MODE) return;

    const Notifications = require("expo-notifications");

    async function setup() {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== "granted") return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const platform = Platform.OS === "ios" ? "ios" : "android";
      await registerToken(tokenData.data, platform);

      await fetchUnreadCount();
    }

    setup();
  }, [session, registerToken, setPermissionStatus, fetchUnreadCount]);

  useEffect(() => {
    if (DEMO_MODE) return;

    const Notifications = require("expo-notifications");
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response: any) => {
        const data = response.notification.request.content.data;

        if (data?.zone_id) {
          router.push("/(tabs)");
        } else if (data?.crew_id) {
          router.push("/(tabs)/crew");
        }
      });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);
}
