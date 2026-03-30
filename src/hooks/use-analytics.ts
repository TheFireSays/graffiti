import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { startSession, stopSession, trackEvent, flushEvents } from "../lib/analytics";

export function useAnalytics() {
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    startSession();
    trackEvent("app_open");

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (
        appStateRef.current === "active" &&
        (nextState === "background" || nextState === "inactive")
      ) {
        trackEvent("app_background");
        flushEvents();
      } else if (
        appStateRef.current !== "active" &&
        nextState === "active"
      ) {
        trackEvent("app_open");
      }
      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
      stopSession();
    };
  }, []);
}
