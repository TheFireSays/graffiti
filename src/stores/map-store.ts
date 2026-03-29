import { create } from "zustand";
import {
  MapZone,
  MapTag,
  MapCrew,
  fetchZonesForMap,
  fetchTagsForMap,
  fetchCrews,
} from "../lib/geo";

interface MapState {
  zones: MapZone[];
  tags: MapTag[];
  crews: MapCrew[];
  selectedTag: MapTag | null;
  isLoading: boolean;
  loadMapData: () => Promise<void>;
  selectTag: (tag: MapTag | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  zones: [],
  tags: [],
  crews: [],
  selectedTag: null,
  isLoading: true,

  loadMapData: async () => {
    set({ isLoading: true });
    const [zones, tags, crews] = await Promise.all([
      fetchZonesForMap(),
      fetchTagsForMap(),
      fetchCrews(),
    ]);
    set({ zones, tags, crews, isLoading: false });
  },

  selectTag: (tag) => {
    set({ selectedTag: tag });
  },
}));
