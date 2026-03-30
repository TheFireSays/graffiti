import { Platform } from "react-native";

export const DEMO_MODE =
  process.env.EXPO_PUBLIC_DEMO_MODE === "true" || Platform.OS === "web";

export const DEMO_LOCATION = {
  latitude: 30.2672,
  longitude: -97.7431,
  heading: 180,
};
