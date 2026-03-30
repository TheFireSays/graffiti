/**
 * Random username generator for new account onboarding.
 *
 * Produces fun, memorable usernames in the pattern:
 *   adjective + Noun + Suffix   (camelCase, e.g. "lazyWolfDash")
 *
 * Each generated name is checked against the profanity filter; flagged names
 * are silently discarded and regenerated.
 */

import { containsProfanity } from "./profanity";

// ~80 adjectives: colors, moods, textures, vibes
const ADJECTIVES = [
  "angry",
  "blazing",
  "bold",
  "brave",
  "bright",
  "calm",
  "chill",
  "cold",
  "cool",
  "cosmic",
  "crazy",
  "crispy",
  "cyber",
  "dark",
  "dizzy",
  "dopey",
  "dusty",
  "eager",
  "epic",
  "fast",
  "fierce",
  "flash",
  "foggy",
  "fresh",
  "frozen",
  "funky",
  "fuzzy",
  "ghost",
  "glow",
  "golden",
  "gritty",
  "happy",
  "hazy",
  "heavy",
  "hidden",
  "hungry",
  "hyper",
  "icy",
  "iron",
  "jade",
  "jolly",
  "keen",
  "lazy",
  "light",
  "lucky",
  "lunar",
  "magic",
  "mega",
  "misty",
  "moody",
  "neon",
  "night",
  "ninja",
  "noble",
  "nova",
  "pixel",
  "polar",
  "proud",
  "quick",
  "quiet",
  "rapid",
  "rebel",
  "retro",
  "royal",
  "rusty",
  "savage",
  "shady",
  "sharp",
  "silent",
  "slick",
  "smoky",
  "snowy",
  "solar",
  "sonic",
  "spicy",
  "steel",
  "storm",
  "super",
  "swift",
  "turbo",
  "ultra",
  "vivid",
  "wacky",
  "wild",
  "witty",
  "zen",
] as const;

// ~80 nouns: animals, objects, elements
const NOUNS = [
  "Bear",
  "Blade",
  "Bolt",
  "Cloud",
  "Comet",
  "Coral",
  "Crane",
  "Crow",
  "Drake",
  "Eagle",
  "Ember",
  "Falcon",
  "Flame",
  "Flare",
  "Fox",
  "Frost",
  "Ghost",
  "Glider",
  "Goat",
  "Hawk",
  "Hound",
  "Hyena",
  "Ivy",
  "Jade",
  "Jaguar",
  "Jet",
  "Kodiak",
  "Leaf",
  "Leopard",
  "Lion",
  "Llama",
  "Lynx",
  "Mango",
  "Mantis",
  "Mars",
  "Moth",
  "Nebula",
  "Ocelot",
  "Onyx",
  "Orchid",
  "Osprey",
  "Otter",
  "Owl",
  "Panda",
  "Panther",
  "Petal",
  "Pixel",
  "Prism",
  "Pulse",
  "Puma",
  "Quartz",
  "Raven",
  "Reed",
  "Ridge",
  "Robin",
  "Sage",
  "Shark",
  "Shell",
  "Slate",
  "Snake",
  "Spark",
  "Spire",
  "Squid",
  "Stag",
  "Stone",
  "Thorn",
  "Tiger",
  "Torch",
  "Viper",
  "Void",
  "Wasp",
  "Wave",
  "Whale",
  "Wolf",
  "Wren",
  "Yak",
  "Zebra",
  "Zen",
  "Zephyr",
] as const;

// ~50 suffixes: action words, short tags, numbers
const SUFFIXES = [
  "Ace",
  "Arc",
  "Ash",
  "Blitz",
  "Bolt",
  "Boom",
  "Burn",
  "Buzz",
  "Cash",
  "Crew",
  "Crypt",
  "Dash",
  "Dawn",
  "Dome",
  "Drop",
  "Dusk",
  "Echo",
  "Edge",
  "Fire",
  "Fist",
  "Flux",
  "Fury",
  "Glow",
  "Grid",
  "Haze",
  "Hex",
  "Ink",
  "Jab",
  "Kick",
  "King",
  "Knox",
  "Lab",
  "Link",
  "Lux",
  "Max",
  "Nuke",
  "Orb",
  "Peak",
  "Pop",
  "Raid",
  "Rex",
  "Rip",
  "Rush",
  "Snap",
  "Tag",
  "Vex",
  "Volt",
  "Wax",
  "Zap",
  "Zone",
] as const;

const MAX_LENGTH = 20;
const MAX_RETRIES = 50;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildUsername(): string {
  const adj = pick(ADJECTIVES);
  const noun = pick(NOUNS);
  const suffix = pick(SUFFIXES);
  return `${adj}${noun}${suffix}`;
}

/**
 * Generate a single random username that passes profanity checks and length
 * constraints.
 */
export function generateUsername(): string {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const name = buildUsername();
    if (name.length <= MAX_LENGTH && !containsProfanity(name)) {
      return name;
    }
  }
  // Fallback — extremely unlikely to reach here
  return `user${Math.floor(Math.random() * 900000 + 100000)}`;
}

/**
 * Generate `count` unique username options.
 */
export function generateUsernameOptions(count: number): string[] {
  const seen = new Set<string>();
  const results: string[] = [];
  const maxAttempts = count * MAX_RETRIES;
  let attempts = 0;

  while (results.length < count && attempts < maxAttempts) {
    attempts++;
    const name = generateUsername();
    if (!seen.has(name)) {
      seen.add(name);
      results.push(name);
    }
  }

  return results;
}
