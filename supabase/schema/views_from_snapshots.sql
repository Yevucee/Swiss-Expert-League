-- Views derived from league_snapshots + fpl_gameweeks (run after sync script has populated data).
-- Requires: FPL_FETCH_PICKS=1 on sync for active_chip (chip ROI) and accurate captain columns.

-- ---------------------------------------------------------------------------
-- Chip usage ROI: chip weeks only; ROI = gw_points - league average that GW
-- ---------------------------------------------------------------------------
create or replace view public.vw_chip_usage_roi as
with gw_avg as (
  select gw, avg(gw_points::numeric) as league_avg
  from public.league_snapshots
  group by gw
)
select
  ls.entry_id,
  ls.manager_name,
  ls.team_name,
  ls.gw,
  ls.active_chip as chip,
  ls.gw_points as points,
  round(g.league_avg::numeric, 2) as gw_avg,
  round((ls.gw_points - g.league_avg)::numeric, 2) as roi_vs_league_avg
from public.league_snapshots ls
join gw_avg g on g.gw = ls.gw
where ls.active_chip is not null and ls.active_chip <> '';

-- ---------------------------------------------------------------------------
-- Manager of the month (calendar month in UTC based on GW deadline)
-- ---------------------------------------------------------------------------
create or replace view public.vw_manager_of_month_totals as
with snap as (
  select
    ls.entry_id,
    ls.manager_name,
    ls.team_name,
    date_trunc('month', coalesce(f.deadline_time, (ls.gw || '-01')::timestamp))::date as month_utc,
    ls.gw_points
  from public.league_snapshots ls
  left join public.fpl_gameweeks f on f.gw = ls.gw
),
monthly as (
  select
    entry_id,
    max(manager_name) as manager_name,
    max(team_name) as team_name,
    month_utc,
    sum(coalesce(gw_points, 0))::int as monthly_points
  from snap
  group by entry_id, month_utc
),
ranked as (
  select
    *,
    rank() over (partition by month_utc order by monthly_points desc) as rank
  from monthly
)
select
  entry_id,
  manager_name,
  team_name,
  to_char(month_utc, 'YYYY-MM') as month_utc,
  monthly_points as total_points,
  rank
from ranked;

create or replace view public.vw_manager_of_month_winners as
select distinct on (month_utc)
  month_utc,
  manager_name,
  team_name,
  total_points
from public.vw_manager_of_month_totals
order by month_utc, rank asc;

-- security invoker (Postgres 15+); comment out if unsupported
alter view public.vw_chip_usage_roi set (security_invoker = true);
alter view public.vw_manager_of_month_totals set (security_invoker = true);
alter view public.vw_manager_of_month_winners set (security_invoker = true);

grant select on public.vw_chip_usage_roi to anon, authenticated;
grant select on public.vw_manager_of_month_totals to anon, authenticated;
grant select on public.vw_manager_of_month_winners to anon, authenticated;
