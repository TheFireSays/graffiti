import {
  generateUsername,
  generateUsernameOptions,
} from "../../lib/username-generator";

describe("generateUsername", () => {
  it("returns a non-empty string", () => {
    const name = generateUsername();
    expect(name).toBeTruthy();
    expect(typeof name).toBe("string");
  });

  it("is at most 20 characters long", () => {
    // Run multiple times to increase confidence
    for (let i = 0; i < 50; i++) {
      expect(generateUsername().length).toBeLessThanOrEqual(20);
    }
  });

  it("is camelCase (starts with lowercase, contains uppercase)", () => {
    for (let i = 0; i < 20; i++) {
      const name = generateUsername();
      // Unless it's the fallback "user123456"
      if (!name.startsWith("user")) {
        expect(name[0]).toMatch(/[a-z]/);
        expect(name).toMatch(/[A-Z]/);
      }
    }
  });

  it("does not contain spaces or special characters", () => {
    for (let i = 0; i < 50; i++) {
      const name = generateUsername();
      expect(name).toMatch(/^[a-zA-Z0-9]+$/);
    }
  });
});

describe("generateUsernameOptions", () => {
  it("returns the requested number of unique options", () => {
    const options = generateUsernameOptions(5);
    expect(options).toHaveLength(5);
    expect(new Set(options).size).toBe(5);
  });

  it("returns empty array when count is 0", () => {
    expect(generateUsernameOptions(0)).toEqual([]);
  });

  it("returns unique usernames", () => {
    const options = generateUsernameOptions(10);
    const unique = new Set(options);
    expect(unique.size).toBe(options.length);
  });

  it("each option obeys length constraints", () => {
    const options = generateUsernameOptions(20);
    for (const name of options) {
      expect(name.length).toBeLessThanOrEqual(20);
    }
  });
});
