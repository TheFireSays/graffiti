-- Crew activity scores: expose per-member composite scores for OG eligibility transparency
-- Uses same scoring formula as get_og_eligible_members (migration 00039)

CREATE OR REPLACE FUNCTION get_crew_activity_scores(p_crew_id uuid)
RETURNS TABLE (
  user_id uuid,
  username text,
  xp_earned bigint,
  tags_placed bigint,
  composite_score bigint,
  rank integer,
  is_og_eligible boolean
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_member_count integer;
  v_top_n integer;
BEGIN
  -- Count total crew members
  SELECT count(*) INTO v_member_count
  FROM public.crew_members
  WHERE crew_members.crew_id = p_crew_id;

  -- Determine OG-eligible count (same logic as get_og_eligible_members)
  IF v_member_count < 3 THEN
    v_top_n := v_member_count; -- all eligible
  ELSIF v_member_count <= 10 THEN
    v_top_n := 3;
  ELSE
    v_top_n := ceil(v_member_count * 0.2)::integer;
  END IF;

  RETURN QUERY
    WITH scored AS (
      SELECT
        cm.user_id AS uid,
        u.username AS uname,
        coalesce(u.xp, 0)::bigint AS member_xp,
        coalesce(tag_counts.cnt, 0)::bigint AS member_tags,
        (coalesce(u.xp, 0) + coalesce(tag_counts.cnt, 0) * 10)::bigint AS member_score
      FROM public.crew_members cm
      JOIN public.users u ON u.id = cm.user_id
      LEFT JOIN (
        SELECT t.user_id AS tuid, count(*) AS cnt
        FROM public.tags t
        WHERE t.crew_id = p_crew_id
          AND t.created_at >= now() - interval '14 days'
        GROUP BY t.user_id
      ) tag_counts ON tag_counts.tuid = cm.user_id
      WHERE cm.crew_id = p_crew_id
    ),
    ranked AS (
      SELECT
        s.uid,
        s.uname,
        s.member_xp,
        s.member_tags,
        s.member_score,
        dense_rank() OVER (ORDER BY s.member_score DESC)::integer AS member_rank
      FROM scored s
    ),
    cutoff AS (
      SELECT max(rnk) AS max_rnk
      FROM (
        SELECT rnk, row_number() OVER (ORDER BY rnk) AS rn
        FROM (SELECT DISTINCT member_rank AS rnk FROM ranked ORDER BY rnk) sub
      ) sub2
      WHERE sub2.rn <= v_top_n
    )
    SELECT
      r.uid AS user_id,
      r.uname AS username,
      r.member_xp AS xp_earned,
      r.member_tags AS tags_placed,
      r.member_score AS composite_score,
      r.member_rank AS rank,
      (r.member_rank <= c.max_rnk) AS is_og_eligible
    FROM ranked r, cutoff c
    ORDER BY r.member_rank ASC, r.uname ASC;
END;
$$;
