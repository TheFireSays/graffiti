# Superpowers Review

Date: 2026-03-29
Project: `/home/overlord/projects/graffiti`
Docs reviewed:
- `/home/overlord/projects/docs/superpowers/specs/2026-03-29-graffiti-app-design.md`
- `/home/overlord/projects/docs/superpowers/research/2026-03-29-competitive-analysis.md`
- `/home/overlord/projects/docs/superpowers/plans/2026-03-29-01-project-scaffolding.md`
- `/home/overlord/projects/docs/superpowers/plans/2026-03-29-02-auth-flow.md`
- `/home/overlord/projects/docs/superpowers/plans/2026-03-29-03-map-view.md`
- `/home/overlord/projects/docs/superpowers/plans/2026-03-29-04-ar-camera-tag-placement.md`
- `/home/overlord/projects/docs/superpowers/plans/2026-03-29-05-crew-system.md`
- `/home/overlord/projects/docs/superpowers/plans/2026-03-29-06-profile-leaderboard.md`
- `/home/overlord/projects/docs/superpowers/plans/2026-03-29-07-scoring-xp-zone-control.md`
- `/home/overlord/projects/docs/superpowers/plans/2026-03-29-08-activity-feed-realtime.md`
- `/home/overlord/projects/docs/superpowers/plans/2026-03-29-09-stabilization.md`

## Executive Summary

The project has a solid MVP shape and a coherent product direction, but the current codebase is still much closer to a seeded prototype than a secure game backend. The biggest problems are:

1. The trust boundary is weak. Authenticated clients can still bypass core game rules.
2. Crew membership and invite rules are not enforced atomically or securely.
3. Zone-control logic has at least one correctness bug and misses spec behavior.
4. The implementation does not yet match the spec around solo crews, organic zone generation, AR overlays, moderation, anti-cheat, and proximity-based map/feed behavior.
5. The repo already has doc/code/test drift. Jest passes, but TypeScript does not.

The main recommendation is to tighten the backend contract before adding more features. Right now the app can demo the concept, but the current server/data model is not ready to support adversarial clients or real scale.

## High-Severity Findings

### 1. The backend trust model is not safe enough for a competitive game

Evidence:
- `supabase/migrations/00018_place_tag_scored.sql:17`
- `supabase/migrations/00012_create_rls_policies.sql:19`
- `supabase/migrations/00012_create_rls_policies.sql:94`

Problems:
- `place_tag_scored` accepts `p_user_id` from the client and does not verify it against `auth.uid()`.
- The `users` table still allows clients to update their own profile directly.
- The `tags` table still allows direct tag inserts from authenticated users.

Why this matters:
- A malicious client can attempt impersonation or bypass intended server-only flows.
- A user can potentially write directly to tables instead of going through the scored RPC.
- Competitive mechanics are not credible if the write surface is still broadly client-writable.

Recommendation:
- Make `place_tag_scored` derive user identity from `auth.uid()` instead of accepting `p_user_id`.
- Remove direct client `insert` access to `tags`.
- Narrow direct `users.update` access to only allowed profile fields, or move profile writes behind RPCs.
- Treat RPC + RLS as the authoritative mutation path.

### 2. Crew creation/join is not atomic and invite security is too loose

Evidence:
- `src/stores/crew-store.ts:150`
- `src/stores/crew-store.ts:193`
- `supabase/migrations/00012_create_rls_policies.sql:45`
- `supabase/migrations/00016_invite_lookup_policy.sql:1`
- `supabase/migrations/00016_invite_lookup_policy.sql:7`

Problems:
- Crew creation is split into 3 client-side writes: create crew, insert crew member, update user.
- Crew join is split into 3 client-side writes: read invite, insert crew member, update user, then separately increment invite usage.
- Any authenticated user can look up invites by code.
- Any authenticated user can update invite `use_count`.
- RLS currently lets users insert themselves into `crew_members`.

