-- League snapshots: one row per mini-league manager per gameweek.
-- Run in Supabase SQL Editor (or merge with existing table).

create table if not exists public.league_snapshots (
  gw int not null,
  entry_id int not null,
  rank int not null,
  manager_name text,
  team_name text,
  total_points int not null default 0,
  gw_points int,
  captain_id int,
  captain_name text,
  captain_points int,
  active_chip text,
  created_at timestamptz default now(),
  primary key (gw, entry_id)
);

create index if not exists idx_league_snapshots_gw on public.league_snapshots (gw);
create index if not exists idx_league_snapshots_entry on public.league_snapshots (entry_id);

alter table public.league_snapshots enable row level security;

-- Dashboard reads with anon key
drop policy if exists "league_snapshots_select_anon" on public.league_snapshots;
create policy "league_snapshots_select_anon"
  on public.league_snapshots for select
  to anon using (true);

-- Sync jobs use service role (bypasses RLS). No insert policy for anon.

comment on table public.league_snapshots is 'FPL mini-league standings per GW; populated by scripts/sync-fpl-to-supabase.mjs';
