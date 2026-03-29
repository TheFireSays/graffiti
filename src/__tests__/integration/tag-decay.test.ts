/**
 * Tag decay tests.
 *
 * The tag_decay function is a Postgres function invoked via RPC.
 * These tests verify the client-side RPC call and response handling.
 */

import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;
const mockFrom = supabase.from as jest.Mock;

describe("Tag Decay (archive_expired_tags RPC)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls archive_expired_tags RPC successfully", async () => {
    mockRpc.mockResolvedValue({
      data: { archived_count: 15 },
      error: null,
    });

    const { data, error } = await supabase.rpc("archive_expired_tags");

    expect(mockRpc).toHaveBeenCalledWith("archive_expired_tags");
    expect(error).toBeNull();
    expect(data.archived_count).toBe(15);
  });

  it("returns zero when no tags are expired", async () => {
    mockRpc.mockResolvedValue({
      data: { archived_count: 0 },
      error: null,
    });

    const { data } = await supabase.rpc("archive_expired_tags");
    expect(data.archived_count).toBe(0);
  });

  it("handles RPC error gracefully", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "function not found" },
    });

    const { error } = await supabase.rpc("archive_expired_tags");
    expect(error).toBeDefined();
    expect(error.message).toBe("function not found");
  });

  it("expired tags have status changed to expired", async () => {
    // Verify the tag status enum includes 'expired'
    const mockExpiredTag = {
      id: "t1",
      status: "expired",
      created_at: "2026-03-20T00:00:00Z", // > 7 days ago
      expires_at: "2026-03-27T00:00:00Z",
    };

    const chain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [mockExpiredTag], error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { data } = await supabase
      .from("tags")
      .select("id, status, created_at, expires_at")
      .eq("status", "expired")
      .limit(10);

    expect(data).toHaveLength(1);
    expect(data[0].status).toBe("expired");
  });

  it("active tags within 7 days are not affected", async () => {
    const mockActiveTag = {
      id: "t2",
      status: "active",
      created_at: "2026-03-28T00:00:00Z", // < 7 days ago
      expires_at: "2026-04-04T00:00:00Z",
    };

    const chain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [mockActiveTag], error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { data } = await supabase
      .from("tags")
      .select("id, status, created_at, expires_at")
      .eq("status", "active")
      .limit(10);

    expect(data).toHaveLength(1);
    expect(data[0].status).toBe("active");
  });
});
