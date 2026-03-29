import { supabase } from "./supabase";

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface MapTag {
  id: string;
  latitude: number;
  longitude: number;
  compassHeading: number;
  status: string;
  crewId: string | null;
  crewColor: string | null;
  crewAbbreviation: string | null;
  userId: string;
  username: string;
  tagImageName: string;
  tagCategory: string;
  createdAt: string;
}

export interface MapZone {
  id: string;
  name: string;
  coordinates: MapCoordinate[];
  controllingCrewId: string | null;
  controllingCrewColor: string | null;
  controllingCrewAbbreviation: string | null;
  tagCounts: Record<string, number>;
}

export interface MapCrew {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
}

export async function fetchZonesForMap(): Promise<MapZone[]> {
  const { data, error } = await supabase.rpc("get_zones_for_map");
  if (error) {
    console.error("Failed to fetch zones:", error);
    return [];
  }
  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    coordinates: parsePolygonCoordinates(row.boundary_geojson),
    controllingCrewId: row.controlling_crew_id,
    controllingCrewColor: row.crew_color,
    controllingCrewAbbreviation: row.crew_abbreviation,
    tagCounts: row.tag_counts ?? {},
  }));
}

export async function fetchTagsForMap(): Promise<MapTag[]> {
  const { data, error } = await supabase.rpc("get_tags_for_map");
  if (error) {
    console.error("Failed to fetch tags:", error);
    return [];
  }
  return (data ?? []).map((row: any) => ({
    id: row.id,
    latitude: row.lat,
    longitude: row.lng,
    compassHeading: row.compass_heading,
    status: row.status,
    crewId: row.crew_id,
    crewColor: row.crew_color,
    crewAbbreviation: row.crew_abbreviation,
    userId: row.user_id,
    username: row.username,
    tagImageName: row.tag_image_name,
    tagCategory: row.tag_category,
    createdAt: row.created_at,
  }));
}

export async function fetchCrews(): Promise<MapCrew[]> {
  const { data, error } = await supabase
    .from("crews")
    .select("id, name, abbreviation, color");
  if (error) {
    console.error("Failed to fetch crews:", error);
    return [];
  }
  return data ?? [];
}

function parsePolygonCoordinates(geojson: string): MapCoordinate[] {
  try {
    const parsed = JSON.parse(geojson);
    const ring = parsed.coordinates[0];
    return ring.map(([lng, lat]: [number, number]) => ({
      latitude: lat,
      longitude: lng,
    }));
  } catch {
    return [];
  }
}
