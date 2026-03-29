import { useTagStore } from "@/stores/tag-store";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockFrom = supabase.from as jest.Mock;

function resetStore() {
  useTagStore.setState({
    tagImages: [],
    isLoadingLibrary: true,
    selectedImage: null,
    customColors: {},
    isPlacing: false,
    placementError: null,
    placementSuccess: false,
  });
}

describe("useTagStore", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("has correct defaults", () => {
      const state = useTagStore.getState();
      expect(state.tagImages).toEqual([]);
      expect(state.isLoadingLibrary).toBe(true);
      expect(state.selectedImage).toBeNull();
      expect(state.customColors).toEqual({});
      expect(state.isPlacing).toBe(false);
      expect(state.placementError).toBeNull();
      expect(state.placementSuccess).toBe(false);
    });
  });

  describe("loadTagLibrary", () => {
    it("fetches tag images filtered by user level", async () => {
      const mockData = [
        {
          id: "img1",
          name: "Basic Tag",
          image_url: "https://example.com/tag.png",
          category: "tag",
          tier: 1,
          customizable_colors: [{ slot: "fill", default: "#FF0000" }],
        },
      ];

      const chain = {
        select: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      // Last order call resolves with data
      chain.order.mockReturnValueOnce(chain).mockResolvedValueOnce({ data: mockData, error: null });
      mockFrom.mockReturnValue(chain);

      await useTagStore.getState().loadTagLibrary(5);

      expect(mockFrom).toHaveBeenCalledWith("tag_images");
      expect(chain.lte).toHaveBeenCalledWith("tier", 5);

      const state = useTagStore.getState();
      expect(state.tagImages).toHaveLength(1);
      expect(state.tagImages[0].name).toBe("Basic Tag");
      expect(state.isLoadingLibrary).toBe(false);
    });

    it("handles error gracefully", async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      chain.order.mockReturnValueOnce(chain).mockResolvedValueOnce({ data: null, error: { message: "fail" } });
      mockFrom.mockReturnValue(chain);

      await useTagStore.getState().loadTagLibrary(1);
      expect(useTagStore.getState().isLoadingLibrary).toBe(false);
      expect(useTagStore.getState().tagImages).toEqual([]);
    });
  });

  describe("selectImage", () => {
    it("sets selected image and populates default colors", () => {
      const image = {
        id: "img1",
        name: "Tag",
        imageUrl: "url",
        category: "tag",
        tier: 1,
        customizableColors: [
          { slot: "fill", default: "#FF0000" },
          { slot: "outline", default: "#000000" },
        ],
      };

      useTagStore.getState().selectImage(image);

      const state = useTagStore.getState();
      expect(state.selectedImage).toBe(image);
      expect(state.customColors).toEqual({
        fill: "#FF0000",
        outline: "#000000",
      });
    });
  });

  describe("setColor", () => {
    it("updates a specific color slot", () => {
      useTagStore.setState({ customColors: { fill: "#FF0000" } });
      useTagStore.getState().setColor("fill", "#00FF00");
      expect(useTagStore.getState().customColors.fill).toBe("#00FF00");
    });

    it("adds a new color slot", () => {
      useTagStore.setState({ customColors: {} });
      useTagStore.getState().setColor("outline", "#FFFFFF");
      expect(useTagStore.getState().customColors.outline).toBe("#FFFFFF");
    });
  });

  describe("clearSelection", () => {
    it("clears image and colors", () => {
      useTagStore.setState({
        selectedImage: { id: "img1" } as any,
        customColors: { fill: "#FF0000" },
      });
      useTagStore.getState().clearSelection();
      expect(useTagStore.getState().selectedImage).toBeNull();
      expect(useTagStore.getState().customColors).toEqual({});
    });
  });

  describe("setPlacing / setPlacementError / setPlacementSuccess", () => {
    it("sets placing state", () => {
      useTagStore.getState().setPlacing(true);
      expect(useTagStore.getState().isPlacing).toBe(true);
    });

    it("sets placement error", () => {
      useTagStore.getState().setPlacementError("GPS unavailable");
      expect(useTagStore.getState().placementError).toBe("GPS unavailable");
    });

    it("sets placement success", () => {
      useTagStore.getState().setPlacementSuccess(true);
      expect(useTagStore.getState().placementSuccess).toBe(true);
    });
  });

  describe("reset", () => {
    it("resets placement state but not library", () => {
      useTagStore.setState({
        selectedImage: { id: "img1" } as any,
        customColors: { fill: "#FF0000" },
        isPlacing: true,
        placementError: "error",
        placementSuccess: true,
        tagImages: [{ id: "img1" } as any],
      });

      useTagStore.getState().reset();

      const state = useTagStore.getState();
      expect(state.selectedImage).toBeNull();
      expect(state.customColors).toEqual({});
      expect(state.isPlacing).toBe(false);
      expect(state.placementError).toBeNull();
      expect(state.placementSuccess).toBe(false);
      // Library should be preserved
      expect(state.tagImages).toHaveLength(1);
    });
  });
});
