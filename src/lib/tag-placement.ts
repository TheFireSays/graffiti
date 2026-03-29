import { supabase } from "./supabase";

interface PlacementRequest {
  userId: string;
  crewId: string | null;
  tagImageId: string;
  customColors: Record<string, string>;
  latitude: number;
  longitude: number;
  compassHeading: number;
}

interface PlacementResult {
  success: boolean;
  error?: string;
  tagId?: string;
}

export async function placeTag(req: PlacementRequest): Promise<PlacementResult> {
  // 1. Check restricted zones
  const { data: restricted } = await supabase.rpc("check_restricted_zone", {
    p_lng: req.longitude,
    p_lat: req.latitude,
  });

  if (restricted && restricted.length > 0) {
    const zone = restricted[0];
    return {
      success: false,
      error: `Cannot tag near ${zone.zone_name} (${zone.zone_category})`,
    };
  }

  // 2. Find the zone this point falls in
  const { data: zoneId } = await supabase.rpc("find_zone_for_point", {
    p_lng: req.longitude,
    p_lat: req.latitude,
  });

  // 3. Insert the tag
  const { data: tag, error: insertError } = await supabase
    .from("tags")
    .insert({
      user_id: req.userId,
      crew_id: req.crewId,
      tag_image_id: req.tagImageId,
      custom_colors: req.customColors,
      location: `SRID=4326;POINT(${req.longitude} ${req.latitude})`,
      compass_heading: req.compassHeading,
      zone_id: zoneId ?? null,
      status: "active",
    })
    .select("id")
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return { success: true, tagId: tag.id };
}
