-- Run in Supabase SQL Editor (FPL 2 / any project using gw_scores upsert from sync script).
-- Enables onConflict: "entry_id,gw" and "entry_id,gameweek" for captain_scores.

-- gw_scores: natural key for idempotent sync (table may have surrogate id as PK)
create unique index if not exists gw_scores_entry_id_gw_key
  on public.gw_scores (entry_id, gw);

-- captain_scores: one row per manager per gameweek
create unique index if not exists captain_scores_entry_id_gameweek_key
  on public.captain_scores (entry_id, gameweek);
