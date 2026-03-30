import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useAuthStore } from "../../stores/auth-store";

export function SocialLoginButtons() {
  const socialLoginLoading = useAuthStore((s) => s.socialLoginLoading);
  const socialLoginError = useAuthStore((s) => s.socialLoginError);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithApple = useAuthStore((s) => s.signInWithApple);
  const signInWithFacebook = useAuthStore((s) => s.signInWithFacebook);
  const clearSocialLoginError = useAuthStore((s) => s.clearSocialLoginError);

  const isGoogleLoading = socialLoginLoading === "google";
  const isAppleLoading = socialLoginLoading === "apple";
  const isFacebookLoading = socialLoginLoading === "facebook";
  const isAnyLoading = socialLoginLoading !== null;

  const showApple = Platform.OS === "ios";

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {socialLoginError ? (
        <Pressable onPress={clearSocialLoginError}>
          <Text style={styles.error}>{socialLoginError}</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={[styles.googleButton, isAnyLoading && styles.buttonDisabled]}
        onPress={signInWithGoogle}
        disabled={isAnyLoading}
        testID="google-sign-in-button"
      >
        {isGoogleLoading ? (
          <ActivityIndicator color="#333" />
        ) : (
          <View style={styles.buttonContent}>
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </View>
        )}
      </Pressable>

      {showApple ? (
        <Pressable
          style={[styles.appleButton, isAnyLoading && styles.buttonDisabled]}
          onPress={signInWithApple}
          disabled={isAnyLoading}
          testID="apple-sign-in-button"
        >
          {isAppleLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.appleIcon}>{"\uF8FF"}</Text>
              <Text style={styles.appleButtonText}>Continue with Apple</Text>
            </View>
          )}
        </Pressable>
      ) : null}

      <Pressable
        style={[styles.facebookButton, isAnyLoading && styles.buttonDisabled]}
        onPress={signInWithFacebook}
        disabled={isAnyLoading}
        testID="facebook-sign-in-button"
      >
        {isFacebookLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonContent}>
            <View style={styles.facebookIcon}>
              <Text style={styles.facebookIconText}>f</Text>
            </View>
            <Text style={styles.facebookButtonText}>
              Continue with Facebook
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#3a3a5a",
  },
  dividerText: {
    color: "#666",
    fontSize: 14,
  },
  error: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 8,
  },
  googleButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  googleButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  appleButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  appleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  appleIcon: {
    color: "#fff",
    fontSize: 20,
  },
  facebookButton: {
    backgroundColor: "#1877F2",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  facebookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  facebookIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  facebookIconText: {
    color: "#1877F2",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
