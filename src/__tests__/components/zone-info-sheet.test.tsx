import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ZoneInfoSheet } from "@/components/map/zone-info-sheet";
import type { MapZone } from "@/lib/geo";

const mockZone: MapZone = {
  id: "z1",
  name: "Downtown Core",
  coordinates: [
    { latitude: 30.0, longitude: -97.0 },
    { latitude: 30.01, longitude: -97.0 },
    { latitude: 30.01, longitude: -97.01 },
  ],
  controllingCrewId: "c1",
  controllingCrewColor: "#ff6b6b",
  controllingCrewAbbreviation: "GRF",
  tagCounts: { c1: 15, c2: 8, c3: 3 },
};

const unclaimedZone: MapZone = {
  id: "z2",
  name: "East Side",
  coordinates: [],
  controllingCrewId: null,
  controllingCrewColor: null,
  controllingCrewAbbreviation: null,
  tagCounts: {},
};

describe("ZoneInfoSheet", () => {
  it("renders zone name", () => {
    const { getByText } = render(
      <ZoneInfoSheet zone={mockZone} onClose={jest.fn()} />
    );
    expect(getByText("Downtown Core")).toBeTruthy();
  });

  it("shows controlling crew abbreviation", () => {
    const { getByText } = render(
      <ZoneInfoSheet zone={mockZone} onClose={jest.fn()} />
    );
    expect(getByText("GRF")).toBeTruthy();
    expect(getByText("Controlled by GRF")).toBeTruthy();
  });

  it("shows unclaimed territory for zones without a crew", () => {
    const { getByText } = render(
      <ZoneInfoSheet zone={unclaimedZone} onClose={jest.fn()} />
    );
    expect(getByText("Unclaimed territory")).toBeTruthy();
  });

  it("shows total tag count", () => {
    const { getByText } = render(
      <ZoneInfoSheet zone={mockZone} onClose={jest.fn()} />
    );
    expect(getByText("26")).toBeTruthy(); // 15 + 8 + 3
  });

  it("shows crews active count", () => {
    const { getByText } = render(
      <ZoneInfoSheet zone={mockZone} onClose={jest.fn()} />
    );
    expect(getByText("3")).toBeTruthy(); // 3 crews
  });

  it("calls onClose when close button pressed", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ZoneInfoSheet zone={mockZone} onClose={onClose} />
    );
    fireEvent.press(getByTestId("zone-close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
