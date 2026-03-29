# Graffiti

A location-based territory game where crews compete to control zones by placing GPS-anchored graffiti tags. Built with Expo/React Native and Supabase.

## What it does

- **Place tags** using your phone's camera + GPS to anchor virtual graffiti to real-world locations
- **Compete for territory** — zones are controlled by the crew with the most active tags
- **Join or create crews** with invite codes, crew colors, and shared leaderboards
- **Progress through tiers** — unlock throw-ups and pieces as you level up from basic tags
- **Tag decay** keeps the map dynamic — crews must revisit territory to maintain control

## Tech stack

| Layer | Tech |
|-------|------|
| Mobile | Expo / React Native (TypeScript) |
| Database | Supabase (PostgreSQL + PostGIS) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime (WebSocket subscriptions) |
| Maps | react-native-maps |
| Camera | expo-camera |
| Location | expo-location |
| State | Zustand |

Server-side game logic (scoring, zone control, crew management) runs as **Postgres RPCs** with strict RLS policies — no client-side writes for competitive entities.

## Project structure

```
src/
  app/           # Expo Router screens (file-based routing)
    (auth)/      # Sign-in, sign-up screens
    (onboarding)/ # Username selection
    (tabs)/      # Map, Tag (camera), Crew, Profile tabs
  components/    # UI components (map, camera, crew, drawer)
  stores/        # Zustand stores (auth, map, crew, profile, tag)
  hooks/         # Custom hooks (location, realtime)
  lib/           # Supabase client, geo helpers, tag placement logic
    types/       # Generated database types
supabase/
  migrations/    # 27 SQL migrations (PostGIS, tables, RLS, RPCs, triggers)
  seed.sql       # Test data (users, crews, zones, tags in Austin, TX)
  config.toml    # Local Supabase config
```

## Local development

### Prerequisites

- Node.js 18+
- Docker (for Supabase local)
- Supabase CLI (`npm install -g supabase`)
- Expo CLI (`npx expo`)

### Setup

```bash
# Install dependencies
npm install

# Start Supabase (requires Docker running)
npx supabase start

# Apply migrations and seed data
npx supabase db reset

# Copy the anon key from supabase start output into .env.local:
# EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon key from supabase start>

# Start the Expo dev server
npx expo start
```

### Running tests

```bash
# All tests (73 tests across 11 suites)
npx jest

# With coverage
npx jest --coverage

# Type checking
npx tsc --noEmit

# Linting
npx eslint src/
```

### Database migrations

Migrations are in `supabase/migrations/` and applied in order by `supabase db reset`. Key migrations:

- `00001` — Enable PostGIS
- `00002–00011` — Core tables (users, crews, tags, zones, activity feed)
- `00012` — Row Level Security policies
- `00017–00020` — Scoring RPCs, zone control trigger, tag decay
- `00023–00027` — Security hardening (auth.uid() enforcement, transactional crew RPCs, restricted user updates)

## Physical Device Testing

1. Log in to EAS: `npx eas-cli login`
2. Build a dev client APK: `npx eas-cli build --platform android --profile development`
3. Download the APK from the EAS build URL
4. Install on Android device (enable "Install from unknown sources")
5. Start the dev server: `npx expo start --dev-client`
6. Open the dev client app on your phone — it will connect to the dev server
7. Set your dev machine IP in the Expo connection if needed

## Design spec

Full product design: [`docs/superpowers/specs/2026-03-29-graffiti-app-design.md`](../docs/superpowers/specs/2026-03-29-graffiti-app-design.md)

## Current status

MVP feature-complete across: scaffolding, auth, map view, camera tag placement, crew system, profile/leaderboard, scoring/XP/zone control, activity feed/realtime, stabilization (73 tests), and security hardening.
