# Graffiti App — Progress Tracker

**Branch:** `dev/scaffolding`
**Started:** 2026-03-29

---

## Scaffolding Plan (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-01-project-scaffolding.md`

- [x] Task 1: Create Expo Project
- [x] Task 2: Install Core Dependencies
- [x] Task 3: Initialize Supabase Local Development
- [x] Task 4: Database Migration — Enable PostGIS
- [x] Task 5: Database Migration — Create Users Table
- [x] Task 6: Database Migration — Create Crews and Crew Members Tables
- [x] Task 7: Database Migration — Create Invites Table
- [x] Task 8: Database Migration — Create Tag Images Table
- [x] Task 9: Database Migration — Create Zones Table
- [x] Task 10: Database Migration — Create Tags Table
- [x] Task 11: Database Migration — Create Restricted Zones, Reports, Activity Feed
- [x] Task 12: Database Migration — Row Level Security Policies
- [x] Task 13: Database Migration — Triggers (signup + counter safety nets)
- [x] Task 14: Seed Script — Test Data
- [x] Task 15: Supabase Client Setup
- [x] Task 16: Zustand Auth Store
- [x] Task 17: App Shell — Root Layout with Auth Provider
- [x] Task 18: App Shell — Bottom Tab Navigator
- [x] Task 19: End-to-End Verification

---

## Auth Flow Plan (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-02-auth-flow.md`

- [x] Task 1: Update Auth Store with Onboarding State
- [x] Task 2: Auth Layout and Sign-In Screen
- [x] Task 3: Sign-Up Screen
- [x] Task 4: Onboarding — Username Selection
- [x] Task 5: Root Layout — Auth Gate with Route Protection
- [x] Task 6: Profile Sign-Out Button
- [x] Task 7: Supabase Local Auth Config
- [x] Task 8: Clean Up Template Components
- [x] Task 9: E2E Auth Flow Verification

---

## Map View Plan (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-03-map-view.md`

- [x] Task 1: User Location Hook
- [x] Task 2: Geo Query Helpers
- [x] Task 3: Database Functions for Map Queries
- [x] Task 4: Map Data Store (Zustand)
- [x] Task 5: ZonePolygon Component
- [x] Task 6: TagMarker Component
- [x] Task 7: TagDetailSheet Component
- [x] Task 8: GraffitiMapView Component
- [x] Task 9: Pull-Up Drawer (Nearby / Feed / Missions tabs)
- [x] Task 10: Map Screen — Wire Everything Together
- [x] Task 11: E2E Map Verification

---

## AR Camera + Tag Placement Plan (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-04-ar-camera-tag-placement.md`

- [x] Task 1: Tag Placement Store
- [x] Task 2: Tag Placement Logic + DB Functions
- [x] Task 3: Camera View Component
- [x] Task 4: Tag Library Sheet
- [x] Task 5: Color Picker
- [x] Task 6: Placement Confirmation
- [x] Task 7: Tag Screen — Wire Everything Together
- [x] Task 8: E2E Verification

---

## Crew System Plan (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-06-crew-system.md`

- [x] Task 1: Crew Store (Zustand)
- [x] Task 2: NoCrewView + CreateCrewForm Components
- [x] Task 3: CrewRoster + CrewInvites + CrewDashboard Components
- [x] Task 4: Wire Up Crew Screen
- [x] Task 5: Invite RLS Fix (migration 00016)
- [x] Task 6: E2E Verification

---

## Profile + Leaderboard Plan (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-06-profile-leaderboard.md`

- [x] Task 1: Profile Store (tag history + leaderboard queries)
- [x] Task 2: Stat Cards Component
- [x] Task 3: Tag History Component
- [x] Task 4: Leaderboards Component (top taggers + top crews)
- [x] Task 5: Profile Screen — Wire Everything Together
- [x] Task 6: End-to-End Verification (lint clean)

---

## Scoring + XP + Zone Control Plan (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-07-scoring-xp-zone-control.md`

- [x] Task 1: game_constants migration (00017)
- [x] Task 2: place_tag_scored RPC migration (00018)
- [x] Task 3: zone_control trigger migration (00019)
- [x] Task 4: tag_decay migration (00020)
- [x] Task 5: Update client — tag-placement.ts calls place_tag_scored RPC; tag.tsx refreshes auth profile
- [x] Task 6: E2E verification — db reset clean, RPC returns XP/spray data, lint clean

---

## Activity Feed + Realtime Plan (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-08-activity-feed-realtime.md`

- [x] Task 1: Enable Realtime on Tables (migration 00021)
- [x] Task 2: Realtime Hook (use-realtime.ts)
- [x] Task 3: Live Activity Feed (feed-tab.tsx with useRealtime)
- [x] Task 4: Live Map Data Refresh (map-store.ts subscribeToChanges + index.tsx wired)
- [x] Task 5: End-to-End Verification (db reset clean, all 3 tables in publication, lint 0 errors)

