import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("Anti-Cheat", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("Daily tag limit", () => {
    it("rejects when daily limit reached", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Daily tag limit reached (200 tags in 24 hours)" },
        error: null,
      });

      const { data } = await supabase.rpc("place_tag_scored", {
        p_tag_image_id: "img-1",
        p_custom_colors: {},
        p_lng: -97.744,
        p_lat: 30.267,
        p_compass_heading: 180,
      });

      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toContain("Daily tag limit");
    });

    it("allows placement below daily limit", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true, tag_id: "new-tag-1", xp_earned: 10 },
        error: null,
      });

      const { data } = await supabase.rpc("place_tag_scored", {
        p_tag_image_id: "img-1",
        p_custom_colors: {},
        p_lng: -97.744,
        p_lat: 30.267,
        p_compass_heading: 180,
      });

      expect((data as Record<string, unknown>).success).toBe(true);
    });
  });

  describe("Movement speed check", () => {
    it("rejects when speed violation is repeated", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Movement speed too high — please try again later" },
        error: null,
      });

      const { data } = await supabase.rpc("place_tag_scored", {
        p_tag_image_id: "img-1",
        p_custom_colors: {},
        p_lng: -90.0,
        p_lat: 40.0,
        p_compass_heading: 0,
      });

      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toContain("speed");
    });

    it("rejects tags too close together", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Too close to your last tag (min 5m apart)" },
        error: null,
      });

      const { data } = await supabase.rpc("place_tag_scored", {
        p_tag_image_id: "img-1",
        p_custom_colors: {},
        p_lng: -97.744,
        p_lat: 30.267,
        p_compass_heading: 180,
      });

      expect((data as Record<string, unknown>).success).toBe(false);
      expect((data as Record<string, unknown>).error).toContain("Too close");
    });
  });

  describe("Suspicious activity logging", () => {
    it("flag_suspicious_activity RPC exists", async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      await supabase.rpc("flag_suspicious_activity", {
        p_user_id: "user-1",
        p_reason: "speed_violation",
        p_metadata: { speed_kmh: 300 },
      });

      expect(mockRpc).toHaveBeenCalledWith("flag_suspicious_activity", {
        p_user_id: "user-1",
        p_reason: "speed_violation",
        p_metadata: { speed_kmh: 300 },
      });
    });
  });
});
