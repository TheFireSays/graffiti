import { create } from "zustand";
import {
  MapZone,
  MapTag,
  MapCrew,
  fetchZonesForMap,
  fetchTagsForMap,
  fetchCrews,
} from "../lib/geo";
import { supabase } from "../lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface MapState {
  zones: MapZone[];
  tags: MapTag[];
  crews: MapCrew[];
  selectedTag: MapTag | null;
  selectedZone: MapZone | null;
  isLoading: boolean;
  realtimeChannel: RealtimeChannel | null;
  loadMapData: () => Promise<void>;
  selectTag: (tag: MapTag | null) => void;
  selectZone: (zone: MapZone | null) => void;
  subscribeToChanges: () => void;
  unsubscribe: () => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  zones: [],
  tags: [],
  crews: [],
  selectedTag: null,
  selectedZone: null,
  isLoading: true,
  realtimeChannel: null,

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
    set({ selectedTag: tag, selectedZone: null });
  },

  selectZone: (zone) => {
    set({ selectedZone: zone, selectedTag: null });
  },

  subscribeToChanges: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) return; // already subscribed

    const channel = supabase
      .channel("map-changes")
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "tags" },
        () => {
          // Debounce: reload after a short delay to batch rapid changes
          get().loadMapData();
        }
      )
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "zones" },
        () => {
          get().loadMapData();
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  unsubscribe: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null });
    }
  },
}));
