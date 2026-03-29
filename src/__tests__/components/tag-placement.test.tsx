// Mock supabase BEFORE any store imports
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

import { useTagStore } from "@/stores/tag-store";

describe("Tag Placement Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTagStore.setState({
      tagImages: [],
      isLoadingLibrary: false,
      selectedImage: null,
      customColors: {},
      isPlacing: false,
      placementError: null,
      placementSuccess: false,
    });
  });

  it("starts with no image selected", () => {
    expect(useTagStore.getState().selectedImage).toBeNull();
  });

  it("can select an image and populate default colors", () => {
    const image = {
      id: "img1",
      name: "Tag",
      imageUrl: "url",
      category: "tag",
      tier: 1,
      customizableColors: [{ slot: "fill", default: "#FF0000" }],
    };

    useTagStore.getState().selectImage(image);

    expect(useTagStore.getState().selectedImage).toBe(image);
    expect(useTagStore.getState().customColors).toEqual({ fill: "#FF0000" });
  });

  it("can set placement to in-progress", () => {
    useTagStore.getState().setPlacing(true);
    expect(useTagStore.getState().isPlacing).toBe(true);
  });

  it("can report placement error", () => {
    useTagStore.getState().setPlacementError("GPS signal lost");
    expect(useTagStore.getState().placementError).toBe("GPS signal lost");
  });

  it("can report placement success", () => {
    useTagStore.getState().setPlacementSuccess(true);
    expect(useTagStore.getState().placementSuccess).toBe(true);
  });

  it("reset clears placement state but preserves library", () => {
    useTagStore.setState({
      tagImages: [{ id: "img1" } as any],
      selectedImage: { id: "img1" } as any,
      isPlacing: true,
      placementError: "err",
      placementSuccess: true,
    });

    useTagStore.getState().reset();

    const state = useTagStore.getState();
    expect(state.selectedImage).toBeNull();
    expect(state.isPlacing).toBe(false);
    expect(state.placementError).toBeNull();
    expect(state.placementSuccess).toBe(false);
    expect(state.tagImages).toHaveLength(1);
  });
});
