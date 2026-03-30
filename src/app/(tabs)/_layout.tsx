import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { trackEvent } from "../../lib/analytics";

export default function TabLayout() {
  return (
    <Tabs
      screenListeners={{
        tabPress: (e) => {
          trackEvent("screen_viewed", { screen: e.target?.split("-")[0] ?? "unknown" });
        },
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4ecdc4",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#0d0d1a",
          borderTopColor: "#222",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tag"
        options={{
          title: "Tag",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="crew"
        options={{
          title: "Crew",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
