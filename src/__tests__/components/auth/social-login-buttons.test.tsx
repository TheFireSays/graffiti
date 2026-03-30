import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Platform } from "react-native";
import { SocialLoginButtons } from "../../../components/auth/social-login-buttons";

// Mock the auth store
const mockSignInWithGoogle = jest.fn();
const mockSignInWithApple = jest.fn();
const mockClearSocialLoginError = jest.fn();

let mockStoreState = {
  socialLoginLoading: null as "google" | "apple" | null,
  socialLoginError: null as string | null,
  signInWithGoogle: mockSignInWithGoogle,
  signInWithApple: mockSignInWithApple,
  clearSocialLoginError: mockClearSocialLoginError,
};

jest.mock("../../../stores/auth-store", () => ({
  useAuthStore: (selector: (state: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
}));

describe("SocialLoginButtons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState = {
      socialLoginLoading: null,
      socialLoginError: null,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithApple: mockSignInWithApple,
      clearSocialLoginError: mockClearSocialLoginError,
    };
  });

  it("renders Google sign-in button", () => {
    const { getByTestId, getByText } = render(<SocialLoginButtons />);
    expect(getByTestId("google-sign-in-button")).toBeTruthy();
    expect(getByText("Continue with Google")).toBeTruthy();
  });

  it("renders 'or' divider", () => {
    const { getByText } = render(<SocialLoginButtons />);
    expect(getByText("or")).toBeTruthy();
  });

  it("calls signInWithGoogle when Google button is pressed", () => {
    const { getByTestId } = render(<SocialLoginButtons />);
    fireEvent.press(getByTestId("google-sign-in-button"));
    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("shows Apple button only on iOS", () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, "OS", { value: "ios", writable: true });

    const { getByTestId } = render(<SocialLoginButtons />);
    expect(getByTestId("apple-sign-in-button")).toBeTruthy();

    Object.defineProperty(Platform, "OS", {
      value: originalPlatform,
      writable: true,
    });
  });

  it("hides Apple button on Android", () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, "OS", {
      value: "android",
      writable: true,
    });

    const { queryByTestId } = render(<SocialLoginButtons />);
    expect(queryByTestId("apple-sign-in-button")).toBeNull();

    Object.defineProperty(Platform, "OS", {
      value: originalPlatform,
      writable: true,
    });
  });

  it("hides Apple button on web", () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, "OS", { value: "web", writable: true });

    const { queryByTestId } = render(<SocialLoginButtons />);
    expect(queryByTestId("apple-sign-in-button")).toBeNull();

    Object.defineProperty(Platform, "OS", {
      value: originalPlatform,
      writable: true,
    });
  });

  it("calls signInWithApple when Apple button is pressed on iOS", () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, "OS", { value: "ios", writable: true });

    const { getByTestId } = render(<SocialLoginButtons />);
    fireEvent.press(getByTestId("apple-sign-in-button"));
    expect(mockSignInWithApple).toHaveBeenCalledTimes(1);

    Object.defineProperty(Platform, "OS", {
      value: originalPlatform,
      writable: true,
    });
  });

  it("displays error message when socialLoginError is set", () => {
    mockStoreState.socialLoginError = "Something went wrong";
    const { getByText } = render(<SocialLoginButtons />);
    expect(getByText("Something went wrong")).toBeTruthy();
  });

  it("clears error when error message is pressed", () => {
    mockStoreState.socialLoginError = "Something went wrong";
    const { getByText } = render(<SocialLoginButtons />);
    fireEvent.press(getByText("Something went wrong"));
    expect(mockClearSocialLoginError).toHaveBeenCalledTimes(1);
  });

  it("disables buttons during Google loading", () => {
    mockStoreState.socialLoginLoading = "google";
    const { getByTestId } = render(<SocialLoginButtons />);
    const googleButton = getByTestId("google-sign-in-button");
    expect(googleButton.props.accessibilityState?.disabled).toBe(true);
  });

  it("disables buttons during Apple loading", () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, "OS", { value: "ios", writable: true });

    mockStoreState.socialLoginLoading = "apple";
    const { getByTestId } = render(<SocialLoginButtons />);
    const appleButton = getByTestId("apple-sign-in-button");
    expect(appleButton.props.accessibilityState?.disabled).toBe(true);

    Object.defineProperty(Platform, "OS", {
      value: originalPlatform,
      writable: true,
    });
  });
});