Why this matters:
- Partial failure creates inconsistent state.
- Invite counters are race-prone and easy to abuse.
- A competitive team system cannot rely on optimistic multi-step client orchestration.

Recommendation:
- Replace crew creation and crew join with single transactional RPCs.
- Validate invite ownership, expiry, and usage inside Postgres.
- Remove direct client `crew_members.insert`.
- Remove broad invite update permission and only mutate invite usage inside the join RPC.

### 3. `member_count` is likely wrong for newly created crews

Evidence:
- `supabase/migrations/00003_create_crews.sql:8`
- `supabase/migrations/00013_create_triggers.sql:25`

Problem:
- `crews.member_count` defaults to `1`.
- The insert trigger increments member count again when the founder is inserted into `crew_members`.

Why this matters:
- New crews likely start at `2` members instead of `1`.
- This is exactly the kind of denormalized-counter bug that spreads into UI and leaderboards.

Recommendation:
- Initialize `member_count` at `0` and let the trigger own the counter.
- Or remove the trigger and calculate/set the counter in a single transactional RPC.

### 4. Zone-control trigger has a correctness bug and does not implement the tie-break rule

Evidence:
- `supabase/migrations/00019_zone_control_trigger.sql:48`
- `supabase/migrations/00011_create_activity_feed.sql:7`
- `/home/overlord/projects/docs/superpowers/specs/2026-03-29-graffiti-app-design.md:119`

Problems:
- The trigger inserts `00000000-0000-0000-0000-000000000000` as `actor_id` when no active tag exists.
- `activity_feed.actor_id` is a required FK, so that insert can fail.
- The tie-break rule from the spec is "most recent tag timestamp", but the trigger just picks the first max count it sees from `jsonb_each_text`.

Why this matters:
- Tag decay or certain zone transitions can break feed writes.
- Zone ownership can become nondeterministic and diverge from the spec.

Recommendation:
- Compute the winner from real tag rows, not from unordered JSON.
- Implement an explicit secondary sort on latest tag timestamp.
- Either make `actor_id` nullable for system events or use a real system actor record.

## Medium-Severity Findings

### 5. Solo play is not implemented the way the spec describes

Evidence:
- `/home/overlord/projects/docs/superpowers/specs/2026-03-29-graffiti-app-design.md:123`
- `src/components/crew/no-crew-view.tsx:23`
- `supabase/migrations/00018_place_tag_scored.sql:131`
- `supabase/migrations/00013_create_triggers.sql:86`

Problems:
- The spec says solo players are mechanically identical to crews.
- The app still has a real "no crew" path.
- Crewless tags are inserted with `crew_id = null`.
- Zone counts ignore null crews.

Why this matters:
- A crewless user can participate, but not under the same mechanics as a solo crew.
- The product claim and backend semantics currently disagree.

Recommendation:
- Either auto-create a one-person crew on signup and fully embrace the solo-crew model.
- Or remove the solo-crew language from the spec and keep unaffiliated users as a distinct mode.

### 6. Organic zone expansion is specified but not implemented

Evidence:
- `/home/overlord/projects/docs/superpowers/specs/2026-03-29-graffiti-app-design.md:98`
- `supabase/migrations/00018_place_tag_scored.sql:77`
- `supabase/seed.sql:64`

Problems:
- The spec says new zones should be created when a tag lands outside existing territory.
- The current backend only looks up an existing zone and returns `null` if none exists.
- The playable map currently depends on pre-seeded Austin zones.

Why this matters:
- "Every location on Earth has something to interact with" is not true today.
- Expansion, exploration, and first-claim dynamics are not real yet.

Recommendation:
- Add a server-side zone-generation path now if it is part of the MVP promise.
- If not, reduce the claim in the spec and call it a seeded-city MVP.

### 7. Realtime + map loading is demo-friendly but not production-shaped

Evidence:
- `supabase/migrations/00014_create_map_functions.sql:27`
- `src/stores/map-store.ts:34`
- `src/stores/map-store.ts:52`
- `src/components/drawer/nearby-tab.tsx:13`
- `src/components/drawer/feed-tab.tsx:21`

