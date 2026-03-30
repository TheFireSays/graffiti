import React from "react";
import { render, screen } from "@testing-library/react-native";
import { CrewDashboard } from "@/components/crew/crew-dashboard";

jest.mock("@/stores/crew-store", () => ({
  useCrewStore: (selector: any) =>
    selector({ leaveCrew: jest.fn() }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ navigate: jest.fn() }),
}));

const baseCrew = {
  id: "crew-1",
  name: "Test Crew",
  abbreviation: "TST",
  color: "#ff3333",
  founderId: "user-1",
  memberCount: 3,
  totalXp: 500,
  zonesControlled: 1,
  createdAt: "2026-01-01T00:00:00Z",
};

const baseProps = {
  members: [],
  invites: [],
  joinRequests: [],
  directInvites: [],
  userId: "user-1",
  userRole: "og",
  isOgEligible: true,
  onLeft: jest.fn(),
};

describe("CrewDashboard inactivity banner", () => {
  it("shows warning banner when crew has been inactive for 26 days", () => {
    const lastTaggedAt = new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString();
    render(
      <CrewDashboard
        crew={{ ...baseCrew, lastTaggedAt }}
        {...baseProps}
      />
    );
    expect(screen.getByTestId("inactivity-banner")).toBeTruthy();
    expect(screen.getByText(/dissolves in 4 days/i)).toBeTruthy();
  });

  it("does not show banner when crew tagged 5 days ago", () => {
    const lastTaggedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    render(
      <CrewDashboard
        crew={{ ...baseCrew, lastTaggedAt }}
        {...baseProps}
      />
    );
    expect(screen.queryByTestId("inactivity-banner")).toBeNull();
  });

  it("does not show banner when lastTaggedAt is null", () => {
    render(
      <CrewDashboard
        crew={{ ...baseCrew, lastTaggedAt: null }}
        {...baseProps}
      />
    );
    expect(screen.queryByTestId("inactivity-banner")).toBeNull();
  });
});
