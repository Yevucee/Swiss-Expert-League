#!/usr/bin/env node
/**
 * Sync Fantasy Premier League classic mini-league data into Supabase `league_snapshots`.
 *
 * Usage:
 *   FPL_LEAGUE_ID=123456 \
 *   SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/sync-fpl-to-supabase.mjs
 *
 * Optional:
 *   FPL_DELAY_MS=350          delay between HTTP calls (default 350)
 *   FPL_FETCH_PICKS=1         fetch picks + captain points (slower; default 1)
 *   FPL_MAX_GW=38            cap gameweek (default: last finished from bootstrap)
 *
 * Requires: table public.league_snapshots (see supabase/schema/league_snapshots.sql)
 */

import { createClient } from "@supabase/supabase-js";

const FPL_BASE = "https://fantasy.premierleague.com/api";

const leagueId = process.env.FPL_LEAGUE_ID;
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const delayMs = Number(process.env.FPL_DELAY_MS ?? 350);
/** Set FPL_FETCH_PICKS=1 to fill captain_name/captain_points (many extra API calls). */
const fetchPicks = process.env.FPL_FETCH_PICKS === "1";
const maxGwEnv = process.env.FPL_MAX_GW ? Number(process.env.FPL_MAX_GW) : null;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fplFetch(path) {
  const url = path.startsWith("http") ? path : `${FPL_BASE}${path}`;
  const res = await fetch(url, { headers: { "User-Agent": "SwissExpertLeagueSync/1.0" } });
  if (res.status === 429) {
    await sleep(2000);
    return fplFetch(path);
  }
  if (!res.ok) throw new Error(`FPL ${res.status}: ${url}`);
  return res.json();
}

async function collectLeagueEntryIds(leagueId) {
  const ids = new Set();
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const data = await fplFetch(
      `/leagues-classic/${leagueId}/standings/?page_standings=${page}`
    );
    const results = data?.standings?.results ?? [];
    for (const r of results) {
      if (r.entry != null) ids.add(r.entry);
    }
    hasNext = data?.standings?.has_next === true;
    page += 1;
    await sleep(delayMs);
  }
  return Array.from(ids);
}

async function fetchBootstrap() {
  return fplFetch("/bootstrap-static/");
}

function buildElementNames(bootstrap) {
  const map = new Map();
  for (const el of bootstrap?.elements ?? []) {
    map.set(el.id, el.web_name ?? el.first_name + " " + el.second_name);
  }
  return map;
}

/** @type {Map<string, number>} */
const playerGwPointsCache = new Map();

async function getPlayerPointsForGw(elementId, gw) {
  const key = `${elementId}:${gw}`;
  if (playerGwPointsCache.has(key)) return playerGwPointsCache.get(key);
  const data = await fplFetch(`/element-summary/${elementId}/`);
  await sleep(delayMs);
  let pts = 0;
  for (const h of data?.history ?? []) {
    if (h.round === gw) {
      pts = h.total_points ?? 0;
      break;
    }
  }
  playerGwPointsCache.set(key, pts);
  return pts;
}

async function fetchEntryHistory(entryId) {
  const data = await fplFetch(`/entry/${entryId}/history/`);
  await sleep(delayMs);
  return data?.current ?? [];
}

async function fetchEntryMeta(entryId) {
  const data = await fplFetch(`/entry/${entryId}/`);
  await sleep(delayMs);
  return {
    team_name: data?.name ?? "",
    manager_name: [data?.player_first_name, data?.player_last_name]
      .filter(Boolean)
      .join(" ")
      .trim(),
  };
}

async function fetchPicksCaptain(entryId, gw) {
  const data = await fplFetch(`/entry/${entryId}/event/${gw}/picks/`);
  await sleep(delayMs);
  const picks = data?.picks ?? [];
  const cap = picks.find((p) => p.is_captain);
  const chip = data?.active_chip ?? null;
  const captainElement = cap?.element ?? null;
  return { captainElement, chip };
}

function gameweekBounds(bootstrap) {
  const events = bootstrap?.events ?? [];
  const finished = events.filter((e) => e.finished === true).map((e) => e.id);
  const current = events.find((e) => e.is_current === true)?.id;
  const lastFinished = finished.length ? Math.max(...finished) : 0;
  const gwCapDefault = Math.max(lastFinished, current ?? 0);
  return { lastFinished, currentGw: current ?? null, gwCapDefault };
}

