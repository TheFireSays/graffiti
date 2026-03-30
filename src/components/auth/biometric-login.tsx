import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { DEMO_MODE } from "../../lib/config";
import { supabase } from "../../lib/supabase";

// Only import on native platforms
const isNative = Platform.OS !== "web";

let LocalAuthentication: typeof import("expo-local-authentication") | null =
  null;
let SecureStore: typeof import("expo-secure-store") | null = null;

if (isNative) {
  LocalAuthentication = require("expo-local-authentication");
  SecureStore = require("expo-secure-store");
}

const BIOMETRIC_EMAIL_KEY = "biometric_email";
const BIOMETRIC_PASSWORD_KEY = "biometric_password";
const BIOMETRIC_ENABLED_KEY = "biometric_enabled";

/**
 * BiometricLogin — shown on the sign-in screen (native only).
 * On tap, uses device biometrics to authenticate then auto-signs in
 * with credentials previously saved to SecureStore.
 */
export function BiometricLogin() {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isNative) return;

    (async () => {
      try {
        const hasHardware =
          await LocalAuthentication!.hasHardwareAsync();
        const isEnrolled =
          await LocalAuthentication!.isEnrolledAsync();
        const enabled = await SecureStore!.getItemAsync(BIOMETRIC_ENABLED_KEY);
        setAvailable(hasHardware && isEnrolled && enabled === "true");
      } catch {
        setAvailable(false);
      }
    })();
  }, []);

  const handleBiometricLogin = useCallback(async () => {
    if (!isNative || !LocalAuthentication || !SecureStore) return;

    setLoading(true);
    setError("");

    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 500));
      setLoading(false);
      return;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Sign in to Graffiti",
        fallbackLabel: "Use password",
      });

      if (!result.success) {
        setLoading(false);
        return;
      }

      const email = await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);
      const password = await SecureStore.getItemAsync(BIOMETRIC_PASSWORD_KEY);

      if (!email || !password) {
        setError("No saved credentials. Please sign in with your password.");
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      }
    } catch {
      setError("Biometric authentication failed.");
    }

    setLoading(false);
  }, []);

  // Hide on web or if biometrics not available
  if (!isNative || !available) return null;

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleBiometricLogin}
        disabled={loading}
      >
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.buttonText}>
          {loading ? "Authenticating..." : "Sign in with Biometrics"}
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

/**
 * BiometricToggle — shown in Settings.
 * Lets the user enable/disable biometric login and saves credentials.
 */
export function BiometricToggle() {
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isNative) return;

    (async () => {
      try {
        const hasHardware =
          await LocalAuthentication!.hasHardwareAsync();
        const isEnrolled =
          await LocalAuthentication!.isEnrolledAsync();
        setAvailable(hasHardware && isEnrolled);

        const storedEnabled =
          await SecureStore!.getItemAsync(BIOMETRIC_ENABLED_KEY);
        setEnabled(storedEnabled === "true");
      } catch {
        setAvailable(false);
      }
    })();
  }, []);

  const handleToggle = useCallback(async () => {
    if (!isNative || !SecureStore || !LocalAuthentication) return;

    setLoading(true);

    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 400));
      setEnabled(!enabled);
      setLoading(false);
      return;
    }

    try {
      if (enabled) {
        // Disable: clear stored credentials
        await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
        await SecureStore.deleteItemAsync(BIOMETRIC_PASSWORD_KEY);
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "false");
        setEnabled(false);
      } else {
        // Enable: verify biometrics first
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Enable biometric login",
          fallbackLabel: "Cancel",
        });

        if (result.success) {
          // Get current session email
          const { data } = await supabase.auth.getSession();
          const email = data.session?.user?.email;
          if (email) {
            // Note: We can only save the email here. The password must be
            // provided separately (e.g., on next sign-in). For now we mark
            // as enabled and the sign-in flow will save credentials.
            await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
            setEnabled(true);
          }
        }
      }
    } catch {
      // Silently fail
    }

    setLoading(false);
  }, [enabled]);

  // Hide on web or if no biometric hardware
  if (!isNative || !available) return null;

  return (
    <Pressable
      style={[styles.toggleButton, loading && styles.buttonDisabled]}
      onPress={handleToggle}
      disabled={loading}
    >
      <Text style={styles.toggleText}>
        {loading
          ? "..."
          : enabled
            ? "Disable Biometric Login"
            : "Enable Biometric Login"}
      </Text>
      <Text style={styles.toggleIcon}>{enabled ? "🔐" : "🔓"}</Text>
    </Pressable>
  );
}

/**
 * Save credentials to SecureStore after a successful email/password sign-in.
 * Call this from the sign-in flow when biometric is enabled.
 */
export async function saveBiometricCredentials(
  email: string,
  password: string,
): Promise<void> {
  if (!isNative || !SecureStore) return;
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    if (enabled === "true") {
      await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email);
      await SecureStore.setItemAsync(BIOMETRIC_PASSWORD_KEY, password);
    }
  } catch {
    // Silently fail
  }
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2a2a4a",
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#3a3a5a",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    color: "#ff4444",
    fontSize: 12,
    textAlign: "center",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2a2a4a",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#3a3a5a",
  },
  toggleText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  toggleIcon: {
    fontSize: 18,
  },
});
