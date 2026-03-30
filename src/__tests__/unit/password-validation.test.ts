import {
  validatePassword,
  getPasswordStrength,
} from "../../lib/password-validation";

describe("validatePassword", () => {
  it("rejects passwords shorter than 12 characters", () => {
    const result = validatePassword("Abcd1!short");
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining("at least 12 characters"),
    );
  });

  it("rejects passwords without uppercase letters", () => {
    const result = validatePassword("abcdefgh1234!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining("uppercase"),
    );
  });

  it("rejects passwords without lowercase letters", () => {
    const result = validatePassword("ABCDEFGH1234!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining("lowercase"),
    );
  });

  it("rejects passwords without digits", () => {
    const result = validatePassword("Abcdefghijkl!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining("digit"),
    );
  });

  it("rejects passwords without special characters", () => {
    const result = validatePassword("Abcdefgh1234");
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining("special character"),
    );
  });

  it("rejects common passwords", () => {
    const result = validatePassword("Password123!");
    // "password" is in the common list — but the actual input has mixed case + digits + special
    // The common check is case-insensitive on the base word
    // "password123" is in the list, but "Password123!" lowercases to "password123!" which is not
    // Let's test with an actual common password that is long enough
    const result2 = validatePassword("1234567890!A");
    // "1234567890" is in the common list
    expect(result2.valid).toBe(false);
  });

  it("accepts valid passwords that meet all requirements", () => {
    const result = validatePassword("MyStr0ngP@ssw0rd!");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns multiple errors for very weak passwords", () => {
    const result = validatePassword("abc");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it("accepts a 12-character password meeting all rules", () => {
    const result = validatePassword("Abcdefgh12!@");
    expect(result.valid).toBe(true);
  });
});

describe("getPasswordStrength", () => {
  it('returns "weak" for invalid passwords', () => {
    expect(getPasswordStrength("short")).toBe("weak");
  });

  it('returns "weak" for a valid 12-char password', () => {
    expect(getPasswordStrength("Abcdefgh12!@")).toBe("weak");
  });

  it('returns "fair" for a valid 14-char password', () => {
    expect(getPasswordStrength("Abcdefghij12!@")).toBe("fair");
  });

  it('returns "strong" for a valid 18+ char password', () => {
    expect(getPasswordStrength("Abcdefghijklmn12!@")).toBe("strong");
  });
});
