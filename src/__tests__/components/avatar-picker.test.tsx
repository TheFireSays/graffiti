import React from "react";
import { render } from "@testing-library/react-native";
import { AvatarPicker } from "@/components/profile/avatar-picker";

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: "file:///mock/avatar.jpg" }],
  }),
  MediaTypeOptions: { Images: "Images" },
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest
          .fn()
          .mockResolvedValue({ data: { path: "u1/avatar.jpg" }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: "https://example.com/avatar.jpg" },
        }),
      }),
    },
    rpc: jest
      .fn()
      .mockResolvedValue({ data: { success: true }, error: null }),
  },
}));

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      profile: { id: "u1", username: "tagger1", avatar_url: null },
      fetchProfile: jest.fn(),
    })
  ),
}));

describe("AvatarPicker", () => {
  it("renders with username initial when no avatar", () => {
    const { getByText } = render(<AvatarPicker />);
    expect(getByText("T")).toBeTruthy();
  });

  it("shows edit button", () => {
    const { getByText } = render(<AvatarPicker />);
    expect(getByText("Edit")).toBeTruthy();
  });
});