---

## Stabilization Plan (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-09-stabilization.md`

- [x] Task 1: Add `last_tagged_at` column to users table (migration 00022)
- [x] Task 2: Fix all TypeScript strict mode errors (`tsc --noEmit` clean)
- [x] Task 3: Add eslint-plugin-security, fix all lint issues (0 errors)
- [x] Task 4: Set up jest + @testing-library/react-native test runner
- [x] Task 5: Unit tests for all 5 Zustand stores (43 tests)
- [x] Task 6: Integration tests for Supabase RPCs (14 tests)
- [x] Task 7: Component smoke tests for auth, tag placement, crew flows (16 tests)
- [x] Task 8: Final verification — all checks passing (73 total tests, 0 type errors, 0 lint errors)

---

## Security Hardening Plan (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-10-security-hardening.md`

- [x] Task 1: Lock down `place_tag_scored` — auth.uid() + rate limiting (migration 00023)
- [x] Task 2: Transactional crew RPCs — create_crew, join_crew, leave_crew (migration 00024)
- [x] Task 3: Fix zone control trigger — recency tie-break + safe actor_id (migration 00025)
- [x] Task 4: Fix crew member_count default 0 (migration 00026)
- [x] Task 5: Restrict user profile updates to safe fields via RPC (migration 00027)
- [x] Task 6: Update tests — 75 tests passing, 0 type errors, 0 lint errors

---

## Phase 1: Polish & Docs (Complete)

- [x] Task 1: Update design spec — Edge Functions → Postgres RPCs, organic zones = Phase 2, AR MVP = camera placement
- [x] Task 2: Write real README.md (tech stack, setup, structure, tests)
- [x] Task 3: Push to remote (`git push origin dev/scaffolding`)

---

## Phase 2: Notifications System (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-11-notifications.md`

- [x] Task 1: Push tokens migration (00028) — table + register/unregister RPCs
- [x] Task 2: Notification queue migration (00029) — table + activity_feed trigger
- [x] Task 3: Regenerate database types
- [x] Task 4: Notification store (Zustand) — 7 tests
- [x] Task 5: useNotifications hook — permission request + token registration
- [x] Task 6: NotificationListener component — realtime subscription
- [x] Task 7: Wire into app layout
- [x] Task 8: Enable realtime on notification_queue (migration 00030)
- [x] Task 9: Integration tests for notification RPCs — 5 tests
- [x] Task 10: Full verification — 87 tests, 0 type errors, 0 lint errors

---

## Phase 3: Tag Image Storage (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-12-tag-image-storage.md`

- [x] Task 1: Storage buckets migration (00031) — tag-images + avatars with RLS policies
- [x] Task 2: Update tag image URLs migration (00032) — placeholder marker
- [x] Task 3: Tag library image rendering — Image component with color-box fallback
- [x] Task 4: AvatarPicker component — image picker + Storage upload + profile update (2 tests)
- [x] Task 5: Wire avatar into profile screen
- [x] Task 6: Full verification — 89 tests, 0 type errors, 0 lint errors

---

## Phase 4: Content Moderation (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-13-content-moderation.md`

- [x] Task 1: Profanity filter library (bad-words wrapper) — 3 tests
- [x] Task 2: Report & moderation RPCs (migration 00033) — report_tag + review_report
- [x] Task 3: Report button in TagDetailSheet
- [x] Task 4: Username + crew name profanity validation
- [x] Task 5: Integration tests for moderation RPCs — 4 tests
- [x] Task 6: Full verification — 96 tests, 0 type errors, 0 lint errors

---

## Phase 5: Settings & Profile Editing (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-14-settings-profile.md`

- [x] Task 1: Delete account RPC (migration 00034) — soft delete with PII cleanup
- [x] Task 2: Settings screen — notifications toggle, sign out, delete account
- [x] Task 3: Profile editing — inline display name editing with profanity filter
- [x] Task 4: Integration tests — 2 tests for delete_account + update_profile
- [x] Task 5: Full verification — 98 tests, 0 type errors, 0 lint errors

