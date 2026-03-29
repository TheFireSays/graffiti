import { placeTag } from "@/lib/tag-placement";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("placeTag (place_tag_scored RPC)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseRequest = {
    tagImageId: "b1000000-0000-0000-0000-000000000001",
    customColors: { fill: "#FF0000" },
    latitude: 30.2672,
    longitude: -97.7431,
    compassHeading: 180,
  };

  it("places a tag on an empty zone and returns XP + spray data", async () => {
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
      },
      error: null,
    });

    const result = await placeTag(baseRequest);

    expect(mockRpc).toHaveBeenCalledWith("place_tag_scored", {
      p_tag_image_id: baseRequest.tagImageId,
      p_custom_colors: baseRequest.customColors,
      p_lng: baseRequest.longitude,
      p_lat: baseRequest.latitude,
      p_compass_heading: baseRequest.compassHeading,
      p_go_over_tag_id: undefined,
    });

    expect(result.success).toBe(true);
    expect(result.tagId).toBe("new-tag-id");
    expect(result.xpEarned).toBe(10);
    expect(result.sprayCost).toBe(0);
    expect(result.sprayEarned).toBe(2);
    expect(result.newLevel).toBe(2);
    expect(result.leveledUp).toBe(true);
  });

  it("places a tag going over an existing tag", async () => {
    mockRpc.mockResolvedValue({
      data: {
        success: true,
        tag_id: "go-over-tag-id",
        xp_earned: 15,
        spray_cost: 3,
        spray_earned: 2,
        new_xp: 125,
        new_level: 2,
        new_spray_cans: 9,
        leveled_up: false,
      },
      error: null,
    });

    const result = await placeTag({
      ...baseRequest,
      goOverTagId: "existing-tag-id",
    });

    expect(mockRpc).toHaveBeenCalledWith("place_tag_scored", expect.objectContaining({
      p_go_over_tag_id: "existing-tag-id",
    }));

    expect(result.success).toBe(true);
    expect(result.sprayCost).toBe(3);
  });

  it("returns error when RPC fails at network level", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "Network error" },
    });

    const result = await placeTag(baseRequest);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Network error");
  });

  it("returns error when RPC returns business logic failure", async () => {
    mockRpc.mockResolvedValue({
      data: {
        success: false,
        error: "Insufficient spray cans",
      },
      error: null,
    });

    const result = await placeTag(baseRequest);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Insufficient spray cans");
  });

  it("returns error for restricted zone placement", async () => {
    mockRpc.mockResolvedValue({
      data: {
        success: false,
        error: "Cannot place tags in restricted zones",
      },
      error: null,
    });

    const result = await placeTag(baseRequest);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Cannot place tags in restricted zones");
  });

  it("handles missing goOverTagId as undefined", async () => {
    mockRpc.mockResolvedValue({
      data: { success: true, tag_id: "t1", xp_earned: 10, spray_cost: 0, spray_earned: 2, new_xp: 10, new_level: 1, new_spray_cans: 12, leveled_up: false },
      error: null,
    });

    await placeTag(baseRequest);

    expect(mockRpc).toHaveBeenCalledWith("place_tag_scored", expect.objectContaining({
      p_go_over_tag_id: undefined,
    }));
  });
});
