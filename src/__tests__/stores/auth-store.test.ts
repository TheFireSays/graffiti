import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      signOut: jest.fn(),
    },
  },
}));

const mockFrom = supabase.from as jest.Mock;
const mockSignOut = supabase.auth.signOut as jest.Mock;

function resetStore() {
  useAuthStore.setState({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    needsOnboarding: false,
  });
}

describe("useAuthStore", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("has correct defaults", () => {
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.isLoading).toBe(true);
      expect(state.needsOnboarding).toBe(false);
    });
  });

  describe("setSession", () => {
    it("sets session and user, clears loading", () => {
      const mockSession = {
        user: { id: "u1", email: "test@example.com" },
        access_token: "token",
      } as any;

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
      });

      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState();
      expect(state.session).toBe(mockSession);
      expect(state.user).toBe(mockSession.user);
      expect(state.isLoading).toBe(false);
    });

    it("clears profile and onboarding when session is null", () => {
      useAuthStore.setState({ profile: { id: "u1" } as any, needsOnboarding: true });
      useAuthStore.getState().setSession(null);
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.needsOnboarding).toBe(false);
    });
  });

  describe("fetchProfile", () => {
    it("fetches and sets profile when user exists", async () => {
      const mockProfile = {
        id: "u1",
        username: "tagger1",
        display_name: "Tagger One",
        level: 5,
        xp: 1000,
        spray_cans: 10,
      };

      useAuthStore.setState({
        user: { id: "u1", email: "someone@example.com" } as any,
      });

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      });

      await useAuthStore.getState().fetchProfile();
      expect(useAuthStore.getState().profile).toBe(mockProfile);
      // username "tagger1" !== email prefix "someone" → no onboarding needed
      expect(useAuthStore.getState().needsOnboarding).toBe(false);
    });

    it("detects onboarding needed when username matches email prefix", async () => {
      const mockProfile = {
        id: "u1",
        username: "newuser",
      };

      useAuthStore.setState({
        user: { id: "u1", email: "newuser@example.com" } as any,
      });

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      });

      await useAuthStore.getState().fetchProfile();
      expect(useAuthStore.getState().needsOnboarding).toBe(true);
    });

    it("does nothing when no user", async () => {
      await useAuthStore.getState().fetchProfile();
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe("completeOnboarding", () => {
    it("sets needsOnboarding to false", () => {
      useAuthStore.setState({ needsOnboarding: true });
      useAuthStore.getState().completeOnboarding();
      expect(useAuthStore.getState().needsOnboarding).toBe(false);
    });
  });

  describe("signOut", () => {
    it("calls supabase signOut and clears state", async () => {
      mockSignOut.mockResolvedValue({ error: null });

      useAuthStore.setState({
        session: { user: { id: "u1" } } as any,
        user: { id: "u1" } as any,
        profile: { id: "u1" } as any,
        needsOnboarding: true,
      });

      await useAuthStore.getState().signOut();
      const state = useAuthStore.getState();
      expect(mockSignOut).toHaveBeenCalled();
      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.needsOnboarding).toBe(false);
    });
  });
});
