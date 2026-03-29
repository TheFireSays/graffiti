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

## Notes / Errors

- Task 3/Scaffolding (2026-03-29): Supabase CLI 2.84.4. Two non-critical services stopped (imgproxy, pooler).
- Task 14/Scaffolding: Fixed UUID format — replaced invalid hex prefixes (t→b, z→d) in seed UUIDs.
- Task 15/Scaffolding: Fixed stderr leak ("Connecting to db 5432") in generated database.ts.
- Task 9/Auth: Fixed lint error — unescaped apostrophe in sign-in.tsx.
