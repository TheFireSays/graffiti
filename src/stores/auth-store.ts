import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
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
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  completeOnboarding: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  needsOnboarding: false,

  setSession: (session) => {
    if (DEMO_MODE) {
      set({
        session: mockSession as any,
        user: mockSession.user as any,
        profile: mockUser as unknown as AppUser,
        isLoading: false,
        needsOnboarding: false,
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
      set({ profile: null, needsOnboarding: false });
    }
  },

  fetchProfile: async () => {
    if (DEMO_MODE) {
      set({ profile: mockUser as unknown as AppUser, needsOnboarding: false });
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
      set({ profile: data, needsOnboarding });
    }
  },

  completeOnboarding: () => {
    set({ needsOnboarding: false });
  },

  signOut: async () => {
    if (!DEMO_MODE) {
      await supabase.auth.signOut();
    }
    set({ session: null, user: null, profile: null, needsOnboarding: false });
  },
}));
