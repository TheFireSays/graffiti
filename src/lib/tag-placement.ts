import { supabase } from "./supabase";

interface PlacementRequest {
  tagImageId: string;
  customColors: Record<string, string>;
  latitude: number;
  longitude: number;
  compassHeading: number;
  goOverTagId?: string;
}

interface PlacementResult {
  success: boolean;
  error?: string;
  tagId?: string;
  xpEarned?: number;
  sprayCost?: number;
  sprayEarned?: number;
  newXp?: number;
  newLevel?: number;
  newSprayCans?: number;
  leveledUp?: boolean;
}

export async function placeTag(req: PlacementRequest): Promise<PlacementResult> {
  const { data, error } = await supabase.rpc("place_tag_scored", {
    p_tag_image_id: req.tagImageId,
    p_custom_colors: req.customColors,
    p_lng: req.longitude,
    p_lat: req.latitude,
    p_compass_heading: req.compassHeading,
    p_go_over_tag_id: req.goOverTagId ?? undefined,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const result = data as any;

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    tagId: result.tag_id,
    xpEarned: result.xp_earned,
    sprayCost: result.spray_cost,
    sprayEarned: result.spray_earned,
    newXp: result.new_xp,
    newLevel: result.new_level,
    newSprayCans: result.new_spray_cans,
    leveledUp: result.leveled_up,
  };
}
