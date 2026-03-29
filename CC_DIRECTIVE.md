# CC Autonomous Work Directive

**Date:** 2026-03-29
**Branch:** `dev/scaffolding`
**Mode:** Autonomous loop via ralph-loop

---

## Context

The Graffiti app MVP is feature-complete across 10 subsystems (scaffolding through security hardening). All migrations apply cleanly (27 total), 75 tests pass, 0 type errors, 0 lint errors.

**Read these files before starting:**
- `PROGRESS.md` — what's done
- `CLAUDE.md` — project conventions
- `/home/overlord/projects/docs/superpowers/specs/2026-03-29-graffiti-app-design.md` — design spec
- `/home/overlord/projects/graffiti/SUPERPOWERS_REVIEW_2026-03-29.llm.json` — LLM code review

**Design decisions already made:**
- Solo play = crewless taggers who earn XP but cannot contest zones (Option B — crew-only zone control)
- Organic zone expansion = Phase 2 (not MVP)
- AR MVP = camera placement, not full AR overlay
- Server logic = Postgres RPCs (NOT Edge Functions) — spec says Edge Functions but code uses RPCs, which is correct

---

## What To Do (in order)

### Phase 1: Polish & Docs

1. **Update spec accuracy** — In the design spec, change "Edge Functions" references to "Postgres RPCs" throughout. Note that organic zone expansion is Phase 2. Note AR MVP = camera placement.

2. **Write a real README.md** — Replace the Expo template README with a proper one covering: what the app is, tech stack, local dev setup (Supabase + Expo), project structure, how to run tests, how to contribute. Reference the design spec for product context.

3. **Push to remote** — `git push origin dev/scaffolding`

### Phase 2: Notifications System

Write a plan at `/home/overlord/projects/docs/superpowers/plans/2026-03-29-11-notifications.md`, then execute it.

Scope:
- Set up `expo-notifications` with push token registration
- Store push tokens in a `push_tokens` table (user_id, token, platform, created_at)
- Server-side notification triggers (via Postgres `pg_notify` or a simple notification queue table):
  - Zone flip — notify all members of the losing crew
  - Tag gone over — notify the original tagger
  - Crew invite accepted — notify crew OG/core members
- Client-side notification handling (foreground banner + tap-to-navigate)
- Permission request flow on first launch

### Phase 3: Tag Image Storage

Write a plan at `/home/overlord/projects/docs/superpowers/plans/2026-03-29-12-tag-image-storage.md`, then execute it.

Scope:
- Set up Supabase Storage bucket for tag images
- Upload seed tag images (generate simple SVG placeholders if needed)
- Update `tag_images` table to reference Storage URLs
- Display tag images in the tag library sheet and on map markers
- Avatar upload for user profiles (Supabase Storage + update_profile RPC)

### Phase 4: Content Moderation Infrastructure

Write a plan at `/home/overlord/projects/docs/superpowers/plans/2026-03-29-13-content-moderation.md`, then execute it.

Scope:
- Username/crew name text filtering (profanity filter library — no external API needed for MVP)
- Report flow: "report tag" button → inserts into `reports` table → tag hidden until reviewed
- Basic moderation RPC: `review_report(p_report_id, p_action)` — approve (unhide) or remove tag
- Wire report button into TagDetailSheet component

### Phase 5: Settings & Profile Editing

Write a plan, then execute:
- Settings screen (notification preferences, sign out, delete account)
- Profile editing (username, display name, avatar via update_profile RPC)
- Delete account RPC (soft delete — set is_banned, clear PII)

---

## Rules

1. **Write a plan before coding each phase.** Use `superpowers:writing-plans` skill.
2. **Commit after each task** within a phase. Descriptive messages.
3. **Verify after each phase:** `npx supabase db reset` clean, `npx tsc --noEmit` clean, `npx jest` all passing, `npx eslint src/` 0 errors.
4. **Update PROGRESS.md** after completing each phase.
5. **Do not push to remote** unless explicitly listed (Phase 1 only).
6. **If stuck on a task for 3+ attempts**, document the blocker in PROGRESS.md under Notes/Errors and move on.
7. **Docker socket:** Use `DOCKER_HOST=unix:///var/run/docker.sock` for any Docker/Supabase commands.
8. **Tests:** Write tests for new functionality. Maintain the existing 75+ test baseline.
