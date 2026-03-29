import { containsProfanity, cleanText } from "@/lib/profanity";

describe("profanity filter", () => {
  it("detects profanity", () => {
    expect(containsProfanity("hello")).toBe(false);
    expect(containsProfanity("damn")).toBe(true);
  });

  it("cleans profane text", () => {
    expect(cleanText("hello")).toBe("hello");
    expect(cleanText("damn")).not.toBe("damn");
  });

  it("handles empty strings", () => {
    expect(containsProfanity("")).toBe(false);
    expect(cleanText("")).toBe("");
  });
});
