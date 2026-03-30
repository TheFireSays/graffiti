import { View, Text, StyleSheet } from "react-native";
import {
  validatePassword,
  getPasswordStrength,
  type PasswordStrength,
} from "../../lib/password-validation";

interface PasswordStrengthMeterProps {
  password: string;
}

const STRENGTH_CONFIG: Record<
  PasswordStrength,
  { color: string; label: string; width: string }
> = {
  weak: { color: "#ff4444", label: "Weak", width: "33%" },
  fair: { color: "#ffbb33", label: "Fair", width: "66%" },
  strong: { color: "#00C851", label: "Strong", width: "100%" },
};

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const validation = validatePassword(password);
  const strength = getPasswordStrength(password);
  const config = STRENGTH_CONFIG[strength];

  return (
    <View style={styles.container}>
      {/* Strength bar */}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { backgroundColor: config.color, width: config.width as any },
          ]}
        />
      </View>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>

      {/* Requirement checklist */}
      <View style={styles.checklist}>
        <CheckItem met={validation.hasMinLength} text="12+ characters" />
        <CheckItem met={validation.hasUppercase} text="Uppercase letter" />
        <CheckItem met={validation.hasLowercase} text="Lowercase letter" />
        <CheckItem met={validation.hasDigit} text="Number" />
        <CheckItem met={validation.hasSpecialChar} text="Special character" />
      </View>
    </View>
  );
}

function CheckItem({ met, text }: { met: boolean; text: string }) {
  return (
    <Text style={[styles.checkItem, met ? styles.checkMet : styles.checkUnmet]}>
      {met ? "\u2713" : "\u2717"} {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  barTrack: {
    height: 6,
    backgroundColor: "#3a3a5a",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  checklist: {
    gap: 4,
  },
  checkItem: {
    fontSize: 12,
  },
  checkMet: {
    color: "#00C851",
  },
  checkUnmet: {
    color: "#666",
  },
});
