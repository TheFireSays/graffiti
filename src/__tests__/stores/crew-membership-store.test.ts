import { useCrewStore } from "@/stores/crew-store";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;

function resetStore() {
  useCrewStore.setState({
    crew: null,
    members: [],
    invites: [],
    joinRequests: [],
    directInvites: [],
    pendingIncomingInvites: [],
    pendingOutgoingRequests: [],
    userRole: null,
    isLoading: false,
    error: null,
  });
}

function mockChain(resolvedValue: any) {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolvedValue),
    order: jest.fn().mockResolvedValue(resolvedValue),
  };
  return chain;
}

describe("crew membership actions", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe("requestJoinCrew", () => {
    it("calls request_join_crew RPC and returns success", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await useCrewStore.getState().requestJoinCrew("crew-1", "I want to join!");
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("request_join_crew", {
        p_crew_id: "crew-1",
        p_message: "I want to join!",
      });
    });

    it("sends null message when none provided", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      await useCrewStore.getState().requestJoinCrew("crew-1");
      expect(mockRpc).toHaveBeenCalledWith("request_join_crew", {
        p_crew_id: "crew-1",
        p_message: null,
      });
    });

    it("returns error on RPC failure", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "Already requested" },
      });

      const result = await useCrewStore.getState().requestJoinCrew("crew-1");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Already requested");
    });

    it("returns error from business logic", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "Already in a crew" },
        error: null,
      });

      const result = await useCrewStore.getState().requestJoinCrew("crew-1");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Already in a crew");
    });
  });

  describe("cancelJoinRequest", () => {
    it("calls cancel_join_request RPC and returns success", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await useCrewStore.getState().cancelJoinRequest("req-1");
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("cancel_join_request", {
        p_request_id: "req-1",
      });
    });

    it("returns error on RPC failure", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "Request not found" },
      });

      const result = await useCrewStore.getState().cancelJoinRequest("bad-id");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Request not found");
    });
  });

  describe("reviewJoinRequest", () => {
    it("calls review_join_request RPC with approved=true", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await useCrewStore.getState().reviewJoinRequest("req-1", true);
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("review_join_request", {
        p_request_id: "req-1",
        p_approved: true,
      });
    });

    it("calls review_join_request RPC with approved=false", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await useCrewStore.getState().reviewJoinRequest("req-1", false);
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("review_join_request", {
        p_request_id: "req-1",
        p_approved: false,
      });
    });

    it("returns error on RPC failure", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "Not authorized" },
      });

      const result = await useCrewStore.getState().reviewJoinRequest("req-1", true);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Not authorized");
    });
  });

  describe("sendDirectInvite", () => {
    it("calls send_direct_invite RPC and returns success", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await useCrewStore.getState().sendDirectInvite("targetUser");
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("send_direct_invite", {
        p_target_username: "targetUser",
      });
    });

    it("returns error on RPC failure", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "User not found" },
      });

      const result = await useCrewStore.getState().sendDirectInvite("ghost");
      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
    });

    it("returns error from business logic", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "User already in a crew" },
        error: null,
      });

      const result = await useCrewStore.getState().sendDirectInvite("takenUser");
      expect(result.success).toBe(false);
      expect(result.error).toBe("User already in a crew");
    });
  });

  describe("respondDirectInvite", () => {
    it("calls respond_direct_invite RPC with accepted=true", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await useCrewStore.getState().respondDirectInvite("inv-1", true);
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("respond_direct_invite", {
        p_invite_id: "inv-1",
        p_accepted: true,
      });
    });

    it("calls respond_direct_invite RPC with accepted=false", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await useCrewStore.getState().respondDirectInvite("inv-1", false);
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("respond_direct_invite", {
        p_invite_id: "inv-1",
        p_accepted: false,
      });
    });

    it("returns error on RPC failure", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "Invite expired" },
      });

      const result = await useCrewStore.getState().respondDirectInvite("inv-1", true);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invite expired");
    });
  });

  describe("loadJoinRequests", () => {
    it("loads pending join requests for a crew", async () => {
      const mockData = [
        {
          id: "req-1",
          user_id: "u1",
          message: "Let me in!",
          status: "pending",
          created_at: "2026-03-01T00:00:00Z",
          user: { username: "tagger1" },
        },
        {
          id: "req-2",
          user_id: "u2",
          message: null,
          status: "pending",
          created_at: "2026-03-02T00:00:00Z",
          user: { username: "tagger2" },
        },
      ];

      mockFrom.mockReturnValue(mockChain({ data: mockData, error: null }));

      await useCrewStore.getState().loadJoinRequests("crew-1");

      const state = useCrewStore.getState();
      expect(state.joinRequests).toHaveLength(2);
      expect(state.joinRequests[0].id).toBe("req-1");
      expect(state.joinRequests[0].username).toBe("tagger1");
      expect(state.joinRequests[0].message).toBe("Let me in!");
      expect(state.joinRequests[1].username).toBe("tagger2");
      expect(mockFrom).toHaveBeenCalledWith("crew_join_requests");
    });

    it("does not update state on error", async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: { message: "Failed" } }));

      await useCrewStore.getState().loadJoinRequests("crew-1");

      expect(useCrewStore.getState().joinRequests).toEqual([]);
    });
  });

  describe("loadDirectInvites", () => {
    it("loads direct invites for a crew", async () => {
      const mockData = [
        {
          id: "di-1",
          crew_id: "crew-1",
          target_user_id: "u3",
          status: "pending",
          expires_at: "2026-04-01T00:00:00Z",
          created_at: "2026-03-01T00:00:00Z",
          target: { username: "invitee1" },
        },
      ];

      mockFrom.mockReturnValue(mockChain({ data: mockData, error: null }));

      await useCrewStore.getState().loadDirectInvites("crew-1");

      const state = useCrewStore.getState();
      expect(state.directInvites).toHaveLength(1);
      expect(state.directInvites[0].id).toBe("di-1");
      expect(state.directInvites[0].targetUsername).toBe("invitee1");
      expect(mockFrom).toHaveBeenCalledWith("crew_direct_invites");
    });

    it("does not update state on error", async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: { message: "Failed" } }));

      await useCrewStore.getState().loadDirectInvites("crew-1");

      expect(useCrewStore.getState().directInvites).toEqual([]);
    });
  });

  describe("loadPendingMemberships", () => {
    it("loads incoming invites and outgoing requests for a user", async () => {
      const mockInvites = [
        {
          id: "di-1",
          crew_id: "crew-1",
          expires_at: "2026-04-01T00:00:00Z",
          created_at: "2026-03-01T00:00:00Z",
          crew: { name: "Alpha Crew", abbreviation: "AC", color: "#FF0000" },
          inviter: { username: "founder1" },
        },
      ];

      const mockRequests = [
        {
          id: "req-1",
          crew_id: "crew-2",
          message: "Please!",
          status: "pending",
          created_at: "2026-03-02T00:00:00Z",
          crew: { name: "Beta Crew", abbreviation: "BC", color: "#00FF00" },
        },
      ];

      // First call: incoming invites
      const inviteChain = mockChain({ data: mockInvites, error: null });
      // Second call: outgoing requests
      const requestChain = mockChain({ data: mockRequests, error: null });

      mockFrom
        .mockReturnValueOnce(inviteChain)
        .mockReturnValueOnce(requestChain);

      await useCrewStore.getState().loadPendingMemberships("user-1");

      const state = useCrewStore.getState();
      expect(state.pendingIncomingInvites).toHaveLength(1);
      expect(state.pendingIncomingInvites[0].crewName).toBe("Alpha Crew");
      expect(state.pendingIncomingInvites[0].invitedByUsername).toBe("founder1");

      expect(state.pendingOutgoingRequests).toHaveLength(1);
      expect(state.pendingOutgoingRequests[0].crewName).toBe("Beta Crew");
      expect(state.pendingOutgoingRequests[0].message).toBe("Please!");
    });
  });

  describe("clearCrew resets membership state", () => {
    it("clears all membership arrays", () => {
      useCrewStore.setState({
        joinRequests: [{ id: "req-1" } as any],
        directInvites: [{ id: "di-1" } as any],
        pendingIncomingInvites: [{ id: "pi-1" } as any],
        pendingOutgoingRequests: [{ id: "po-1" } as any],
      });

      useCrewStore.getState().clearCrew();

      const state = useCrewStore.getState();
      expect(state.joinRequests).toEqual([]);
      expect(state.directInvites).toEqual([]);
      expect(state.pendingIncomingInvites).toEqual([]);
      expect(state.pendingOutgoingRequests).toEqual([]);
    });
  });
});
