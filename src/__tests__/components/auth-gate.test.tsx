import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/stores/auth-store";

// Mock expo-router — use require inside factory to avoid out-of-scope variable error
jest.mock("expo-router", () => {
  const { View } = require("react-native");
  return {
    Slot: () => <View testID="slot" />,
    useRouter: () => ({ replace: jest.fn() }),
    useSegments: () => [],
  };
});

// Mock expo-status-bar
jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

// Mock supabase
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    rpc: jest.fn().mockResolvedValue({ data: { success: true }, error: null }),
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    }),
    removeChannel: jest.fn(),
  },
}));

// Import the component after mocks
import RootLayout from "@/app/_layout";

describe("RootLayout (Auth Gate)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("true");
  });

  it("shows loading indicator when isLoading is true", () => {
    useAuthStore.setState({ isLoading: true, session: null });
    const { queryByTestId } = render(<RootLayout />);

    // Slot should NOT be present during loading
    expect(queryByTestId("slot")).toBeNull();
  });

  it("renders Slot when loading is complete", async () => {
    useAuthStore.setState({ isLoading: false, session: null });
    const { getByTestId } = render(<RootLayout />);

    await waitFor(() => {
      expect(getByTestId("slot")).toBeTruthy();
    });
  });

  it("renders without crashing when session exists", async () => {
    useAuthStore.setState({
      isLoading: false,
      session: { user: { id: "u1" }, access_token: "token" } as any,
      needsOnboarding: false,
    });

    const { getByTestId } = render(<RootLayout />);
    await waitFor(() => {
      expect(getByTestId("slot")).toBeTruthy();
    });
  });

  it("renders without crashing when onboarding is needed", async () => {
    useAuthStore.setState({
      isLoading: false,
      session: { user: { id: "u1" }, access_token: "token" } as any,
      needsOnboarding: true,
    });

    const { getByTestId } = render(<RootLayout />);
    await waitFor(() => {
      expect(getByTestId("slot")).toBeTruthy();
    });
  });

  it("shows loading when AsyncStorage has not resolved yet", () => {
    // Make AsyncStorage hang
    (AsyncStorage.getItem as jest.Mock).mockReturnValue(new Promise(() => {}));
    useAuthStore.setState({ isLoading: false, session: null });
    const { queryByTestId } = render(<RootLayout />);

    // Slot should NOT be present while waiting for AsyncStorage
    expect(queryByTestId("slot")).toBeNull();
  });
});
