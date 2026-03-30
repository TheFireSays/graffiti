import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import type { Database } from "./types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "demo-anon-key";

// Web: use localStorage; Native: use SecureStore for encrypted persistence
function getStorageAdapter() {
  if (Platform.OS === "web") {
    return {
      getItem: (key: string) => {
        try { return localStorage.getItem(key); } catch { return null; }
      },
      setItem: (key: string, value: string) => {
        try { localStorage.setItem(key, value); } catch { /* noop */ }
      },
      removeItem: (key: string) => {
        try { localStorage.removeItem(key); } catch { /* noop */ }
      },
    };
  }
  // Dynamic import to avoid crashing on web
  const SecureStore = require("expo-secure-store");
  return {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
