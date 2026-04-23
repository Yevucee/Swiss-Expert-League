-- Gameweek deadlines from FPL (populated by scripts/sync-fpl-to-supabase.mjs).

create table if not exists public.fpl_gameweeks (
  gw int primary key,
  deadline_time timestamptz,
  finished boolean default false
);

alter table public.fpl_gameweeks enable row level security;

drop policy if exists "fpl_gameweeks_select_anon" on public.fpl_gameweeks;
create policy "fpl_gameweeks_select_anon"
  on public.fpl_gameweeks for select
  to anon using (true);
