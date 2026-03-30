import {
  buildTagShareText,
  buildProfileShareText,
  buildTagDeepLink,
  buildProfileDeepLink,
} from "@/lib/sharing";

describe("sharing", () => {
  describe("buildTagDeepLink", () => {
    it("generates correct tag deep link", () => {
      expect(buildTagDeepLink("abc-123")).toBe("https://graffiti.app/tag/abc-123");
    });
  });

  describe("buildProfileDeepLink", () => {
    it("generates correct profile deep link", () => {
      expect(buildProfileDeepLink("user-456")).toBe("https://graffiti.app/profile/user-456");
    });
  });

  describe("buildTagShareText", () => {
    it("includes tag name, username, and deep link", () => {
      const text = buildTagShareText({
        id: "tag-1",
        tagImageName: "Crown",
        username: "tagger99",
        zoneName: null,
      });

      expect(text).toContain("Crown by tagger99");
      expect(text).toContain("Placed with Graffiti");
      expect(text).toContain("https://graffiti.app/tag/tag-1");
    });

    it("includes zone name when provided", () => {
      const text = buildTagShareText({
        id: "tag-2",
        tagImageName: "Skull",
        username: "writer",
        zoneName: "Downtown Core",
      });

      expect(text).toContain("Zone: Downtown Core");
    });
  });

  describe("buildProfileShareText", () => {
    it("includes username, level, and tag count", () => {
      const text = buildProfileShareText({
        id: "user-1",
        username: "kingpin",
        level: 15,
        tagCount: 200,
        crewName: null,
      });

      expect(text).toContain("kingpin — Level 15");
      expect(text).toContain("200 tags placed");
      expect(text).toContain("https://graffiti.app/profile/user-1");
    });

    it("includes crew name when provided", () => {
      const text = buildProfileShareText({
        id: "user-2",
        username: "ace",
        level: 5,
        tagCount: 30,
        crewName: "Street Kings",
      });

      expect(text).toContain("Crew: Street Kings");
    });
  });
});
