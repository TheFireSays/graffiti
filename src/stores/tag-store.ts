import { create } from "zustand";
import { supabase } from "../lib/supabase";

interface TagImageOption {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  tier: number;
  customizableColors: { slot: string; default: string }[];
}

interface TagPlacementState {
  tagImages: TagImageOption[];
  isLoadingLibrary: boolean;
  selectedImage: TagImageOption | null;
  customColors: Record<string, string>;
  isPlacing: boolean;
  placementError: string | null;
  placementSuccess: boolean;
  loadTagLibrary: (userLevel: number) => Promise<void>;
  selectImage: (image: TagImageOption) => void;
  setColor: (slot: string, color: string) => void;
  clearSelection: () => void;
  setPlacing: (placing: boolean) => void;
  setPlacementError: (error: string | null) => void;
  setPlacementSuccess: (success: boolean) => void;
  reset: () => void;
}

export type { TagImageOption };

export const useTagStore = create<TagPlacementState>((set) => ({
  tagImages: [],
  isLoadingLibrary: true,
  selectedImage: null,
  customColors: {},
  isPlacing: false,
  placementError: null,
  placementSuccess: false,

  loadTagLibrary: async (userLevel: number) => {
    set({ isLoadingLibrary: true });
    const { data, error } = await supabase
      .from("tag_images")
      .select("id, name, image_url, category, tier, customizable_colors")
      .lte("tier", userLevel)
      .eq("is_premium", false)
      .order("tier")
      .order("name");

    if (!error && data) {
      set({
        tagImages: data.map((row) => ({
          id: row.id,
          name: row.name,
          imageUrl: row.image_url,
          category: row.category,
          tier: row.tier,
          customizableColors: (row.customizable_colors as any[]) ?? [],
        })),
        isLoadingLibrary: false,
      });
    } else {
      set({ isLoadingLibrary: false });
    }
  },

  selectImage: (image) => {
    const defaults: Record<string, string> = {};
    for (const slot of image.customizableColors) {
      defaults[slot.slot] = slot.default;
    }
    set({ selectedImage: image, customColors: defaults });
  },

  setColor: (slot, color) => {
    set((state) => ({
      customColors: { ...state.customColors, [slot]: color },
    }));
  },

  clearSelection: () => set({ selectedImage: null, customColors: {} }),
  setPlacing: (placing) => set({ isPlacing: placing }),
  setPlacementError: (error) => set({ placementError: error }),
  setPlacementSuccess: (success) => set({ placementSuccess: success }),
  reset: () => set({
    selectedImage: null,
    customColors: {},
    isPlacing: false,
    placementError: null,
    placementSuccess: false,
  }),
}));
