import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WelcomeCarousel } from "../../components/onboarding/welcome-carousel";

const ONBOARDING_KEY = "hasSeenOnboarding";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(auth)/sign-up");
  };

  return <WelcomeCarousel onComplete={handleComplete} />;
}
