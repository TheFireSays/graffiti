-- ============================================================
-- MODERATION INFRASTRUCTURE
-- Provides audit logging, moderation views, and RPCs for
-- Supabase Studio-based moderation workflows.
-- ============================================================

-- ============================================================
-- 1. MODERATION AUDIT LOG TABLE
-- ============================================================
CREATE TABLE public.moderation_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL, -- 'ban', 'unban', 'warn', 'review_report', 'delete_tag', 'dissolve_crew'
  target_user_id uuid REFERENCES public.users(id),
  target_tag_id uuid,
  target_crew_id uuid,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_moderation_audit_target_user ON moderation_audit_log(target_user_id);
CREATE INDEX idx_moderation_audit_created ON moderation_audit_log(created_at DESC);

COMMENT ON TABLE public.moderation_audit_log IS 'Audit trail for all moderation actions taken by admins';

-- ============================================================
-- 2. MODERATION QUEUE VIEW
-- ============================================================
CREATE OR REPLACE VIEW public.moderation_queue AS
SELECT
  r.id              AS report_id,
  r.reason,
  r.details,
  r.created_at      AS reported_at,
  -- Reported tag details
  t.id              AS tag_id,
  ti.image_url      AS tag_image_url,
  ST_Y(t.location::geometry)  AS tag_lat,
  ST_X(t.location::geometry)  AS tag_lng,
  z.name            AS zone_name,
  t.created_at      AS tag_placed_at,
  -- Reporter
  reporter.username AS reporter_username,
  -- Reported user (tag owner)
  owner.id          AS reported_user_id,
  owner.username    AS reported_username,
  owner.is_banned   AS reported_user_banned,
  -- Count of total reports against this user
  (
    SELECT count(*)
    FROM public.reports r2
    JOIN public.tags t2 ON t2.id = r2.tag_id
    WHERE t2.user_id = owner.id
  )::integer        AS total_reports_against_user
FROM public.reports r
JOIN public.tags t ON t.id = r.tag_id
LEFT JOIN public.tag_images ti ON ti.id = t.tag_image_id
LEFT JOIN public.zones z ON z.id = t.zone_id
JOIN public.users reporter ON reporter.id = r.reporter_id
JOIN public.users owner ON owner.id = t.user_id
WHERE r.status = 'pending'
ORDER BY r.created_at ASC;

COMMENT ON VIEW public.moderation_queue IS 'Pending reports with full context for moderation review';

-- ============================================================
-- 3. SUSPICIOUS USERS VIEW
-- ============================================================
CREATE OR REPLACE VIEW public.suspicious_users AS
SELECT
  u.id              AS user_id,
  u.username,
  u.is_banned,
  sa.violation_count,
  sa.violation_types,
  sa.most_recent_violation,
  u.xp              AS total_xp,
  (SELECT count(*) FROM public.tags WHERE user_id = u.id)::integer AS total_tags,
  u.created_at      AS account_created_at,
  (now() - u.created_at) AS account_age
FROM public.users u
JOIN (
  SELECT
    user_id,
    count(*)::integer AS violation_count,
    array_agg(DISTINCT reason) AS violation_types,
    max(created_at) AS most_recent_violation
  FROM public.suspicious_activity
  WHERE created_at > now() - interval '30 days'
  GROUP BY user_id
) sa ON sa.user_id = u.id
ORDER BY sa.violation_count DESC, sa.most_recent_violation DESC;

COMMENT ON VIEW public.suspicious_users IS 'Users with suspicious activity in the last 30 days';

-- ============================================================
-- 4. BANNED USERS VIEW
-- ============================================================
CREATE OR REPLACE VIEW public.banned_users AS
SELECT
  u.id              AS user_id,
  u.username,
  au.email,
  u.is_banned,
  -- Most recent ban entry
  ban_log.created_at AS banned_at,
  ban_log.notes      AS ban_reason,
  mod_user.username  AS banned_by,
  -- Total reports against this user
  (
    SELECT count(*)
    FROM public.reports r
    JOIN public.tags t ON t.id = r.tag_id
    WHERE t.user_id = u.id
  )::integer         AS total_reports
FROM public.users u
JOIN auth.users au ON au.id = u.id
LEFT JOIN LATERAL (
  SELECT mal.moderator_id, mal.notes, mal.created_at
  FROM public.moderation_audit_log mal
  WHERE mal.target_user_id = u.id
    AND mal.action = 'ban'
  ORDER BY mal.created_at DESC
  LIMIT 1
) ban_log ON true
LEFT JOIN public.users mod_user ON mod_user.id = ban_log.moderator_id
WHERE u.is_banned = true
ORDER BY ban_log.created_at DESC NULLS LAST;