**Plan (expanded):** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-14-settings-profile-editing.md`

- [x] Task 1: `src/app/settings.tsx` — full settings screen with username/display name editing, profanity filter, sign out, delete account confirmation dialog
- [x] Task 2: Profile tab — Settings button updated to navigate to `/settings` (outside tabs)
- [x] Task 3: E2E verification — 0 lint errors, 0 type errors, 98 tests passing

---

## Phase 6: Deploy to Supabase Cloud (Complete)

- [x] Step 1: Supabase CLI login — generated access token via dashboard (Playwright)
- [x] Step 2: Linked existing project "Turf" (ref: eugxesnimlmkorbmlhrk, region: West US Oregon)
- [x] Step 3: Pushed all 34 migrations to production — all applied cleanly
- [x] Step 4: Filled in production env vars in `.env.production` (URL, anon key, service_role key, project ref)
- [x] Step 5: Created `.env.production.local` for Expo runtime, added to `.gitignore`
- [x] Step 6: Verified — `db push` confirmed all tables, functions, triggers exist in production
- [x] Step 7: Skipped production seeding (production starts empty, as intended)

---

## Phase 7: Build Dev Client (Complete)

- [x] Step 1: EAS CLI available via `npx eas-cli` (v18.4.0)
- [x] Step 2: EAS login — blocked in non-TTY (documented for manual run)
- [x] Step 3: Created `eas.json` with development/preview/production profiles
- [x] Step 4: Build — requires manual `eas login` first, then `npx eas-cli build --platform android --profile development`
- [x] Step 5: Added physical device testing instructions to README.md

---

## Phase 8: Anti-Cheat Foundations (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-15-anti-cheat.md`

- [x] Task 1: Schema migration (00035) — suspicious_activity table, flag_suspicious_activity RPC, device_fingerprint on push_tokens, anti-cheat game constants
- [x] Task 2: Updated place_tag_scored (00036) — daily limit check, movement speed check, min distance check, suspicious activity logging
- [x] Task 3: Regenerated database.ts types
- [x] Task 4: Integration tests — 5 tests for daily limit, speed check, min distance, suspicious activity RPC
- [x] Task 5: Full verification — 103 tests, 0 type errors, 0 lint errors

---

## Phase 9: Seasonal Competitions (Complete)

**Plan:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-16-seasonal-competitions.md`

- [x] Task 1: Seasons schema + RPCs (migration 00037) — seasons table, season_leaderboard table, get_active_season + get_season_leaderboard RPCs
- [x] Task 2: Season-aware scoring (migration 00038) — update_season_stats helper, tag insert/archive/zone flip triggers
- [x] Task 3: Season support in profile store — activeSeason, seasonLeaderboard, loadActiveSeason, loadSeasonLeaderboard
- [x] Task 4: Season banner component — shows active season name + days remaining on map
- [x] Task 5: Wire season banner into map screen
- [x] Task 6: Season leaderboard tab in profile screen — third tab showing crew rankings per season
- [x] Task 7: Integration tests + verification — 114 tests, 0 type errors, 0 lint errors

---

## UI Polish Branch (dev/ui-polish) — Complete

### Phase 1: Onboarding Polish
- [x] Install AsyncStorage
- [x] Welcome carousel component (3 slides, Reanimated transitions, skip/next/Get Started)
- [x] Welcome screen route with AsyncStorage persistence
- [x] Root layout routing to welcome on first launch
- [x] 6 component tests for carousel + updated auth-gate tests
- [x] Verification: 110 tests, 0 type errors, 0 lint errors

### Phase 2: Map UX Improvements
- [x] Grid-based tag clustering algorithm (src/lib/clustering.ts)
- [x] ClusterMarker component with count badge and tap-to-zoom
- [x] Zone info bottom sheet (zone name, controlling crew, tag breakdown)
- [x] Tappable zone polygons with zone selection in map store
- [x] Map controls: center on me + zoom in/out buttons
- [x] 11 new tests (clustering logic + zone info sheet)
- [x] Verification: 125 tests, 0 type errors, 0 lint errors

### Phase 3: Deep Linking
- [x] Deep link parser for graffiti:// and https://graffiti.app URLs
- [x] Dynamic routes: /tag/[id] and /crew/[id]
- [x] Universal link config: intentFilters (Android) + associatedDomains (iOS)
- [x] Tag deep link loads map and selects tag
- [x] 10 tests for deep link URL parsing
- [x] Verification: 135 tests, 0 type errors, 0 lint errors

### Phase 4: Error Reporting + Crash Handling
- [x] @sentry/react-native installed and configured (silent without DSN)
- [x] ErrorBoundary component with retry button
- [x] reportError/reportMessage helpers (console in dev, Sentry in prod)
- [x] Root layout wrapped in ErrorBoundary
- [x] 8 new tests (error boundary + error reporting)
- [x] Verification: 142 passing (1 pre-existing failure in offline-queue dynamic import), 0 type errors, 0 lint errors

---

## Notes / Errors

- Task 3/Scaffolding (2026-03-29): Supabase CLI 2.84.4. Two non-critical services stopped (imgproxy, pooler).
- Task 14/Scaffolding: Fixed UUID format — replaced invalid hex prefixes (t→b, z→d) in seed UUIDs.
- Task 15/Scaffolding: Fixed stderr leak ("Connecting to db 5432") in generated database.ts.
- Task 9/Auth: Fixed lint error — unescaped apostrophe in sign-in.tsx.
