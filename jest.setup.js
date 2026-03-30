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

// Mock @sentry/react-native
jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  withScope: jest.fn((cb) => cb({ setExtra: jest.fn() })),
}));

// Mock expo-web-browser
jest.mock("expo-web-browser", () => ({
  openAuthSessionAsync: jest.fn().mockResolvedValue({ type: "cancel" }),
  maybeCompleteAuthSession: jest.fn(),
}));

// Mock expo-apple-authentication
jest.mock("expo-apple-authentication", () => ({
  signInAsync: jest.fn().mockResolvedValue({
    identityToken: "mock-apple-identity-token",
    fullName: { givenName: "Test", familyName: "User" },
    email: "test@apple.com",
  }),
  AppleAuthenticationScope: {
    FULL_NAME: 0,
    EMAIL: 1,
  },
}));

// Mock expo-crypto
jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "mock-uuid-1234"),
  digestStringAsync: jest.fn().mockResolvedValue("mock-hashed-nonce"),
  CryptoDigestAlgorithm: {
    SHA256: "SHA-256",
  },
}));

// Mock expo-auth-session
jest.mock("expo-auth-session", () => ({
  makeRedirectUri: jest.fn(() => "graffiti://auth/callback"),
}));

// Mock expo-linking
jest.mock("expo-linking", () => ({
  useURL: jest.fn(() => null),
  createURL: jest.fn((path) => `graffiti://${path}`),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  })),
  useSegments: jest.fn(() => []),
  Link: "Link",
  Slot: "Slot",
}));

// Mock @react-native-async-storage/async-storage with in-memory store
jest.mock("@react-native-async-storage/async-storage", () => {
  const store = {};
  return {
    getItem: jest.fn((key) => Promise.resolve(store[key] ?? null)),
    setItem: jest.fn((key, value) => {
      store[key] = value;
      return Promise.resolve(undefined);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
      return Promise.resolve(undefined);
    }),
  };
});
