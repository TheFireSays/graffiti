import { Platform } from "react-native";

const IS_DEV = __DEV__;
const IS_WEB = Platform.OS === "web";

// Only import Sentry on native platforms
const Sentry = IS_WEB ? null : require("@sentry/react-native");

/**
 * Initialize Sentry for error reporting.
 * Silently no-ops if EXPO_PUBLIC_SENTRY_DSN is not set.
 */
export function initErrorReporting() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    if (IS_DEV) {
      console.log("[ErrorReporting] No Sentry DSN set — skipping init");
    }
    return;
  }

  if (!Sentry) return;
  Sentry.init({
    dsn,
    debug: IS_DEV,
    tracesSampleRate: IS_DEV ? 1.0 : 0.2,
    enabled: !IS_DEV,
  });
}

/**
 * Report an error with optional context.
 * In dev: console.error. In prod: Sentry.captureException.
 */
export function reportError(error: unknown, context?: Record<string, string>) {
  if (IS_DEV) {
    console.error("[ErrorReporting]", error, context);
    return;
  }

  if (!Sentry) return;
  if (context) {
    Sentry.withScope((scope: any) => {
      for (const [key, value] of Object.entries(context)) {
        scope.setExtra(key, value);
      }
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Report a non-fatal message for debugging.
 */
export function reportMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (IS_DEV) {
    console.log(`[ErrorReporting] [${level}]`, message);
    return;
  }

  if (!Sentry) return;
  Sentry.captureMessage(message, level);
}
