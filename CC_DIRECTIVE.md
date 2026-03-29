# CC Autonomous Work Directive — Phase 2

**Date:** 2026-03-29
**Branch:** `dev/scaffolding`
**Mode:** Autonomous loop via ralph-loop
**Completion promise:** `All directive phases complete`

---

## Context

The Graffiti app MVP is feature-complete across 15 subsystems. 34 migrations, 98 tests, 0 type errors, 0 lint errors. Phases 1-5 from the previous directive are done.

**Read these files before starting:**
- `PROGRESS.md` — what's done (everything through Phase 5: Settings & Profile Editing)
- `CLAUDE.md` — project conventions
- `/home/overlord/projects/docs/superpowers/specs/2026-03-29-graffiti-app-design.md` — design spec

**Design decisions already made:**
- Solo play = crewless taggers who earn XP but cannot contest zones (crew-only zone control)
- Organic zone expansion = Phase 2 (not MVP)
- AR MVP = camera placement, not full AR overlay
- Server logic = Postgres RPCs (NOT Edge Functions)
- Monetization = cosmetics only, never pay-to-win
- Tag decay = 7 days

---

## What To Do (in order)

### Phase 6: Deploy to Supabase Cloud

**Goal:** Get the database and auth running in production on Supabase cloud.

#### Step 1: Supabase CLI Login
```bash
npx supabase login
```
If prompted for an access token, generate one at https://supabase.com/dashboard/account/tokens. Store it in `.env.production` as `SUPABASE_ACCESS_TOKEN`.

#### Step 2: Create or Link Supabase Project
Check if a project already exists:
```bash
npx supabase projects list
```

If no project exists, create one:
```bash
npx supabase projects create graffiti --org-id <ORG_ID> --db-password "$(grep SUPABASE_DB_PASSWORD .env.production | cut -d= -f2)" --region us-east-1
```

If a project exists, link it:
```bash
npx supabase link --project-ref <PROJECT_REF> --password "$(grep SUPABASE_DB_PASSWORD .env.production | cut -d= -f2)"
```

#### Step 3: Push Migrations to Production
```bash
npx supabase db push
```
All 34 migrations should apply. If any fail, fix and retry.

#### Step 4: Fill in Production Environment Variables
After project is created/linked, get the values from Supabase dashboard (Settings > API):
- `EXPO_PUBLIC_SUPABASE_URL` — Project URL
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service_role/secret key
- `SUPABASE_PROJECT_REF` — project reference ID

Update `.env.production` with these values. **Do not commit this file.**

#### Step 5: Create `.env.production.local` for Expo
Create a file the Expo app can read at runtime:
```bash
cat > .env.production.local <<EOF
EXPO_PUBLIC_SUPABASE_URL=<value from dashboard>
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<value from dashboard>
EOF
```
Add `.env.production.local` to `.gitignore` if not already there.

#### Step 6: Verify Production Database
```bash
npx supabase db remote commit
```
Confirm all tables, functions, and triggers exist in production.

#### Step 7: Seed Production (Optional)
If the seed script is safe for production (test data only — check `supabase/seed.sql`), **do NOT run it in production**. Production starts empty. Just verify the schema is correct.

**Commit:** Update PROGRESS.md. No code changes expected — this is infrastructure setup.

---

### Phase 7: Build Dev Client for Physical Device Testing

**Goal:** Create an Expo dev build that can be installed on a physical Android device for testing.

#### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

#### Step 2: Log in to Expo
```bash
npx eas login
```
Use the Expo account credentials. If no account exists, create one at https://expo.dev/signup.

**Note:** If eas login requires interactive input and this is running unattended, create the account manually first and provide credentials via environment variables:
```bash
EXPO_TOKEN=<token> npx eas build ...
```
If login fails, document the blocker in PROGRESS.md and skip to Phase 8.

#### Step 3: Configure EAS Build
```bash
npx eas build:configure
```
This creates `eas.json`. Configure it for a development build:

```json
{
  "cli": { "version": ">= 3.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

#### Step 4: Build Android APK (Dev Client)
```bash
npx eas build --platform android --profile development
```
This builds an APK that can be sideloaded. The build runs on EAS servers.

**Note:** This requires an Expo account and may take 10-30 minutes. If the build queue is long or auth fails, document it and move on.

#### Step 5: Document Installation Instructions
Add a section to README.md:
```markdown
## Physical Device Testing

