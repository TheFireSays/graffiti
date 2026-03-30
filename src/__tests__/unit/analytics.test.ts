import {
  trackEvent,
  flushEvents,
  startSession,
  stopSession,
  getQueueLength,
  getSessionId,
  _resetForTesting,
} from "@/lib/analytics";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const mockGetUser = supabase.auth.getUser as jest.Mock;
const mockFrom = supabase.from as jest.Mock;

describe("analytics", () => {
  beforeEach(() => {
    _resetForTesting();
    jest.clearAllMocks();
  });

  it("trackEvent adds events to queue", () => {
    trackEvent("test_event", { key: "value" });
    expect(getQueueLength()).toBe(1);

    trackEvent("another_event");
    expect(getQueueLength()).toBe(2);
  });

  it("startSession creates session ID and returns it", () => {
    const id = startSession();
    expect(id).toBeTruthy();
    expect(getSessionId()).toBe(id);
  });

  it("stopSession clears session", () => {
    startSession();
    expect(getSessionId()).not.toBeNull();

    mockGetUser.mockResolvedValue({ data: { user: null } });
    stopSession();

    expect(getSessionId()).toBeNull();
  });

  it("flushEvents sends batch to Supabase", async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: mockInsert });
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    trackEvent("evt1");
    trackEvent("evt2");

    const flushed = await flushEvents();
    expect(flushed).toBe(2);
    expect(mockFrom).toHaveBeenCalledWith("analytics_events");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ user_id: "user-1", event_name: "evt1" }),
        expect.objectContaining({ user_id: "user-1", event_name: "evt2" }),
      ])
    );
    expect(getQueueLength()).toBe(0);
  });

  it("flushEvents returns 0 for empty queue", async () => {
    const flushed = await flushEvents();
    expect(flushed).toBe(0);
  });

  it("flushEvents puts events back on auth failure", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    trackEvent("evt1");
    const flushed = await flushEvents();

    expect(flushed).toBe(0);
    expect(getQueueLength()).toBe(1);
  });

  it("flushEvents puts events back on insert error", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFrom.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: { message: "fail" } }),
    });

    trackEvent("evt1");
    const flushed = await flushEvents();

    expect(flushed).toBe(0);
    expect(getQueueLength()).toBe(1);
  });

  it("events include session_id after startSession", () => {
    const sid = startSession();
    trackEvent("test");

    // Access internal state via flush
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: mockInsert });

    flushEvents().then(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ session_id: sid }),
        ])
      );
    });
  });
});
