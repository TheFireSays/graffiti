import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { JoinRequestForm } from "@/components/crew/join-request-form";
import { DirectInviteForm } from "@/components/crew/direct-invite-form";

jest.mock("@/lib/supabase", () => ({
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));

// --- JoinRequestForm store mock ---

const mockRequestJoinCrew = jest.fn();

jest.mock("@/stores/crew-store", () => ({
  useCrewStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      requestJoinCrew: mockRequestJoinCrew,
      sendDirectInvite: jest.fn(),
    })
  ),
}));

// Default props for JoinRequestForm
const defaultJoinProps = {
  crewId: "crew-1",
  crewName: "Night Writers",
  onSubmitted: jest.fn(),
  onCancel: jest.fn(),
};

describe("JoinRequestForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders form with message input and submit button", () => {
    const { getByTestId, getByText } = render(<JoinRequestForm {...defaultJoinProps} />);
    expect(getByTestId("join-request-message")).toBeTruthy();
    expect(getByTestId("join-request-submit")).toBeTruthy();
    expect(getByText("Send Request")).toBeTruthy();
  });

  it("calls requestJoinCrew on submit", async () => {
    mockRequestJoinCrew.mockResolvedValue({ success: true });

    const { getByTestId } = render(<JoinRequestForm {...defaultJoinProps} />);

    fireEvent.changeText(getByTestId("join-request-message"), "I want to join!");
    fireEvent.press(getByTestId("join-request-submit"));

    await waitFor(() => {
      expect(mockRequestJoinCrew).toHaveBeenCalledWith("crew-1", "I want to join!");
    });
  });

  it("shows success message after submission", async () => {
    mockRequestJoinCrew.mockResolvedValue({ success: true });

    const { getByTestId, getByText } = render(<JoinRequestForm {...defaultJoinProps} />);

    fireEvent.press(getByTestId("join-request-submit"));

    await waitFor(() => {
      expect(getByText("Request sent to Night Writers!")).toBeTruthy();
    });
  });

  it("shows error on failure", async () => {
    mockRequestJoinCrew.mockResolvedValue({
      success: false,
      error: "Already in a crew",
    });

    const { getByTestId, getByText } = render(<JoinRequestForm {...defaultJoinProps} />);

    fireEvent.press(getByTestId("join-request-submit"));

    await waitFor(() => {
      expect(getByText("Already in a crew")).toBeTruthy();
    });
  });
});

// --- DirectInviteForm store mock ---

const mockSendDirectInvite = jest.fn();

// Re-mock with sendDirectInvite override for DirectInviteForm tests
// useCrewStore is already mocked; we override the mock implementation per test via mockSendDirectInvite.
// The mock factory above returns sendDirectInvite from the shared store state,
// but we control it through mockSendDirectInvite directly.

describe("DirectInviteForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Override useCrewStore to return mockSendDirectInvite for this suite
    const { useCrewStore } = require("@/stores/crew-store");
    (useCrewStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          requestJoinCrew: jest.fn(),
          sendDirectInvite: mockSendDirectInvite,
        })
    );
  });

  it("renders input and send button", () => {
    const { getByTestId, getByText } = render(<DirectInviteForm />);
    expect(getByTestId("direct-invite-input")).toBeTruthy();
    expect(getByTestId("direct-invite-send")).toBeTruthy();
    expect(getByText("Send")).toBeTruthy();
  });

  it("calls sendDirectInvite with username", async () => {
    mockSendDirectInvite.mockResolvedValue({ success: true });

    const { getByTestId } = render(<DirectInviteForm />);

    fireEvent.changeText(getByTestId("direct-invite-input"), "NOVA");
    fireEvent.press(getByTestId("direct-invite-send"));

    await waitFor(() => {
      expect(mockSendDirectInvite).toHaveBeenCalledWith("NOVA");
    });
  });

  it("shows success message after sending", async () => {
    mockSendDirectInvite.mockResolvedValue({ success: true });

    const { getByTestId, getByText } = render(<DirectInviteForm />);

    fireEvent.changeText(getByTestId("direct-invite-input"), "NOVA");
    fireEvent.press(getByTestId("direct-invite-send"));

    await waitFor(() => {
      expect(getByText("Invite sent to NOVA")).toBeTruthy();
    });
  });

  it("shows error when user not found", async () => {
    mockSendDirectInvite.mockResolvedValue({
      success: false,
      error: "User not found",
    });

    const { getByTestId, getByText } = render(<DirectInviteForm />);

    fireEvent.changeText(getByTestId("direct-invite-input"), "GHOST");
    fireEvent.press(getByTestId("direct-invite-send"));

    await waitFor(() => {
      expect(getByText("User not found")).toBeTruthy();
    });
  });
});
