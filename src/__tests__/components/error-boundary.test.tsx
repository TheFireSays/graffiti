import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Text } from "react-native";
import { ErrorBoundary } from "@/components/error-boundary";

// Suppress console.error for intentional throw tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

function ThrowingComponent(): React.JSX.Element {
  throw new Error("Test crash");
}

function GoodComponent() {
  return <Text>Working</Text>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    const { getByText } = render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );
    expect(getByText("Working")).toBeTruthy();
  });

  it("renders fallback when child throws", () => {
    const { getByText, getByTestId } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(getByTestId("error-boundary-fallback")).toBeTruthy();
    expect(getByText("Something went wrong")).toBeTruthy();
  });

  it("renders custom fallback message", () => {
    const { getByText } = render(
      <ErrorBoundary fallbackMessage="Map crashed">
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(getByText("Map crashed")).toBeTruthy();
  });

  it("shows retry button that resets state", () => {
    let shouldThrow = true;

    function ConditionalThrow() {
      if (shouldThrow) throw new Error("Conditional crash");
      return <Text>Recovered</Text>;
    }

    const { getByTestId, getByText } = render(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>
    );

    expect(getByTestId("error-boundary-fallback")).toBeTruthy();

    // Stop throwing and retry
    shouldThrow = false;
    fireEvent.press(getByTestId("error-boundary-retry"));

    expect(getByText("Recovered")).toBeTruthy();
  });
});