async function main() {
  if (!leagueId) throw new Error("Set FPL_LEAGUE_ID");
  if (!supabaseUrl) throw new Error("Set SUPABASE_URL");
  if (!serviceKey) throw new Error("Set SUPABASE_SERVICE_ROLE_KEY");

  console.log("Fetching bootstrap...");
  const bootstrap = await fetchBootstrap();
  await sleep(delayMs);
  const elementNames = buildElementNames(bootstrap);
  const { lastFinished, currentGw, gwCapDefault } = gameweekBounds(bootstrap);
  const gwCap = maxGwEnv ?? gwCapDefault;
  console.log(
    `League ${leagueId} | last finished GW ${lastFinished}${currentGw ? ` | current ${currentGw}` : ""} | cap ${gwCap}`
  );

  console.log("Collecting league entries...");
  const entryIds = await collectLeagueEntryIds(leagueId);
  console.log(`Found ${entryIds.length} teams`);

  /** @type {Map<number, Map<number, { total_points: number, gw_points: number, entry_id: number }>>} */
  const byGw = new Map();

  const metaCache = new Map();
  async function getMeta(entryId) {
    if (!metaCache.has(entryId)) {
      metaCache.set(entryId, await fetchEntryMeta(entryId));
    }
    return metaCache.get(entryId);
  }

  for (const entryId of entryIds) {
    const history = await fetchEntryHistory(entryId);
    const meta = await getMeta(entryId);

    for (const row of history) {
      const gw = row.event;
      if (gw > gwCap) continue;

      if (!byGw.has(gw)) byGw.set(gw, new Map());
      byGw.get(gw).set(entryId, {
        entry_id: entryId,
        total_points: row.total_points ?? 0,
        gw_points: row.points ?? 0,
        manager_name: meta.manager_name,
        team_name: meta.team_name,
      });
    }
  }

  const rows = [];

  const sortedGws = Array.from(byGw.keys()).sort((a, b) => a - b);
  for (const gw of sortedGws) {
    const m = byGw.get(gw);
    const list = Array.from(m.values()).sort(
      (a, b) => b.total_points - a.total_points
    );
    let leagueRank = 1;
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (i > 0 && item.total_points < list[i - 1].total_points) {
        leagueRank = i + 1;
      }

      let captain_name = null;
      let captain_points = null;
      let captain_id = null;
      let active_chip = null;

      if (fetchPicks) {
        try {
          const { captainElement, chip } = await fetchPicksCaptain(item.entry_id, gw);
          captain_id = captainElement;
          active_chip = chip;
          if (captainElement) {
            captain_name = elementNames.get(captainElement) ?? null;
            captain_points = await getPlayerPointsForGw(captainElement, gw);
            await sleep(delayMs);
          }
        } catch (e) {
          console.warn(`Picks failed entry ${item.entry_id} GW${gw}:`, e.message);
        }
      }

      rows.push({
        gw,
        entry_id: item.entry_id,
        rank: leagueRank,
        manager_name: item.manager_name,
        team_name: item.team_name,
        total_points: item.total_points,
        gw_points: item.gw_points,
        captain_id,
        captain_name,
        captain_points,
        active_chip,
      });
    }
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const gwRows = (bootstrap?.events ?? []).map((e) => ({
    gw: e.id,
    deadline_time: e.deadline_time ?? null,
    finished: e.finished === true,
  }));
  if (gwRows.length) {
    console.log(`Upserting ${gwRows.length} fpl_gameweeks rows...`);
    const { error: gwErr } = await supabase.from("fpl_gameweeks").upsert(gwRows, {
      onConflict: "gw",
    });
    if (gwErr) console.warn("fpl_gameweeks upsert (optional table):", gwErr.message);
  }

  console.log(`Upserting ${rows.length} rows into league_snapshots...`);
  const batch = 200;
  for (let i = 0; i < rows.length; i += batch) {
    const chunk = rows.slice(i, i + batch);
    const { error } = await supabase.from("league_snapshots").upsert(chunk, {
      onConflict: "gw,entry_id",
    });
    if (error) {
      console.error("Supabase upsert error:", error);
      process.exit(1);
    }
    console.log(`  ... ${Math.min(i + batch, rows.length)} / ${rows.length}`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
