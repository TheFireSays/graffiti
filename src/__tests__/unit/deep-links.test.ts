import { parseDeepLink } from "@/lib/deep-links";

describe("parseDeepLink", () => {
  it("parses graffiti://tag/<id>", () => {
    const result = parseDeepLink("graffiti://tag/abc-123");
    expect(result).toEqual({ type: "tag", id: "abc-123" });
  });

  it("parses graffiti://crew/<id>", () => {
    const result = parseDeepLink("graffiti://crew/crew-456");
    expect(result).toEqual({ type: "crew", id: "crew-456" });
  });

  it("parses graffiti://invite/<code>", () => {
    const result = parseDeepLink("graffiti://invite/ABCD1234");
    expect(result).toEqual({ type: "invite", id: "ABCD1234" });
  });

  it("parses https://graffiti.app/tag/<id>", () => {
    const result = parseDeepLink("https://graffiti.app/tag/abc-123");
    expect(result).toEqual({ type: "tag", id: "abc-123" });
  });

  it("parses https://graffiti.app/crew/<id>", () => {
    const result = parseDeepLink("https://graffiti.app/crew/crew-456");
    expect(result).toEqual({ type: "crew", id: "crew-456" });
  });

  it("returns unknown for invalid URL", () => {
    const result = parseDeepLink("not-a-url");
    expect(result).toEqual({ type: "unknown", id: "" });
  });

  it("returns unknown for unrecognized path", () => {
    const result = parseDeepLink("graffiti://settings/theme");
    expect(result).toEqual({ type: "unknown", id: "" });
  });

  it("handles trailing slash", () => {
    const result = parseDeepLink("graffiti://tag/abc-123/");
    expect(result).toEqual({ type: "tag", id: "abc-123" });
  });

  it("returns unknown for empty path", () => {
    const result = parseDeepLink("graffiti://");
    expect(result).toEqual({ type: "unknown", id: "" });
  });

  it("returns unknown for path with only type but no id", () => {
    const result = parseDeepLink("graffiti://tag");
    expect(result).toEqual({ type: "unknown", id: "" });
  });
});
