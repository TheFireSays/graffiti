import type { MapTag } from "./geo";

export interface TagCluster {
  id: string;
  latitude: number;
  longitude: number;
  tags: MapTag[];
  count: number;
}

const GRID_SIZE = 60; // pixels

/**
 * Grid-based clustering: divides the visible map region into a grid
 * and groups tags that fall into the same cell.
 */
export function clusterTags(
  tags: MapTag[],
  regionLatDelta: number,
  regionLngDelta: number,
  regionLat: number,
  regionLng: number,
  mapWidth: number = 400
): TagCluster[] {
  if (regionLatDelta < 0.005) {
    // Zoomed in enough — no clustering
    return tags.map((tag) => ({
      id: tag.id,
      latitude: tag.latitude,
      longitude: tag.longitude,
      tags: [tag],
      count: 1,
    }));
  }

  const cellSizeLng = (regionLngDelta / mapWidth) * GRID_SIZE;
  const cellSizeLat = (regionLatDelta / mapWidth) * GRID_SIZE;

  const grid = new Map<string, MapTag[]>();

  for (const tag of tags) {
    const cellX = Math.floor((tag.longitude - regionLng + regionLngDelta / 2) / cellSizeLng);
    const cellY = Math.floor((tag.latitude - regionLat + regionLatDelta / 2) / cellSizeLat);
    const key = `${cellX}:${cellY}`;

    const existing = grid.get(key);
    if (existing) {
      existing.push(tag);
    } else {
      grid.set(key, [tag]);
    }
  }

  const clusters: TagCluster[] = [];
  for (const [key, cellTags] of grid) {
    const avgLat = cellTags.reduce((s, t) => s + t.latitude, 0) / cellTags.length;
    const avgLng = cellTags.reduce((s, t) => s + t.longitude, 0) / cellTags.length;
    clusters.push({
      id: `cluster-${key}`,
      latitude: avgLat,
      longitude: avgLng,
      tags: cellTags,
      count: cellTags.length,
    });
  }

  return clusters;
}