1. Download the dev client APK from the EAS build URL
2. Install on Android device (enable "Install from unknown sources")
3. Start the dev server: `npx expo start --dev-client`
4. Open the dev client app on your phone — it will connect to the dev server
5. Set your dev machine IP in the Expo connection if needed
```

**Commit:** `chore: configure EAS build for Android dev client`

---

### Phase 8: Anti-Cheat Foundations

Write a plan at `/home/overlord/projects/docs/superpowers/plans/2026-03-29-15-anti-cheat.md`, then execute it.

**Scope:**

#### Movement Speed Check
- In `place_tag_scored`, calculate distance between current tag location and the user's previous tag location (from `last_tagged_at` + previous tag's location)
- If the user moved faster than a configurable max speed (e.g., 150 km/h — accounts for driving but catches teleporting), reject with error
- Add `game_constants` entries: `max_movement_speed_kmh` (150), `min_tag_distance_meters` (5)
- Store previous tag location on user record or derive from most recent tag

#### Device Attestation Placeholder
- Add `device_fingerprint text` column to `push_tokens` table (or a new `devices` table)
- Accept a device fingerprint parameter in `register_push_token`
- For now, just store it — actual attestation (Play Integrity API / App Attest) is a later phase
- This creates the schema foundation

#### Duplicate Account Detection
- Add a `flag_suspicious_activity(p_user_id, p_reason)` RPC that inserts into a new `suspicious_activity` table
- Schema: id, user_id, reason, metadata (jsonb), created_at, reviewed (boolean)
- Call it from `place_tag_scored` when speed check triggers (log but don't hard-block on first offense)

#### Rate Limiting Enhancement
- The 30-second cooldown exists. Add a daily tag limit: `max_tags_per_day` constant (default 200)
- Count user's tags in the last 24 hours before allowing placement
- This prevents bot-style mass tagging

**Tests:** Unit tests for speed calculation, integration tests for rate limiting.

---

### Phase 9: Seasonal Competitions Framework

Write a plan at `/home/overlord/projects/docs/superpowers/plans/2026-03-29-16-seasonal-competitions.md`, then execute it.

**Scope:**

#### Seasons Table + Migration
```sql
create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,              -- "March Madness 2026"
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text default 'upcoming',  -- 'upcoming', 'active', 'ended'
  config jsonb default '{}',       -- custom rules for this season
  created_at timestamptz default now()
);

create table public.season_leaderboard (
  season_id uuid references public.seasons(id),
  crew_id uuid references public.crews(id),
  zones_held integer default 0,
  tags_placed integer default 0,
  tags_gone_over integer default 0,
  total_xp integer default 0,
  rank integer,
  primary key (season_id, crew_id)
);
```

#### Season-Aware Scoring
- Modify `place_tag_scored` to check if a season is active
- When active, also increment the crew's season_leaderboard row
- Zone flips during a season also update season stats

#### Season Leaderboard RPC
- `get_season_leaderboard(p_season_id)` — returns ranked crews for a season
- `get_active_season()` — returns current active season or null

#### Season UI
- Add a "Season" indicator on the map screen (banner when active)
- Add season leaderboard tab in the profile/leaderboard screen
- Show "Season Ended" summary when a season closes

**Tests:** Season leaderboard RPC, season-aware scoring.

---

### Phase 10: Offline Tag Queuing

Write a plan at `/home/overlord/projects/docs/superpowers/plans/2026-03-29-17-offline-queuing.md`, then execute it.

**Scope:**

#### Local Queue with AsyncStorage
- When `placeTag()` gets a network error, save the placement request to AsyncStorage
- Schema: `{ id, request, timestamp, status: 'queued' | 'syncing' | 'failed' }`
- Show a "pending" indicator on queued tags in the UI

#### Sync on Reconnect
- Use `NetInfo` from `@react-native-community/netinfo` to detect connectivity changes
- When connection is restored, replay queued requests in order
- Update local state as each syncs (success → remove from queue, failure → mark failed)

#### Conflict Resolution
- If a queued tag's target spot was taken while offline, the server returns an error — show it to the user
- Queued tags expire after 1 hour (stale placement data isn't useful)

#### UI Indicators
- Badge on queued tags (clock icon or "syncing" animation)
- Toast notification when offline queue syncs successfully
- "X tags pending" indicator somewhere visible

**Tests:** Queue/dequeue logic, sync behavior with mocked network states.

---

## Rules

1. **Write a plan before coding each phase (8, 9, 10).** Phase 6 and 7 are infrastructure — follow the steps directly.
2. **Commit after each task** within a phase. Descriptive messages.
3. **Verify after each coding phase:** `DOCKER_HOST=unix:///var/run/docker.sock npx supabase db reset` clean, `npx tsc --noEmit` clean, `npx jest` all passing, `npx eslint src/` 0 errors.
4. **Update PROGRESS.md** after completing each phase.
5. **Push to remote after each phase:** `git push origin dev/scaffolding`
6. **If stuck on a task for 3+ attempts**, document the blocker in PROGRESS.md under Notes/Errors and move on.
7. **Docker socket:** Use `DOCKER_HOST=unix:///var/run/docker.sock` for any Docker/Supabase commands.
8. **Tests:** Write tests for new functionality. Maintain the existing 98+ test baseline.
9. **Supabase credentials:** Production creds are in `.env.production`. Never commit this file.
10. **EAS/Expo credentials:** If auth fails for EAS, document it and move to the next phase. Don't block on interactive login.
