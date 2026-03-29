import { useMapStore } from "@/stores/map-store";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(),
    removeChannel: jest.fn(),
  },
}));

jest.mock("@/lib/geo", () => ({
  fetchZonesForMap: jest.fn(),
  fetchTagsForMap: jest.fn(),
  fetchCrews: jest.fn(),
}));

import { fetchZonesForMap, fetchTagsForMap, fetchCrews } from "@/lib/geo";

const mockFetchZones = fetchZonesForMap as jest.Mock;
const mockFetchTags = fetchTagsForMap as jest.Mock;
const mockFetchCrews = fetchCrews as jest.Mock;

function resetStore() {
  useMapStore.setState({
    zones: [],
    tags: [],
    crews: [],
    selectedTag: null,
    isLoading: true,
    realtimeChannel: null,
  });
}

describe("useMapStore", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("has correct defaults", () => {
      const state = useMapStore.getState();
      expect(state.zones).toEqual([]);
      expect(state.tags).toEqual([]);
      expect(state.crews).toEqual([]);
      expect(state.selectedTag).toBeNull();
      expect(state.isLoading).toBe(true);
      expect(state.realtimeChannel).toBeNull();
    });
  });

  describe("loadMapData", () => {
    it("fetches zones, tags, and crews in parallel", async () => {
      const mockZones = [{ id: "z1", name: "Zone A" }];
      const mockTags = [{ id: "t1", lat: 30.0 }];
      const mockCrewData = [{ id: "c1", name: "Crew1" }];

      mockFetchZones.mockResolvedValue(mockZones);
      mockFetchTags.mockResolvedValue(mockTags);
      mockFetchCrews.mockResolvedValue(mockCrewData);

      await useMapStore.getState().loadMapData();

      expect(mockFetchZones).toHaveBeenCalled();
      expect(mockFetchTags).toHaveBeenCalled();
      expect(mockFetchCrews).toHaveBeenCalled();

      const state = useMapStore.getState();
      expect(state.zones).toBe(mockZones);
      expect(state.tags).toBe(mockTags);
      expect(state.crews).toBe(mockCrewData);
      expect(state.isLoading).toBe(false);
    });

    it("sets isLoading to true while fetching", async () => {
      useMapStore.setState({ isLoading: false });
      mockFetchZones.mockResolvedValue([]);
      mockFetchTags.mockResolvedValue([]);
      mockFetchCrews.mockResolvedValue([]);

      const promise = useMapStore.getState().loadMapData();
      expect(useMapStore.getState().isLoading).toBe(true);
      await promise;
      expect(useMapStore.getState().isLoading).toBe(false);
    });
  });

  describe("selectTag", () => {
    it("sets the selected tag", () => {
      const tag = { id: "t1", lat: 30.0 } as any;
      useMapStore.getState().selectTag(tag);
      expect(useMapStore.getState().selectedTag).toBe(tag);
    });

    it("clears the selected tag with null", () => {
      useMapStore.setState({ selectedTag: { id: "t1" } as any });
      useMapStore.getState().selectTag(null);
      expect(useMapStore.getState().selectedTag).toBeNull();
    });
  });

  describe("subscribeToChanges", () => {
    it("creates a realtime channel", () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
      };
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      useMapStore.getState().subscribeToChanges();

      expect(supabase.channel).toHaveBeenCalledWith("map-changes");
      expect(mockChannel.on).toHaveBeenCalledTimes(2);
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(useMapStore.getState().realtimeChannel).toBe(mockChannel);
    });

    it("does not re-subscribe if already subscribed", () => {
      useMapStore.setState({ realtimeChannel: {} as any });
      useMapStore.getState().subscribeToChanges();
      expect(supabase.channel).not.toHaveBeenCalled();
    });
  });

  describe("unsubscribe", () => {
    it("removes channel and clears state", () => {
      const mockChannel = {} as any;
      useMapStore.setState({ realtimeChannel: mockChannel });

      useMapStore.getState().unsubscribe();

      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
      expect(useMapStore.getState().realtimeChannel).toBeNull();
    });

    it("does nothing if no channel", () => {
      useMapStore.getState().unsubscribe();
      expect(supabase.removeChannel).not.toHaveBeenCalled();
    });
  });
});
