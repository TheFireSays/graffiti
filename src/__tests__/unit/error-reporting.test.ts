import * as Sentry from "@sentry/react-native";
import { reportError, reportMessage } from "@/lib/error-reporting";

describe("error-reporting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reportError", () => {
    it("logs to console.error in dev mode", () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("test");

      reportError(error, { screen: "map" });

      expect(spy).toHaveBeenCalledWith(
        "[ErrorReporting]",
        error,
        { screen: "map" }
      );
      spy.mockRestore();
    });

    it("logs to console.error without context", () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("test");

      reportError(error);

      expect(spy).toHaveBeenCalledWith("[ErrorReporting]", error, undefined);
      spy.mockRestore();
    });
  });

  describe("reportMessage", () => {
    it("logs to console.log in dev mode", () => {
      const spy = jest.spyOn(console, "log").mockImplementation(() => {});

      reportMessage("test message", "warning");

      expect(spy).toHaveBeenCalledWith(
        "[ErrorReporting] [warning]",
        "test message"
      );
      spy.mockRestore();
    });

    it("defaults to info level", () => {
      const spy = jest.spyOn(console, "log").mockImplementation(() => {});

      reportMessage("info msg");

      expect(spy).toHaveBeenCalledWith(
        "[ErrorReporting] [info]",
        "info msg"
      );
      spy.mockRestore();
    });
  });
});
