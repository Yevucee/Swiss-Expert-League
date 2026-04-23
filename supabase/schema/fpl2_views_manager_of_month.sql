-- Manager of the month: bucket by calendar month of gameweek deadline (fpl_gameweeks).
-- Requires public.fpl_gameweeks (see fpl_gameweeks.sql) populated by sync script.
-- Replaces created_at-based month grouping so backfills and syncs attribute GWs correctly.

create or replace view public.vw_manager_of_month_totals
with (security_invoker = true) as
select
  to_char(
    date_trunc('month', f.deadline_time::timestamptz),
    'YYYY-MM'
  ) as month_utc,
  m.entry_id,
  m.manager_name,
  m.team_name,
  sum(gs.points) as total_points,
  row_number() over (
    partition by to_char(
      date_trunc('month', f.deadline_time::timestamptz),
      'YYYY-MM'
    )
    order by sum(gs.points) desc
  ) as rank
from public.managers m
join public.gw_scores gs on m.entry_id = gs.entry_id
join public.fpl_gameweeks f on f.gw = gs.gw
where f.deadline_time is not null
group by
  m.entry_id,
  m.manager_name,
  m.team_name,
  to_char(
    date_trunc('month', f.deadline_time::timestamptz),
    'YYYY-MM'
  )
order by month_utc desc, total_points desc;

create or replace view public.vw_manager_of_month_winners
with (security_invoker = true) as
select distinct on (month_utc)
  month_utc,
  entry_id,
  manager_name,
  team_name,
  total_points
from public.vw_manager_of_month_totals
where rank = 1
order by month_utc desc;
