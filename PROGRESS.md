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

## Notes / Errors

- Task 3/Scaffolding (2026-03-29): Supabase CLI 2.84.4. Two non-critical services stopped (imgproxy, pooler).
- Task 14/Scaffolding: Fixed UUID format — replaced invalid hex prefixes (t→b, z→d) in seed UUIDs.
- Task 15/Scaffolding: Fixed stderr leak ("Connecting to db 5432") in generated database.ts.
- Task 9/Auth: Fixed lint error — unescaped apostrophe in sign-in.tsx.
