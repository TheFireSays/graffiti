import { useState, useEffect } from "react";
import { DEMO_MODE, DEMO_LOCATION } from "../lib/config";

interface UserLocation {
  latitude: number;
  longitude: number;
  heading: number | null;
}

interface UseLocationResult {
  location: UserLocation | null;
  error: string | null;
  isLoading: boolean;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setLocation({
        latitude: DEMO_LOCATION.latitude,
        longitude: DEMO_LOCATION.longitude,
        heading: DEMO_LOCATION.heading,
      });
      setIsLoading(false);
      return;
    }

    // Dynamic import to avoid crashing on web
    const Location = require("expo-location");
    let subscription: any = null;

    async function startTracking() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        setIsLoading(false);
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        heading: current.coords.heading ?? null,
      });
      setIsLoading(false);

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (update: any) => {
          setLocation({
            latitude: update.coords.latitude,
            longitude: update.coords.longitude,
            heading: update.coords.heading ?? null,
          });
        }
      );
    }

    startTracking();
    return () => { subscription?.remove(); };
  }, []);

  return { location, error, isLoading };
}
