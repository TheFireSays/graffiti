// Fix for Expo SDK 55 winter runtime globals
// These must be defined before expo/runtime.native.ts tries to lazily install them
if (typeof globalThis.__ExpoImportMetaRegistry === "undefined") {
  globalThis.__ExpoImportMetaRegistry = {
    register: () => {},
    get: () => ({}),
  };
}
if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-camera
jest.mock("expo-camera", () => ({
  CameraView: "CameraView",
  useCameraPermissions: jest.fn(() => [{ granted: false }, jest.fn()]),
}));

// Mock expo-location
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 30.2672, longitude: -97.7431, heading: 180 },
  }),
  watchPositionAsync: jest.fn().mockResolvedValue({ remove: jest.fn() }),
  Accuracy: { Balanced: 3 },
}));

// Mock react-native-maps
jest.mock("react-native-maps", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: View,
    Marker: View,
    Polygon: View,
    PROVIDER_GOOGLE: "google",
  };
});

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: "ExponentPushToken[mock]" }),
  setNotificationHandler: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock react-native-url-polyfill
jest.mock("react-native-url-polyfill/auto", () => {});
