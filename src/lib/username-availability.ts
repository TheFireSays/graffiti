/**
 * Real-time username availability checker with debounced React hook.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";
import { DEMO_MODE } from "./config";
import { containsProfanity } from "./profanity";

// Usernames reserved in demo mode
const DEMO_TAKEN_USERNAMES = new Set([
  "krush",
  "venom",
  "blaze",
  "nova",
  "phantom",
]);

const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

export interface UsernameAvailabilityResult {
  available: boolean;
  reason?: string;
}

/**
 * Validate format, check profanity, then query Supabase for uniqueness.
 */
export async function checkUsernameAvailability(
  username: string,
): Promise<UsernameAvailabilityResult> {
  // Format validation
  if (!username || username.length < 3) {
    return { available: false, reason: "Username must be at least 3 characters" };
  }
  if (username.length > 20) {
    return { available: false, reason: "Username must be 20 characters or fewer" };
  }
  if (!USERNAME_RE.test(username)) {
    return {
      available: false,
      reason: "Only letters, numbers, and underscores are allowed",
    };
  }

  // Profanity check
  if (containsProfanity(username)) {
    return { available: false, reason: "Username contains inappropriate language" };
  }

  // Demo mode — mock availability
  if (DEMO_MODE) {
    const taken = DEMO_TAKEN_USERNAMES.has(username.toLowerCase());
    return taken
      ? { available: false, reason: "Username is already taken" }
      : { available: true };
  }

  // Real check against the database
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return { available: false, reason: "Unable to check availability right now" };
  }

  return data
    ? { available: false, reason: "Username is already taken" }
    : { available: true };
}

/**
 * React hook that debounces username availability checks at 400ms.
 */
export function useDebouncedUsernameCheck(username: string) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(0);

  const reset = useCallback(() => {
    setChecking(false);
    setAvailable(null);
    setReason(undefined);
  }, []);

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Nothing to check for short inputs
    if (!username || username.length < 3) {
      reset();
      return;
    }

    setChecking(true);
    setAvailable(null);
    setReason(undefined);

    const currentId = ++abortRef.current;

    timerRef.current = setTimeout(async () => {
      const result = await checkUsernameAvailability(username);
      // Only apply if this is still the latest request
      if (currentId === abortRef.current) {
        setChecking(false);
        setAvailable(result.available);
        setReason(result.reason);
      }
    }, 400);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [username, reset]);

  return { checking, available, reason };
}
