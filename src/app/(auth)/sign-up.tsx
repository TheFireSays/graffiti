import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { supabase } from "../../lib/supabase";
import { PasswordStrengthMeter } from "../../components/auth/password-strength-meter";
import { SocialLoginButtons } from "../../components/auth/social-login-buttons";
import { getPasswordStrength } from "../../lib/password-validation";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = password ? getPasswordStrength(password) : null;
  const isPasswordStrongEnough = strength === "fair" || strength === "strong";

  async function handleSignUp() {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!isPasswordStrongEnough) {
      setError("Password must be at least fair strength.");
      return;
    }

    // eslint-disable-next-line security/detect-possible-timing-attacks -- user-facing validation, not a security comparison
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <Text style={styles.title}>Graffiti</Text>
          <Text style={styles.subtitle}>Create your account</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
          />

          <PasswordStrengthMeter password={password} />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textContentType="newPassword"
          />

          <Pressable
            style={[
              styles.button,
              (loading || !isPasswordStrongEnough) && styles.buttonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={loading || !isPasswordStrongEnough}
          >
            {loading ? (
              <ActivityIndicator color="#1a1a2e" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </Pressable>

          {/* Divider for future social buttons */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <SocialLoginButtons />

          <Link href="/(auth)/sign-in" asChild>
            <Pressable style={styles.linkButton}>
              <Text style={styles.linkText}>
                Already have an account?{" "}
                <Text style={styles.linkBold}>Sign In</Text>
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    color: "#4ecdc4",
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  error: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 8,
  },
  input: {
    backgroundColor: "#2a2a4a",
    color: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3a3a5a",
  },
  button: {
    backgroundColor: "#4ecdc4",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#1a1a2e",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#3a3a5a",
  },
  dividerText: {
    color: "#666",
    fontSize: 14,
    marginHorizontal: 16,
  },
  linkButton: {
    padding: 12,
    alignItems: "center",
  },
  linkText: {
    color: "#999",
    fontSize: 14,
  },
  linkBold: {
    color: "#4ecdc4",
    fontWeight: "bold",
  },
});