COMMENT ON VIEW public.banned_users IS 'Currently banned users with ban context';

-- ============================================================
-- 5. RPCs
-- ============================================================

-- ban_user
CREATE OR REPLACE FUNCTION ban_user(
  p_user_id uuid,
  p_reason text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_moderator_id uuid := auth.uid();
  v_target record;
BEGIN
  IF v_moderator_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_target FROM public.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF v_target.is_banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is already banned');
  END IF;

  -- Ban the user
  UPDATE public.users SET is_banned = true WHERE id = p_user_id;

  -- Audit log
  INSERT INTO public.moderation_audit_log (moderator_id, action, target_user_id, notes)
  VALUES (v_moderator_id, 'ban', p_user_id, p_reason);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- unban_user
CREATE OR REPLACE FUNCTION unban_user(
  p_user_id uuid,
  p_reason text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_moderator_id uuid := auth.uid();
  v_target record;
BEGIN
  IF v_moderator_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_target FROM public.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF NOT v_target.is_banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is not banned');
  END IF;

  -- Unban the user
  UPDATE public.users SET is_banned = false WHERE id = p_user_id;

  -- Audit log
  INSERT INTO public.moderation_audit_log (moderator_id, action, target_user_id, notes)
  VALUES (v_moderator_id, 'unban', p_user_id, p_reason);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- warn_user
CREATE OR REPLACE FUNCTION warn_user(
  p_user_id uuid,
  p_message text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_moderator_id uuid := auth.uid();
  v_target record;
BEGIN
  IF v_moderator_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_target FROM public.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Send warning notification to the user
  INSERT INTO public.notification_queue (user_id, event_type, title, body, metadata)
  VALUES (
    p_user_id,
    'moderation_warning',
    'Warning from Moderators',
    p_message,
    jsonb_build_object('moderator_id', v_moderator_id)
  );

  -- Audit log
  INSERT INTO public.moderation_audit_log (moderator_id, action, target_user_id, notes)
  VALUES (v_moderator_id, 'warn', p_user_id, p_message);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- delete_tag_moderation
CREATE OR REPLACE FUNCTION delete_tag_moderation(
  p_tag_id uuid,
  p_reason text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_moderator_id uuid := auth.uid();
  v_tag record;
BEGIN
  IF v_moderator_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_tag FROM public.tags WHERE id = p_tag_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tag not found');
  END IF;

  IF v_tag.status = 'removed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tag is already removed');
  END IF;

  -- Set tag status to 'removed' (this triggers update_zone_tag_counts which
  -- recalculates zone control automatically via the existing trigger chain)
  UPDATE public.tags SET status = 'removed' WHERE id = p_tag_id;

  -- Resolve any pending reports for this tag
  UPDATE public.reports
  SET status = 'resolved',
      resolution = 'removed',
      reviewed_by = v_moderator_id,
      reviewed_at = now()
  WHERE tag_id = p_tag_id AND status = 'pending';

  -- Audit log
  INSERT INTO public.moderation_audit_log (moderator_id, action, target_user_id, target_tag_id, notes, metadata)
  VALUES (
    v_moderator_id,
    'delete_tag',
    v_tag.user_id,
    p_tag_id,
    p_reason,
    jsonb_build_object('zone_id', v_tag.zone_id, 'crew_id', v_tag.crew_id)
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- dissolve_crew_moderation
CREATE OR REPLACE FUNCTION dissolve_crew_moderation(
  p_crew_id uuid,
  p_reason text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_moderator_id uuid := auth.uid();
  v_crew record;
  v_member_ids uuid[];
  v_user_id uuid;
BEGIN
  IF v_moderator_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_crew FROM public.crews WHERE id = p_crew_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Crew not found');
  END IF;

  -- Collect member IDs for notifications
  SELECT array_agg(user_id) INTO v_member_ids
  FROM public.crew_members
  WHERE crew_id = p_crew_id;

  -- Null out crew_id on tags (triggers zone control recalculation)
  UPDATE public.tags SET crew_id = NULL WHERE crew_id = p_crew_id;

  -- Clear crew_id on users
  UPDATE public.users SET crew_id = NULL WHERE crew_id = p_crew_id;

  -- Delete the crew (cascades crew_members via FK)
  DELETE FROM public.crews WHERE id = p_crew_id;

  -- Notify former members
  IF v_member_ids IS NOT NULL THEN
    FOREACH v_user_id IN ARRAY v_member_ids LOOP
      INSERT INTO public.notification_queue (user_id, event_type, title, body, metadata)
      VALUES (
        v_user_id,
        'crew_dissolved',
        'Crew Dissolved by Moderator',
        'Your crew ' || v_crew.name || ' has been dissolved by a moderator. Reason: ' || coalesce(p_reason, 'No reason given'),
        jsonb_build_object('crew_name', v_crew.name, 'moderator_id', v_moderator_id)
      );
    END LOOP;
  END IF;

  -- Audit log
  INSERT INTO public.moderation_audit_log (moderator_id, action, target_crew_id, notes, metadata)
  VALUES (
    v_moderator_id,
    'dissolve_crew',
    p_crew_id,
    p_reason,
    jsonb_build_object('crew_name', v_crew.name, 'member_count', v_crew.member_count)
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 6. PROFANITY CHECK FUNCTION + INTEGRATION WITH create_crew
-- ============================================================
CREATE OR REPLACE FUNCTION check_profanity(p_text text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_lower text;
  v_word text;
  v_profanity_list text[] := ARRAY[
    'ass', 'asshole', 'bastard', 'bitch', 'bullshit', 'cock', 'crap',
    'cunt', 'damn', 'dick', 'dildo', 'douche', 'dyke', 'fag', 'faggot',
    'fuck', 'goddamn', 'hell', 'homo', 'jerk', 'kike', 'milf', 'motherfucker',
    'nazi', 'nigga', 'nigger', 'piss', 'porn', 'pussy', 'queer',
    'retard', 'shit', 'slut', 'spic', 'tits', 'tranny', 'twat',
    'wanker', 'wetback', 'whore', 'chink', 'coon', 'gook', 'gringo',
    'honky', 'jap', 'kraut', 'paki', 'raghead', 'wop'
  ];
BEGIN
  v_lower := lower(trim(p_text));

  FOREACH v_word IN ARRAY v_profanity_list LOOP
    -- Match as whole word using word boundary simulation
    IF v_lower ~ ('\m' || v_word || '\M') THEN
      RETURN true;
    END IF;
  END LOOP;

  RETURN false;
END;
$$;

COMMENT ON FUNCTION check_profanity(text) IS 'Server-side profanity check — returns true if text contains profanity';

-- Patch create_crew to include profanity check
CREATE OR REPLACE FUNCTION create_crew(
  p_name text,
  p_abbreviation text,
  p_color text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid uuid;
  v_user record;
  v_crew_id uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_user FROM public.users WHERE id = v_uid;
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  IF v_user.crew_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already in a crew');
  END IF;

  -- Profanity check on crew name and abbreviation
  IF check_profanity(p_name) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Crew name contains inappropriate language');
  END IF;
  IF check_profanity(p_abbreviation) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Crew abbreviation contains inappropriate language');
  END IF;

  -- Create the crew
  INSERT INTO public.crews (name, abbreviation, color, founder_id)
  VALUES (p_name, upper(p_abbreviation), p_color, v_uid)
  RETURNING id INTO v_crew_id;

  -- Add founder as OG member
  INSERT INTO public.crew_members (crew_id, user_id, role)
  VALUES (v_crew_id, v_uid, 'og');

  -- Update user's crew_id
  UPDATE public.users SET crew_id = v_crew_id WHERE id = v_uid;

  RETURN jsonb_build_object('success', true, 'crew_id', v_crew_id);
END;
$$;

-- ============================================================
-- 7. RATE LIMIT ON REPORTS
-- Replace report_tag with rate-limited version
-- ============================================================
CREATE OR REPLACE FUNCTION report_tag(
  p_tag_id uuid,
  p_reason text,
  p_details text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_tag record;
  v_recent_report_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF p_reason NOT IN ('inappropriate_location', 'offensive', 'spam', 'other') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid reason');
  END IF;

  -- Rate limit: max 10 reports per user per 24 hours
  SELECT count(*) INTO v_recent_report_count
  FROM public.reports
  WHERE reporter_id = v_user_id
    AND created_at > now() - interval '24 hours';

  IF v_recent_report_count >= 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Report limit reached — max 10 reports per 24 hours');
  END IF;

  -- Verify tag exists
  SELECT * INTO v_tag FROM public.tags WHERE id = p_tag_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tag not found');
  END IF;

  -- Don't allow reporting your own tags
  IF v_tag.user_id = v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot report your own tag');
  END IF;

  -- Check for duplicate report
  IF EXISTS (
    SELECT 1 FROM public.reports
    WHERE tag_id = p_tag_id AND reporter_id = v_user_id AND status = 'pending'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already reported');
  END IF;

  -- Insert report
  INSERT INTO public.reports (tag_id, reporter_id, reason, details, status)
  VALUES (p_tag_id, v_user_id, p_reason, p_details, 'pending');

  -- Flag the tag (hidden until reviewed)
  UPDATE public.tags SET status = 'flagged' WHERE id = p_tag_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
