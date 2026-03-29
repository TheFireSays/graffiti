// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const security = require("eslint-plugin-security");

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      security,
    },
    rules: {
      // Security rules
      "security/detect-object-injection": "off", // Too noisy for bracket access patterns
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "warn",
    },
  },
  {
    ignores: ["dist/*"],
  },
]);