Problems:
- `get_tags_for_map` returns all active tags.
- The map store reloads all zones, all tags, and all crews on each refresh.
- Realtime triggers a full reload on any tag or zone change.
- Nearby sorts the entire tag set client-side.
- Feed is a global latest-50 query, not a nearby/proximity feed.

Why this matters:
- This will become expensive quickly as tag count grows.
- The implementation does not match the proximity-focused UX described in the spec.

Recommendation:
- Add viewport- or radius-bounded map queries.
- Split global feed from nearby feed explicitly.
- Refresh incrementally from realtime payloads where possible.

### 8. The app still does not deliver the claimed AR loop

Evidence:
- `/home/overlord/projects/docs/superpowers/specs/2026-03-29-graffiti-app-design.md:58`
- `src/components/camera/camera-view.tsx:42`
- `src/app/(tabs)/tag.tsx:45`
- `src/components/map/tag-detail-sheet.tsx:13`

Problems:
- Camera view is currently a camera feed plus HUD.
- Nearby tags are not overlaid in camera space.
- The UI does not currently support "go over this tag" flows.
- The tag detail sheet has no report or contest action.

Why this matters:
- The differentiator is still mostly thematic, not mechanical.
- The user experience is more "camera-assisted placement" than "AR graffiti."

Recommendation:
- Reframe the current state honestly as a GPS + camera placement MVP.
- Do not overstate the AR implementation until camera overlays of nearby tags exist.

### 9. Anti-cheat and rate limiting are called out in the docs, but not operational yet

Evidence:
- `/home/overlord/projects/docs/superpowers/research/2026-03-29-competitive-analysis.md:182`
- `/home/overlord/projects/docs/superpowers/specs/2026-03-29-graffiti-app-design.md:502`
- `supabase/migrations/00022_add_last_tagged_at.sql:1`
- `supabase/migrations/00018_place_tag_scored.sql:149`

Problems:
- Docs emphasize anti-cheat from day 1.
- `last_tagged_at` exists but is not used in scoring or placement validation.
- No movement checks, spoof heuristics, or cooldowns are visible in the codebase.

Why this matters:
- Location games get destroyed by spoofing and spam before other polish matters.

Recommendation:
- Minimum viable anti-abuse should include tag cooldowns, velocity sanity checks, and placement spacing checks.
- If full anti-cheat is deferred, say so explicitly in the spec instead of claiming day-1 coverage.

## Product/Spec Disagreements

### 10. The backend architecture story is inconsistent across the docs

Evidence:
- `/home/overlord/projects/docs/superpowers/specs/2026-03-29-graffiti-app-design.md:22`
- `/home/overlord/projects/docs/superpowers/plans/2026-03-29-04-ar-camera-tag-placement.md:7`
- `/home/overlord/projects/docs/superpowers/plans/2026-03-29-07-scoring-xp-zone-control.md:7`

Conflicting claims:
- The spec says game logic lives in Supabase Edge Functions.
- The AR plan says the client directly queries PostGIS and inserts tags before server validation exists.
- The scoring plan moves core game logic into Postgres RPCs.

Recommendation:
- Pick one authoritative mutation architecture and rewrite the spec/plans to match it.
- For this app, Postgres RPCs + strict RLS is the simplest credible MVP.

### 11. Seasonal competition is presented as strategically important, but not reflected in the implementation model

Evidence:
- `/home/overlord/projects/docs/superpowers/research/2026-03-29-competitive-analysis.md:178`
- `/home/overlord/projects/docs/superpowers/specs/2026-03-29-graffiti-app-design.md:503`

Concern:
- The research is correct that seasonal resets/competitions are a major retention lever.
- The current schema does not appear to model seasons, season stats, snapshotting, or reset boundaries.

Recommendation:
- If seasons matter strategically, include a basic season model earlier.
- Otherwise, soften the roadmap promise and avoid over-indexing on it in the research summary.

