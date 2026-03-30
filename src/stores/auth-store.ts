import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/types/database";
import { DEMO_MODE } from "../lib/config";
import { mockUser, mockSession } from "../lib/mock-data";

type AppUser = Database["public"]["Tables"]["users"]["Row"];

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: AppUser | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  isEmailVerified: boolean;
  socialLoginLoading: "google" | "apple" | "facebook" | null;
  socialLoginError: string | null;
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  completeOnboarding: () => void;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  changePassword: (newPassword: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  clearSocialLoginError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  needsOnboarding: false,
  isEmailVerified: false,
  socialLoginLoading: null,
  socialLoginError: null,

  setSession: (session) => {
    if (DEMO_MODE) {
      set({
        session: mockSession as any,
        user: mockSession.user as any,
        profile: mockUser as unknown as AppUser,
        isLoading: false,
        needsOnboarding: false,
        isEmailVerified: true,
      });
      return;
    }
    set({
      session,
      user: session?.user ?? null,
      isLoading: false,
    });
    if (session?.user) {
      get().fetchProfile();
    } else {
      set({ profile: null, needsOnboarding: false, isEmailVerified: false });
    }
  },

  fetchProfile: async () => {
    if (DEMO_MODE) {
      set({
        profile: mockUser as unknown as AppUser,
        needsOnboarding: false,
        isEmailVerified: true,
      });
      return;
    }

    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      const emailPrefix = user.email
        ? user.email.split("@")[0]
        : null;
      const needsOnboarding = emailPrefix !== null && data.username === emailPrefix;

      // Check email verification from the session JWT
      const emailVerified =
        user.email_confirmed_at != null ||
        user.confirmed_at != null;

      set({ profile: data, needsOnboarding, isEmailVerified: emailVerified });
    }
  },

  completeOnboarding: () => {
    set({ needsOnboarding: false });
  },

  signOut: async () => {
    if (!DEMO_MODE) {
      await supabase.auth.signOut();
    }
    set({
      session: null,
      user: null,
      profile: null,
      needsOnboarding: false,
      isEmailVerified: false,
    });
  },

  resetPassword: async (email: string) => {
    if (DEMO_MODE) {
      return {};
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "graffiti://reset-password",
    });
    return error ? { error: error.message } : {};
  },

  changePassword: async (newPassword: string) => {
    if (DEMO_MODE) {
      return {};
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return error ? { error: error.message } : {};
  },

  signInWithGoogle: async () => {
    set({ socialLoginLoading: "google", socialLoginError: null });

    if (DEMO_MODE) {
      set({
        session: mockSession as any,
        user: mockSession.user as any,
        profile: mockUser as unknown as AppUser,
        isLoading: false,
        needsOnboarding: true,
        socialLoginLoading: null,
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "graffiti://auth/callback",
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error("No OAuth URL returned");

      if (Platform.OS === "web") {
        // On web, open in same window
        window.location.href = data.url;
      } else {
        // On native, use expo-web-browser
        const WebBrowser = require("expo-web-browser");
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          "graffiti://auth/callback",
        );

        if (result.type === "success" && result.url) {
          const url = new URL(result.url);
          // Tokens can be in hash fragment or query params
          const params = new URLSearchParams(
            url.hash ? url.hash.substring(1) : url.search.substring(1),
          );
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
          }
        }
      }

      set({ socialLoginLoading: null });
    } catch (err: any) {
      set({
        socialLoginLoading: null,
        socialLoginError: err?.message ?? "Google sign-in failed",
      });
    }
  },

  signInWithApple: async () => {
    set({ socialLoginLoading: "apple", socialLoginError: null });

    if (DEMO_MODE) {
      set({
        session: mockSession as any,
        user: mockSession.user as any,
        profile: mockUser as unknown as AppUser,
        isLoading: false,
        needsOnboarding: true,
        socialLoginLoading: null,
      });
      return;
    }

    try {
      const AppleAuthentication = require("expo-apple-authentication");
      const Crypto = require("expo-crypto");

      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        throw new Error("No identity token from Apple");
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
        nonce: rawNonce,
      });

      if (error) throw error;

      set({ socialLoginLoading: null });
    } catch (err: any) {
      // User cancelled Apple sign-in
      if (err?.code === "ERR_REQUEST_CANCELED") {
        set({ socialLoginLoading: null });
        return;
      }
      set({
        socialLoginLoading: null,
        socialLoginError: err?.message ?? "Apple sign-in failed",
      });
    }
  },

  signInWithFacebook: async () => {
    set({ socialLoginLoading: "facebook", socialLoginError: null });

    if (DEMO_MODE) {
      set({
        session: mockSession as any,
        user: mockSession.user as any,
        profile: mockUser as unknown as AppUser,
        isLoading: false,
        needsOnboarding: true,
        socialLoginLoading: null,
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: "graffiti://auth/callback",
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error("No OAuth URL returned");

      if (Platform.OS === "web") {
        // On web, open in same window
        window.location.href = data.url;
      } else {
        // On native, use expo-web-browser
        const WebBrowser = require("expo-web-browser");
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          "graffiti://auth/callback",
        );

        if (result.type === "success" && result.url) {
          const url = new URL(result.url);
          // Tokens can be in hash fragment or query params
          const params = new URLSearchParams(
            url.hash ? url.hash.substring(1) : url.search.substring(1),
          );
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
          }
        }
      }

      set({ socialLoginLoading: null });
    } catch (err: any) {
      set({
        socialLoginLoading: null,
        socialLoginError: err?.message ?? "Facebook sign-in failed",
      });
    }
  },

  clearSocialLoginError: () => {
    set({ socialLoginError: null });
  },
}));
