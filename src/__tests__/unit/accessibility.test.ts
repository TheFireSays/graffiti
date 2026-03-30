import { renderHook, act } from "@testing-library/react-native";
import { AccessibilityInfo } from "react-native";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Spy on AccessibilityInfo methods
let changeCallback: ((enabled: boolean) => void) | null = null;

jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(false);
jest.spyOn(AccessibilityInfo, "addEventListener").mockImplementation(
  ((_event: any, cb: any) => {
    changeCallback = cb;
    return { remove: jest.fn() };
  }) as any
);

describe("useReducedMotion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    changeCallback = null;
    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(false);
    jest.spyOn(AccessibilityInfo, "addEventListener").mockImplementation(
      ((_event: any, cb: any) => {
        changeCallback = cb;
        return { remove: jest.fn() };
      }) as any
    );
  });

  it("returns false by default", () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when reduce motion is enabled", async () => {
    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(true);

    const { result } = renderHook(() => useReducedMotion());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current).toBe(true);
  });

  it("subscribes to accessibility changes", () => {
    renderHook(() => useReducedMotion());

    expect(AccessibilityInfo.addEventListener).toHaveBeenCalledWith(
      "reduceMotionChanged",
      expect.any(Function)
    );
  });

});
