import { supabase } from "./supabase";
import { DEMO_MODE } from "./config";

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
  queued?: boolean;
  tagId?: string;
  xpEarned?: number;
  sprayCost?: number;
  sprayEarned?: number;
  newXp?: number;
  newLevel?: number;
  newSprayCans?: number;
  leveledUp?: boolean;
}

function isNetworkError(error?: string): boolean {
  if (!error) return false;
  const networkPatterns = ["network", "fetch", "timeout", "econnrefused", "err_network"];
  return networkPatterns.some((p) => error.toLowerCase().includes(p));
}

export async function placeTagDirect(req: PlacementRequest): Promise<PlacementResult> {
  if (DEMO_MODE) {
    return {
      success: true,
      tagId: `demo-tag-${Date.now()}`,
      xpEarned: 25,
      sprayCost: 1,
      sprayEarned: 0,
      newXp: 2425,
      newLevel: 12,
      newSprayCans: 44,
      leveledUp: false,
    };
  }
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

export async function placeTag(req: PlacementRequest): Promise<PlacementResult> {
  const result = await placeTagDirect(req);

  if (!result.success && !DEMO_MODE && isNetworkError(result.error)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { enqueue } = require("./offline-queue") as { enqueue: (req: PlacementRequest) => Promise<void> };
    await enqueue(req);
    return { success: false, error: "Tag queued for sync when online", queued: true };
  }

  return result;
}
