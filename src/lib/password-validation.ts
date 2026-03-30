/**
 * OWASP-aligned password validation utilities.
 *
 * Enforces minimum complexity requirements and checks against a list of the
 * most commonly-used passwords to prevent trivially guessable credentials.
 */

// Top 100 most common passwords (lowercase for case-insensitive comparison)
const COMMON_PASSWORDS: ReadonlySet<string> = new Set([
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "monkey",
  "1234567",
  "letmein",
  "trustno1",
  "dragon",
  "baseball",
  "iloveyou",
  "master",
  "sunshine",
  "ashley",
  "michael",
  "shadow",
  "123123",
  "654321",
  "superman",
  "qazwsx",
  "football",
  "password1",
  "password123",
  "batman",
  "login",
  "welcome",
  "admin",
  "princess",
  "starwars",
  "passw0rd",
  "qwerty123",
  "mustang",
  "access",
  "hello",
  "charlie",
  "donald",
  "hunter",
  "freedom",
  "whatever",
  "jordan",
  "thomas",
  "george",
  "harley",
  "ranger",
  "buster",
  "soccer",
  "hockey",
  "killer",
  "andrew",
  "tigger",
  "joshua",
  "matrix",
  "pepper",
  "bonnie",
  "cheese",
  "butter",
  "dallas",
  "robert",
  "summer",
  "ginger",
  "silver",
  "nicole",
  "sparky",
  "golfer",
  "cookie",
  "junior",
  "scooter",
  "flower",
  "samantha",
  "hammer",
  "compaq",
  "falcon",
  "taylor",
  "merlin",
  "secret",
  "diamond",
  "1q2w3e4r",
  "tennis",
  "thunder",
  "jackson",
  "zxcvbnm",
  "marine",
  "corvette",
  "yankees",
  "peanut",
  "maverick",
  "chicken",
  "phoenix",
  "camaro",
  "winter",
  "austin",
  "computer",
  "bandit",
  "december",
  "1234",
  "12345",
  "123456789",
  "1234567890",
  "0987654321",
  "abcdef",
]);

const MIN_LENGTH = 12;

export type PasswordStrength = "weak" | "fair" | "strong";

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
  hasSpecialChar: boolean;
}

/**
 * Validate a password against OWASP-style complexity rules.
 *
 * Rules:
 * 1. Minimum 12 characters
 * 2. At least 1 uppercase letter
 * 3. At least 1 lowercase letter
 * 4. At least 1 digit
 * 5. At least 1 special character
 * 6. Not in the common-passwords list
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  const hasMinLength = password.length >= MIN_LENGTH;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  if (!hasMinLength) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters`);
  }

  if (!hasUppercase) {
    errors.push("Password must contain at least 1 uppercase letter");
  }

  if (!hasLowercase) {
    errors.push("Password must contain at least 1 lowercase letter");
  }

  if (!hasDigit) {
    errors.push("Password must contain at least 1 digit");
  }

  if (!hasSpecialChar) {
    errors.push("Password must contain at least 1 special character");
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push("Password is too common — please choose something unique");
  }

  return {
    valid: errors.length === 0,
    errors,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasDigit,
    hasSpecialChar,
  };
}

/**
 * Return a simple strength rating for the password meter UI.
 *
 * - **weak**: fails validation or length < 14
 * - **fair**: passes validation and length 14-17
 * - **strong**: passes validation and length >= 18
 */
export function getPasswordStrength(
  password: string,
): "weak" | "fair" | "strong" {
  const { valid } = validatePassword(password);

  if (!valid) return "weak";
  if (password.length >= 18) return "strong";
  if (password.length >= 14) return "fair";
  return "weak";
}
