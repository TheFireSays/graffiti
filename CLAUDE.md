# Graffiti App — Autonomous Development Instructions

You are working on the **Graffiti** AR mobile app overnight without a human in the loop. Read this file completely before taking any action.

---

## Your Mission

Execute the scaffolding implementation plan, task by task, using the `superpowers:subagent-driven-development` skill. When done, move on to writing and executing subsequent subsystem plans.

**Plan file:** `/home/overlord/projects/docs/superpowers/plans/2026-03-29-01-project-scaffolding.md`

**Design spec:** `/home/overlord/projects/docs/superpowers/specs/2026-03-29-graffiti-app-design.md`

**Progress tracker:** `PROGRESS.md` (in this directory — update it as you go)

---

## Step 1: Check Prerequisites Before Starting

### Docker
Supabase requires Docker. Check it's running:

```bash
docker ps
```

If you get a permission error:
```bash
sudo chmod 666 /var/run/docker.sock
```

If Docker daemon isn't running:
```bash
sudo systemctl start docker
```

Confirm Docker is working before proceeding to Task 3.

### Supabase CLI
```bash
npx supabase --version
```

Expected: a version number. If missing, install: `npm install -g supabase`

---

## Step 2: Check PROGRESS.md

Read `PROGRESS.md` to see which tasks are already complete. Pick up from the first unchecked task.

Do NOT re-run completed tasks.

---

## Step 3: Execute the Plan

Use **`superpowers:subagent-driven-development`** to execute the plan. The plan has 19 tasks. Tasks 1 and 2 are already done.

**Start from Task 3: Initialize Supabase Local Development.**

Key things to know:
- The template generated `src/` structure (not `app/` at root) — plan already accounts for this
- Supabase local URL is `http://127.0.0.1:54321`
- `.env.local` is gitignored — don't try to commit it
- `npx supabase db reset` applies all migrations + seed in order
- After `supabase start`, capture the anon key for `.env.local`

---

## Step 4: Update PROGRESS.md After Each Task

After completing each task, mark it done in `PROGRESS.md`. This lets you resume correctly if you're interrupted.

---

## Step 5: After Task 19

When all 19 scaffolding tasks are complete:
1. Run `npx expo start` and confirm Metro bundler starts cleanly
2. Run `npx supabase db reset` and confirm all tables exist
3. Use `superpowers:finishing-a-development-branch` to wrap up the branch
4. Then invoke `superpowers:writing-plans` to write the next subsystem plan

**Subsystem order** (from the spec):
1. ✅ Project Scaffolding + Supabase Setup (current)
2. Auth Flow (sign up, sign in, onboarding, username creation)
3. Map View (territory map with PostGIS, zone overlays, crew colors)
4. AR Camera + Tag Placement (GPS overlay, compass heading, tag placement flow)
5. Tag Library + Customization (image picker, color customization)
6. Crew System (create, join with invite, roster, crew stats)
7. Scoring + XP + Zone Control (Edge Functions, game logic)
8. Activity Feed + Realtime (Supabase Realtime subscriptions)
9. Profile + Leaderboard (user stats, rankings)

---

## Error Handling

- If a step fails, document the error in `PROGRESS.md` and try the next step
- If Supabase won't start (Docker issue), fix Docker first — everything depends on it
- If a migration fails, check the SQL for syntax errors before retrying
- If `npx expo doctor` reports issues, run the suggested fixes
- Do NOT get stuck retrying the same failing command more than 3 times — log it and move on

---

## Important Constraints

- Branch: `dev/scaffolding` — stay on this branch for the scaffolding plan
- Commit frequently (after each task, as the plan specifies)
- Do not push to remote without explicit instruction
- The bundle ID `com.graffiti.app` is a placeholder — leave it for now

---

## Credentials Needed

See `.env.local` (created during Task 3 from `supabase start` output). If it doesn't exist yet, it gets created in Task 3.

For Supabase Cloud (production) — not needed for local dev work tonight. Tonight is all local.
