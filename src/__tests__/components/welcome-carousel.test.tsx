import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: {
      View: View,
      createAnimatedComponent: (comp: any) => comp,
    },
    useSharedValue: (init: any) => ({ value: init }),
    useAnimatedStyle: (fn: () => any) => fn(),
    withTiming: (val: any) => val,
  };
});

import { WelcomeCarousel } from "@/components/onboarding/welcome-carousel";

describe("WelcomeCarousel", () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all three slides", () => {
    const { getByText } = render(
      <WelcomeCarousel onComplete={mockOnComplete} />
    );

    expect(getByText("Tag the World")).toBeTruthy();
    expect(getByText("Claim Territory")).toBeTruthy();
    expect(getByText("Build Your Crew")).toBeTruthy();
  });

  it("renders skip button", () => {
    const { getByTestId } = render(
      <WelcomeCarousel onComplete={mockOnComplete} />
    );

    expect(getByTestId("skip-button")).toBeTruthy();
  });

  it("calls onComplete when skip is pressed", () => {
    const { getByTestId } = render(
      <WelcomeCarousel onComplete={mockOnComplete} />
    );

    fireEvent.press(getByTestId("skip-button"));
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it("renders next button on first slide", () => {
    const { getByText } = render(
      <WelcomeCarousel onComplete={mockOnComplete} />
    );

    expect(getByText("Next")).toBeTruthy();
  });

  it("shows slide subtitles", () => {
    const { getByText } = render(
      <WelcomeCarousel onComplete={mockOnComplete} />
    );

    expect(
      getByText("Drop AR graffiti tags anywhere. Your city is your canvas.")
    ).toBeTruthy();
  });

  it("renders icon boxes for all slides", () => {
    const { getByText } = render(
      <WelcomeCarousel onComplete={mockOnComplete} />
    );

    expect(getByText("SPRAY")).toBeTruthy();
    expect(getByText("FLAG")).toBeTruthy();
    expect(getByText("CREW")).toBeTruthy();
  });
});