## Codebase Quality and Drift

### 12. The repository already has doc/code/test drift

Evidence:
- `src/__tests__/integration/tag-decay.test.ts:20`
- `src/__tests__/integration/zone-control.test.ts:53`
- `src/lib/types/database.ts:548`

Problems observed during review:
- TypeScript fails in integration tests.
- Tests still refer to old assumptions and stale shapes.
- Some tests model statuses/events that do not exist in the current schema or current naming.

Observed check results:
- `npm test -- --runInBand`: passed
- `npm run lint`: passed with warnings in tests
- `npx tsc --noEmit`: failed

Why this matters:
- Passing Jest is giving a false sense of stability.
- The repo is already drifting faster than the docs can keep up.

Recommendation:
- Treat `tsc --noEmit` as a required gate.
- Fix stale tests before more features land.
- Regenerate and re-check database types whenever migrations change.

### 13. Generated/project documentation is still template-level in places

Evidence:
- `README.md:1`

Problem:
- The project README is still the default Expo template.

Why this matters:
- It weakens handoff quality and contributor onboarding.
- The research specifically calls out build-for-contributors discipline as important.

Recommendation:
- Replace the template README with real setup, local Supabase, test, and architecture instructions.

## Suggestions and Alternatives

### A. Tighten the MVP scope

Current risk:
- The docs promise map control, AR tagging, organic expansion, moderation infrastructure, anti-cheat, realtime feed, solo crews, and a tuned progression economy all at once.

Suggested MVP cut:
- Secure signup + onboarding
- Map with bounded nearby tags and zones
- Transactional crew creation/join
- Transactional scored placement
- Tag decay
- Basic crew leaderboard
- Basic abuse controls

Defer until after the trust model is solid:
- Organic zone expansion
- Camera overlays of nearby tags
- Rich moderation flows
- Seasonal competitions
- Push notifications

### B. Prefer transactional RPCs over more client orchestration

Good candidates:
- `create_crew`
- `join_crew_with_invite`
- `leave_crew`
- `place_tag_scored`
- `report_tag`

Reasoning:
- You are building a competitive system with denormalized counters and territory transitions.
- Client-driven multi-write flows are the wrong abstraction here.

### C. Reframe the current product honestly

Better near-term positioning:
- "Location-based territory game with camera-assisted tagging"

Avoid claiming yet:
- Full AR experience
- Anti-cheat from day 1
- Universal map expansion
- Solo crews if solo is not mechanically equivalent

## Questions Worth Pushing Back On

1. Is the product actually map-first or AR-first?
The implementation strongly suggests map-first. If so, design and roadmap should stop pretending AR is the core differentiator today.

2. Is solo play truly important enough to justify one-person crew mechanics from day one?
If yes, make it real in the schema and onboarding. If no, simplify.

3. Is organic zone creation really MVP?
If yes, it needs immediate backend work. If no, stop using "every location on Earth" language.

4. Should invites exist as mutable table rows exposed to clients at all?
For MVP, invite-code workflows are better as RPCs with minimal client visibility.

## Recommended Immediate Actions

1. Lock down RLS and remove direct client writes for competitive entities.
2. Convert crew create/join/leave into transactional RPCs.
3. Fix `member_count` initialization and zone-control trigger correctness.
4. Implement real tag rate limiting using `last_tagged_at`.
5. Decide whether solo users are real crews or not, then align spec and code.
6. Decide whether organic zone generation is in or out of MVP, then align spec and code.
7. Fix stale integration tests and make `tsc --noEmit` a hard requirement.
8. Replace the template README with actual project documentation.

## Raw Verification Notes

Checks run during review:
- `npm test -- --runInBand`
- `npm run lint`
- `npx tsc --noEmit`

Results:
- Jest passed: 11 suites, 73 tests.
- Lint passed with warnings in tests only.
- TypeScript failed in integration tests due stale assumptions around decay/status/RPC usage.
