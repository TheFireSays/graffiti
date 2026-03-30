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
} from "react-native";
import { Link } from "expo-router";
import { supabase } from "../../lib/supabase";
import { SocialLoginButtons } from "../../components/auth/social-login-buttons";
import { BiometricLogin } from "../../components/auth/biometric-login";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Graffiti</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

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
          textContentType="password"
        />

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
        </Link>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#1a1a2e" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>

        <BiometricLogin />

        <SocialLoginButtons />

        <Link href="/(auth)/sign-up" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkText}>
              Don&apos;t have an account?{" "}
              <Text style={styles.linkBold}>Sign Up</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
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
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -8,
  },
  forgotText: {
    color: "#999",
    fontSize: 13,
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
