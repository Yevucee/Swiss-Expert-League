-- Extends update_league_standings() to fill weeks_first, weeks_last, gw_wins from
-- league_snapshots + gw_scores (run after gw_scores trigger fix is in place).

CREATE OR REPLACE FUNCTION public.update_league_standings()
RETURNS void
LANGUAGE plpgsql
SET search_path TO public
AS $function$
BEGIN
  UPDATE public.league_standings_new AS l
  SET
    gw1_points = COALESCE(g.p01, 0),
    gw2_points = COALESCE(g.p02, 0),
    gw3_points = COALESCE(g.p03, 0),
    gw4_points = COALESCE(g.p04, 0),
    gw5_points = COALESCE(g.p05, 0),
    gw6_points = COALESCE(g.p06, 0),
    gw7_points = COALESCE(g.p07, 0),
    gw8_points = COALESCE(g.p08, 0),
    gw9_points = COALESCE(g.p09, 0),
    gw10_points = COALESCE(g.p10, 0),
    gw11_points = COALESCE(g.p11, 0),
    gw12_points = COALESCE(g.p12, 0),
    gw13_points = COALESCE(g.p13, 0),
    gw14_points = COALESCE(g.p14, 0),
    gw15_points = COALESCE(g.p15, 0),
    gw16_points = COALESCE(g.p16, 0),
    gw17_points = COALESCE(g.p17, 0),
    gw18_points = COALESCE(g.p18, 0),
    gw19_points = COALESCE(g.p19, 0),
    gw20_points = COALESCE(g.p20, 0),
    gw21_points = COALESCE(g.p21, 0),
    gw22_points = COALESCE(g.p22, 0),
    gw23_points = COALESCE(g.p23, 0),
    gw24_points = COALESCE(g.p24, 0),
    gw25_points = COALESCE(g.p25, 0),
    gw26_points = COALESCE(g.p26, 0),
    gw27_points = COALESCE(g.p27, 0),
    gw28_points = COALESCE(g.p28, 0),
    gw29_points = COALESCE(g.p29, 0),
    gw30_points = COALESCE(g.p30, 0),
    gw31_points = COALESCE(g.p31, 0),
    gw32_points = COALESCE(g.p32, 0),
    gw33_points = COALESCE(g.p33, 0),
    gw34_points = COALESCE(g.p34, 0),
    gw35_points = COALESCE(g.p35, 0),
    gw36_points = COALESCE(g.p36, 0),
    gw37_points = COALESCE(g.p37, 0),
    gw38_points = COALESCE(g.p38, 0),
    total_points = COALESCE(g.tot, 0),
    rank = g.rnk::int,
    total_captain_points = COALESCE(g.tot_cap, 0)::int,
    captain_selections = COALESCE(g.cap_n, 0)::int,
    weeks_first = COALESCE(s.wf, 0),
    weeks_last = COALESCE(s.wl, 0),
    gw_wins = COALESCE(w.wins, 0),
    updated_at = now()
  FROM (
    SELECT
      entry_id,
      SUM(points) AS tot,
      ROW_NUMBER() OVER (ORDER BY SUM(points) DESC) AS rnk,
      SUM(COALESCE(captain_points, 0)) AS tot_cap,
      COUNT(*) FILTER (WHERE captain_id IS NOT NULL) AS cap_n,
      MAX(CASE WHEN gw = 1 THEN points END) AS p01,
      MAX(CASE WHEN gw = 2 THEN points END) AS p02,
      MAX(CASE WHEN gw = 3 THEN points END) AS p03,
      MAX(CASE WHEN gw = 4 THEN points END) AS p04,
      MAX(CASE WHEN gw = 5 THEN points END) AS p05,
      MAX(CASE WHEN gw = 6 THEN points END) AS p06,
      MAX(CASE WHEN gw = 7 THEN points END) AS p07,
      MAX(CASE WHEN gw = 8 THEN points END) AS p08,
      MAX(CASE WHEN gw = 9 THEN points END) AS p09,
      MAX(CASE WHEN gw = 10 THEN points END) AS p10,
      MAX(CASE WHEN gw = 11 THEN points END) AS p11,
      MAX(CASE WHEN gw = 12 THEN points END) AS p12,
      MAX(CASE WHEN gw = 13 THEN points END) AS p13,
      MAX(CASE WHEN gw = 14 THEN points END) AS p14,
      MAX(CASE WHEN gw = 15 THEN points END) AS p15,
      MAX(CASE WHEN gw = 16 THEN points END) AS p16,
      MAX(CASE WHEN gw = 17 THEN points END) AS p17,
      MAX(CASE WHEN gw = 18 THEN points END) AS p18,
      MAX(CASE WHEN gw = 19 THEN points END) AS p19,
      MAX(CASE WHEN gw = 20 THEN points END) AS p20,
      MAX(CASE WHEN gw = 21 THEN points END) AS p21,
      MAX(CASE WHEN gw = 22 THEN points END) AS p22,
      MAX(CASE WHEN gw = 23 THEN points END) AS p23,
      MAX(CASE WHEN gw = 24 THEN points END) AS p24,
      MAX(CASE WHEN gw = 25 THEN points END) AS p25,
      MAX(CASE WHEN gw = 26 THEN points END) AS p26,
      MAX(CASE WHEN gw = 27 THEN points END) AS p27,
      MAX(CASE WHEN gw = 28 THEN points END) AS p28,
      MAX(CASE WHEN gw = 29 THEN points END) AS p29,
      MAX(CASE WHEN gw = 30 THEN points END) AS p30,
      MAX(CASE WHEN gw = 31 THEN points END) AS p31,
      MAX(CASE WHEN gw = 32 THEN points END) AS p32,
      MAX(CASE WHEN gw = 33 THEN points END) AS p33,
      MAX(CASE WHEN gw = 34 THEN points END) AS p34,
      MAX(CASE WHEN gw = 35 THEN points END) AS p35,
      MAX(CASE WHEN gw = 36 THEN points END) AS p36,
      MAX(CASE WHEN gw = 37 THEN points END) AS p37,
      MAX(CASE WHEN gw = 38 THEN points END) AS p38
    FROM public.gw_scores
    GROUP BY entry_id
  ) AS g
  LEFT JOIN (
    SELECT entry_id,
      COUNT(*) FILTER (WHERE rank = 1)::int AS wf,
      COUNT(*) FILTER (WHERE rank = max_rank)::int AS wl
    FROM (
      SELECT ls.gw, ls.entry_id, ls.rank,
        MAX(ls.rank) OVER (PARTITION BY ls.gw) AS max_rank
      FROM public.league_snapshots ls
    ) AS x
    GROUP BY entry_id
  ) AS s ON s.entry_id = g.entry_id
  LEFT JOIN (
    SELECT gs.entry_id,
      COUNT(*)::int AS wins
    FROM public.gw_scores gs
    INNER JOIN (
      SELECT gw, MAX(points) AS mx
      FROM public.gw_scores
      GROUP BY gw
    ) AS top ON top.gw = gs.gw AND gs.points = top.mx
    GROUP BY gs.entry_id
  ) AS w ON w.entry_id = g.entry_id
  WHERE l.entry_id = g.entry_id;
END;
$function$;
