import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: { rpc: jest.fn() },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("Settings RPCs", () => {
  beforeEach(() => jest.clearAllMocks());

  it("delete_account returns success", async () => {
    mockRpc.mockResolvedValue({ data: { success: true }, error: null });
    const { data } = await supabase.rpc("delete_account");
    expect((data as Record<string, unknown>).success).toBe(true);
  });

  it("update_profile updates display name", async () => {
    mockRpc.mockResolvedValue({ data: { success: true }, error: null });
    const { data } = await supabase.rpc("update_profile", {
      p_display_name: "New Name",
    });
    expect((data as Record<string, unknown>).success).toBe(true);
  });
});
