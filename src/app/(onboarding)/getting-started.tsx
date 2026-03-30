import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const TIPS = [
  { icon: "\uD83C\uDFA8", text: "Tag your world \u2014 place digital graffiti anywhere" },
  { icon: "\uD83C\uDFF4", text: "Claim zones \u2014 compete for territory with your crew" },
  { icon: "\uD83D\uDC65", text: "Build your crew \u2014 team up and dominate the map" },
  { icon: "\uD83C\uDFC6", text: "Rise up \u2014 earn XP, level up, climb the leaderboard" },
];

export default function GettingStartedScreen() {
  const router = useRouter();

  function handleContinue() {
    router.replace("/(onboarding)/username");
  }

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Welcome to Graffiti</Text>
        <Text style={styles.subtitle}>
          Your city is your canvas. Here&apos;s how it works:
        </Text>

        <View style={styles.tips}>
          {TIPS.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Let&apos;s Go</Text>
        </Pressable>
      </View>
    </View>
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
    gap: 24,
  },
  title: {
    color: "#4ecdc4",
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  tips: {
    gap: 20,
    paddingHorizontal: 8,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tipIcon: {
    fontSize: 32,
  },
  tipText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#4ecdc4",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#1a1a2e",
    fontSize: 18,
    fontWeight: "bold",
  },
});
