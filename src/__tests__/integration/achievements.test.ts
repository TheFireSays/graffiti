import { placeTag } from "@/lib/tag-placement";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/offline-queue", () => ({
  enqueue: jest.fn().mockResolvedValue({ id: "q_test", request: {}, timestamp: Date.now(), status: "queued" }),
  getQueue: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("Achievements integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("place_tag_scored returns newly_unlocked achievements", async () => {
    const newlyUnlocked = [
      {
        id: "ach-1",
        name: "First Tag",
        description: "Place your first tag",
        icon: "🎨",
        rarity: "common",
        reward_xp: 50,
        reward_spray: 5,
      },
    ];

    mockRpc.mockResolvedValue({
      data: {
        success: true,
        tag_id: "new-tag-id",
        xp_earned: 10,
        spray_cost: 0,
        spray_earned: 2,
        new_xp: 110,
        new_level: 2,
        new_spray_cans: 12,
        leveled_up: true,
        zone_id: "zone-1",
        is_new_zone: true,
        is_contested: false,
        newly_unlocked: newlyUnlocked,
      },
      error: null,
    });

    const result = await placeTag({
      tagImageId: "b1000000-0000-0000-0000-000000000001",
      customColors: { fill: "#FF0000" },
      latitude: 30.2672,
      longitude: -97.7431,
      compassHeading: 180,
    });

    expect(result.success).toBe(true);
    expect(result.newlyUnlocked).toHaveLength(1);
    expect(result.newlyUnlocked![0].name).toBe("First Tag");
  });

  it("returns empty newly_unlocked when no achievements earned", async () => {
    mockRpc.mockResolvedValue({
      data: {
        success: true,
        tag_id: "new-tag-id",
        xp_earned: 10,
        spray_cost: 0,
        spray_earned: 2,
        new_xp: 110,
        new_level: 1,
        new_spray_cans: 12,
        leveled_up: false,
        zone_id: null,
        is_new_zone: false,
        is_contested: false,
        newly_unlocked: [],
      },
      error: null,
    });

    const result = await placeTag({
      tagImageId: "b1000000-0000-0000-0000-000000000001",
      customColors: { fill: "#FF0000" },
      latitude: 30.2672,
      longitude: -97.7431,
      compassHeading: 180,
    });

    expect(result.success).toBe(true);
    expect(result.newlyUnlocked).toHaveLength(0);
  });

  it("handles missing newly_unlocked field gracefully", async () => {
    mockRpc.mockResolvedValue({
      data: {
        success: true,
        tag_id: "new-tag-id",
        xp_earned: 10,
        spray_cost: 0,
        spray_earned: 2,
        new_xp: 110,
        new_level: 1,
        new_spray_cans: 12,
        leveled_up: false,
        zone_id: null,
        is_new_zone: false,
        is_contested: false,
        // no newly_unlocked field — backward compat
      },
      error: null,
    });

    const result = await placeTag({
      tagImageId: "b1000000-0000-0000-0000-000000000001",
      customColors: { fill: "#FF0000" },
      latitude: 30.2672,
      longitude: -97.7431,
      compassHeading: 180,
    });

    expect(result.success).toBe(true);
    expect(result.newlyUnlocked).toEqual([]);
  });
});
