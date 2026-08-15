import { supabase } from '../supabase/client';

// Types for your database views - made more flexible
export interface ChipUsageRoi {
  entry_id: number;
  manager_name: string;
  team_name: string;
  gw: number;
  chip: string;
  points: number;
  gw_avg: number;
  roi_vs_league_avg: number;
}

export interface ManagerOfMonthTotal {
  entry_id: number;
  manager_name: string;
  team_name: string;
  month_utc: string;
  points?: number; // Make flexible for different column names
  total_points?: number;
  monthly_points?: number;
  rank?: number;
  [key: string]: any; // Allow other columns
}

export interface ManagerOfMonthWinner {
  month_utc: string;
  manager_name: string;
  team_name: string;
  points?: number;
  total_points?: number;
  monthly_points?: number;
  [key: string]: any; // Allow other columns
}

export interface LeagueSnapshot {
  entry_id: number;
  manager_name: string;
  team_name: string;
  rank: number;
  points: number;
  gw: number;
  created_at: string;
}

/** Normalized row for the league table UI */
export interface LeagueStandingsRow {
  entry_id: number;
  rank: number;
  manager_name: string;
  team_name: string;
  total_points: number;
  gw_points: number | null;
}

export interface GreenStreakRow {
  manager: string;
  teamName: string;
  currentStreak: number;
  bestStreak: number;
  streakPoints: number;
}

export type GameweekStatsDisplay = {
  highestScore: { points: number; manager: string };
  bestCaptain: { points: number; captain: string; manager: string };
  biggestRise: { positions: number; manager: string };
  biggestFall: { positions: number; manager: string };
};

/** One row per manager per gameweek (after optional GW points inference). */
export type LeagueSnapshotTimelineRow = LeagueStandingsRow & { gw: number };

export type SeasonAggregateStats = {
  mostWeeksFirst: { weeks: number; manager: string; teamName: string };
  mostWeeksLast: { weeks: number; manager: string; teamName: string };
};

export type SeasonHighlightStats = {
  highestGwScore: { points: number; manager: string; teamName: string; gw: number };
  mostGwWins: { wins: number; manager: string; teamName: string };
  captainKing: { points: number; manager: string; teamName: string };
  mostGreenWeeks: { weeks: number; manager: string; teamName: string };
};

function numericPoints(row: Record<string, unknown>): number {
  const candidates = [
    row.points,
    row.total_points,
    row.total_points_raw,
    row.overall_points,
  ];
  for (const v of candidates) {
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

function numericGwPoints(row: Record<string, unknown>): number | null {
  const keys = [
    "gw_points",
    "event_points",
    "points_gw",
    "gameweek_points",
    "gw_score",
  ];
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

export function normalizeLeagueSnapshotRow(
  row: Record<string, unknown>
): LeagueStandingsRow {
  const entryRaw = row.entry_id ?? row.entry;
  const entry_id =
    typeof entryRaw === "number"
      ? entryRaw
      : typeof entryRaw === "string"
        ? Number(entryRaw) || 0
        : 0;
  const rankRaw = row.rank;
  const rank =
    typeof rankRaw === "number"
      ? rankRaw
      : typeof rankRaw === "string"
        ? Number(rankRaw) || 0
        : 0;

  return {
    entry_id,
    rank,
    manager_name: String(row.manager_name ?? row.manager ?? ""),
    team_name: String(row.team_name ?? row.team ?? ""),
    total_points: numericPoints(row),
    gw_points: numericGwPoints(row),
  };
}

function numericCaptainPoints(row: Record<string, unknown>): number | null {
  const keys = [
    "captain_points",
    "captain_score",
    "c_points",
    "captain_pick_points",
  ];
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

function captainNameFromRow(row: Record<string, unknown>): string {
  const v =
    row.captain_name ??
    row.captain ??
    row.captain_web_name ??
    row.captain_player_name;
  return v != null ? String(v) : "";
}

export function rowToTimelineEntry(
  row: Record<string, unknown>
): LeagueSnapshotTimelineRow {
  const base = normalizeLeagueSnapshotRow(row);
  const gwRaw = row.gw ?? row.event ?? row.round;
  const gw =
    typeof gwRaw === "number"
      ? gwRaw
      : typeof gwRaw === "string"
        ? Number(gwRaw) || 0
        : 0;
  return { ...base, gw };
}

/** Infer per-GW points from season total delta when `gw_points` is missing. */
export function applyInferredGwPoints(
  rows: LeagueSnapshotTimelineRow[]
): LeagueSnapshotTimelineRow[] {
  const byEntry = new Map<number, LeagueSnapshotTimelineRow[]>();
  for (const r of rows) {
    if (!r.entry_id || !r.gw) continue;
    const list = byEntry.get(r.entry_id) ?? [];
    list.push({ ...r });
    byEntry.set(r.entry_id, list);
  }

  const out: LeagueSnapshotTimelineRow[] = [];
  byEntry.forEach((list) => {
    list.sort((a, b) => a.gw - b.gw);
    for (let i = 0; i < list.length; i++) {
      const cur = { ...list[i] };
      if (cur.gw_points == null && i > 0) {
        const prev = list[i - 1];
        const delta = cur.total_points - prev.total_points;
        cur.gw_points = delta >= 0 ? delta : 0;
      }
      out.push(cur);
    }
  });
  return out.sort((a, b) => a.gw - b.gw || a.rank - b.rank);
}

const MAX_FPL_GW = 38;

type CaptainLookup = Map<string, { name: string; points: number }>;

async function fetchCaptainScoresMap(): Promise<CaptainLookup> {
  const map: CaptainLookup = new Map();
  try {
    const { data, error } = await supabase
      .from("captain_scores")
      .select("entry_id,gameweek,captain_points,captain_player_name");

    if (error || !data?.length) return map;

    for (const row of data) {
      const rec = row as Record<string, unknown>;
      const eid = Number(rec.entry_id ?? 0);
      const gw = Number(rec.gameweek ?? rec.gw ?? 0);
      if (!eid || !gw) continue;
      map.set(`${eid},${gw}`, {
        name: String(rec.captain_player_name ?? rec.captain_name ?? ""),
        points: Number(rec.captain_points ?? 0),
      });
    }
  } catch {
    /* ignore */
  }
  return map;
}

function gwPointsFromWideRow(
  row: Record<string, unknown>,
  gw: number
): number | null {
  const v = row[`gw${gw}_points`];
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export function latestGwFromWideRows(
  wideRows: Record<string, unknown>[]
): number {
  let lastGw = 0;
  for (let g = 1; g <= MAX_FPL_GW; g++) {
    const any = wideRows.some(
      (row) => (gwPointsFromWideRow(row, g) ?? 0) !== 0
    );
    if (any) lastGw = g;
  }
  return lastGw;
}

/**
 * Builds a per-GW timeline from `league_standings` / `league_standings_new`-style
 * wide rows (`gw1_points` … `gw38_points`), recomputing rank from cumulative totals.
 */
export function expandTimelineFromWideStandings(
  wideRows: Record<string, unknown>[],
  captainByEntryGw: CaptainLookup
): {
  timeline: LeagueSnapshotTimelineRow[];
  rawByGw: Map<number, Record<string, unknown>[]>;
} {
  if (wideRows.length === 0) {
    return { timeline: [], rawByGw: new Map() };
  }

  type M = {
    entry_id: number;
    row: Record<string, unknown>;
    byGw: number[];
  };

  const managers: M[] = wideRows.map((row) => {
    const entryRaw = row.entry_id ?? row.entry;
    const entry_id =
      typeof entryRaw === "number"
        ? entryRaw
        : typeof entryRaw === "string"
          ? Number(entryRaw) || 0
          : 0;
    const byGw: number[] = [];
    for (let g = 1; g <= MAX_FPL_GW; g++) {
      const p = gwPointsFromWideRow(row, g);
      byGw.push(p ?? 0);
    }
    return { entry_id, row, byGw };
  });

  const lastGw = latestGwFromWideRows(wideRows);

  if (lastGw === 0) {
    return { timeline: [], rawByGw: new Map() };
  }

  const timelineRaw: LeagueSnapshotTimelineRow[] = [];
  const rawByGw = new Map<number, Record<string, unknown>[]>();

  for (let g = 1; g <= lastGw; g++) {
    type Cum = {
      entry_id: number;
      total: number;
      gwPts: number;
      row: Record<string, unknown>;
    };
    const cumulative: Cum[] = managers.map((m) => {
      let sum = 0;
      for (let i = 0; i < g; i++) sum += m.byGw[i] ?? 0;
      return {
        entry_id: m.entry_id,
        total: sum,
        gwPts: m.byGw[g - 1] ?? 0,
        row: m.row,
      };
    });

    cumulative.sort((a, b) => b.total - a.total);

    let rank = 0;
    let prevTotal: number | null = null;
    cumulative.forEach((item, idx) => {
      if (idx === 0 || item.total !== prevTotal) rank = idx + 1;
      prevTotal = item.total;

      const mgr = String(item.row.manager_name ?? item.row.manager ?? "");
      const team = String(item.row.team_name ?? item.row.team ?? "");
      const capKey = `${item.entry_id},${g}`;
      const cap = captainByEntryGw.get(capKey);

      const raw: Record<string, unknown> = {
        entry_id: item.entry_id,
        manager_name: mgr,
        team_name: team,
        rank,
        total_points: item.total,
        gw_points: item.gwPts,
        gw: g,
        captain_name: cap?.name,
        captain_points: cap?.points,
      };

      timelineRaw.push({
        entry_id: item.entry_id,
        rank,
        manager_name: mgr,
        team_name: team,
        total_points: item.total,
        gw_points: item.gwPts,
        gw: g,
      });

      const list = rawByGw.get(g) ?? [];
      list.push(raw);
      rawByGw.set(g, list);
    });
  }

  timelineRaw.sort((a, b) => a.gw - b.gw || a.rank - b.rank);
  const timeline = applyInferredGwPoints(timelineRaw);
  return { timeline, rawByGw };
}

async function fetchWideLeagueStandingsRows(): Promise<Record<
  string,
  unknown
>[]> {
  const { data, error } = await supabase.from("league_standings").select("*");
  if (error) {
    console.error("fetchWideLeagueStandingsRows:", error);
    return [];
  }
  return (data as Record<string, unknown>[]) ?? [];
}

/**
 * All `league_snapshots` rows (capped) with inferred GW points and raw rows by GW
 * (for captain columns if present on snapshots).
 * Falls back to `league_standings` (wide `gwN_points` columns) when snapshots are empty.
 */
export async function fetchLeagueSnapshotFull(): Promise<{
  timeline: LeagueSnapshotTimelineRow[];
  rawByGw: Map<number, Record<string, unknown>[]>;
}> {
  try {
    const { data, error } = await supabase
      .from("league_snapshots")
      .select("*")
      .order("gw", { ascending: true })
      .order("rank", { ascending: true })
      .limit(25000);

    if (!error && data?.length) {
      const rawByGw = new Map<number, Record<string, unknown>[]>();
      const timelineRaw: LeagueSnapshotTimelineRow[] = [];

      for (const row of data) {
        const rec = row as Record<string, unknown>;
        const te = rowToTimelineEntry(rec);
        timelineRaw.push(te);
        const list = rawByGw.get(te.gw) ?? [];
        list.push(rec);
        rawByGw.set(te.gw, list);
      }

      const timeline = applyInferredGwPoints(timelineRaw);
      return { timeline, rawByGw };
    }

    if (error) console.error("fetchLeagueSnapshotFull league_snapshots:", error);

    const wide = await fetchWideLeagueStandingsRows();
    if (wide.length === 0) {
      return { timeline: [], rawByGw: new Map() };
    }

    const captains = await fetchCaptainScoresMap();
    return expandTimelineFromWideStandings(wide, captains);
  } catch (e) {
    console.error("fetchLeagueSnapshotFull:", e);
    return { timeline: [], rawByGw: new Map() };
  }
}

export function latestGwFromTimeline(
  rows: LeagueSnapshotTimelineRow[]
): number {
  let max = 0;
  for (const r of rows) {
    if (r.gw > max) max = r.gw;
  }
  return max;
}

export function computeGameweekStatsFromTimeline(
  rows: LeagueSnapshotTimelineRow[],
  gameweek: number,
  rawByGw?: Map<number, Record<string, unknown>[]>
): GameweekStatsDisplay | null {
  const current = rows.filter((r) => r.gw === gameweek);
  if (current.length === 0) return null;

  const prevGw = gameweek - 1;
  const prev = rows.filter((r) => r.gw === prevGw);
  const prevRank = new Map(prev.map((r) => [r.entry_id, r.rank]));

  const sortedByGwPts = [...current].sort(
    (a, b) => (b.gw_points ?? 0) - (a.gw_points ?? 0)
  );
  const top = sortedByGwPts[0];

  let bestCapPts = 0;
  let bestCapName = "—";
  let bestCapManager = "—";

  const rawThis = rawByGw?.get(gameweek);
  if (rawThis?.length) {
    for (const raw of rawThis) {
      const cp = numericCaptainPoints(raw);
      const cn = captainNameFromRow(raw);
      const mgr = String(raw.manager_name ?? raw.manager ?? "");
      if (cp != null && cp > bestCapPts) {
        bestCapPts = cp;
        bestCapName = cn || "—";
        bestCapManager = mgr;
      }
    }
  }

  let rise = 0;
  let riseMgr = "—";
  let fall = 0;
  let fallMgr = "—";

  if (prev.length > 0) {
    for (const r of current) {
      const pr = prevRank.get(r.entry_id);
      if (pr == null) continue;
      const delta = pr - r.rank;
      if (delta > rise) {
        rise = delta;
        riseMgr = r.manager_name;
      }
      if (r.rank - pr > fall) {
        fall = r.rank - pr;
        fallMgr = r.manager_name;
      }
    }
  }

  return {
    highestScore: {
      points: top?.gw_points ?? top?.total_points ?? 0,
      manager: top?.manager_name || "Unknown",
    },
    bestCaptain: {
      points: bestCapPts,
      captain: bestCapName,
      manager: bestCapManager,
    },
    biggestRise: { positions: rise, manager: riseMgr },
    biggestFall: { positions: fall, manager: fallMgr },
  };
}

export function computeSeasonAggregates(
  rows: LeagueSnapshotTimelineRow[]
): SeasonAggregateStats | null {
  if (rows.length === 0) return null;

  const byGw = new Map<number, LeagueSnapshotTimelineRow[]>();
  for (const r of rows) {
    const list = byGw.get(r.gw) ?? [];
    list.push(r);
    byGw.set(r.gw, list);
  }

  const weeksFirst = new Map<number, number>();
  const weeksLast = new Map<number, number>();
  const names = new Map<number, { manager: string; team: string }>();

  byGw.forEach((weekRows) => {
    if (weekRows.length === 0) return;
    let maxRank = 0;
    for (const r of weekRows) {
      if (r.rank > maxRank) maxRank = r.rank;
    }
    for (const r of weekRows) {
      names.set(r.entry_id, {
        manager: r.manager_name,
        team: r.team_name,
      });
      if (r.rank === 1) {
        weeksFirst.set(r.entry_id, (weeksFirst.get(r.entry_id) ?? 0) + 1);
      }
      if (r.rank === maxRank) {
        weeksLast.set(r.entry_id, (weeksLast.get(r.entry_id) ?? 0) + 1);
      }
    }
  });

  const pickMax = (
    m: Map<number, number>
  ): { entry_id: number; weeks: number } | null => {
    let best: { entry_id: number; weeks: number } | null = null;
    m.forEach((w, eid) => {
      if (!best || w > best.weeks) best = { entry_id: eid, weeks: w };
    });
    return best;
  };

  const f = pickMax(weeksFirst);
  const l = pickMax(weeksLast);

  if (!f && !l) return null;

  const nf = f ? names.get(f.entry_id) : undefined;
  const nl = l ? names.get(l.entry_id) : undefined;

  return {
    mostWeeksFirst: {
      weeks: f?.weeks ?? 0,
      manager: nf?.manager ?? "—",
      teamName: nf?.team ?? "—",
    },
    mostWeeksLast: {
      weeks: l?.weeks ?? 0,
      manager: nl?.manager ?? "—",
      teamName: nl?.team ?? "—",
    },
  };
}

export function computeSeasonHighlightStats(
  rows: LeagueSnapshotTimelineRow[],
  rawByGw?: Map<number, Record<string, unknown>[]>
): SeasonHighlightStats | null {
  if (rows.length === 0) return null;

  const byGw = new Map<number, LeagueSnapshotTimelineRow[]>();
  const names = new Map<number, { manager: string; team: string }>();
  for (const r of rows) {
    const list = byGw.get(r.gw) ?? [];
    list.push(r);
    byGw.set(r.gw, list);
    names.set(r.entry_id, { manager: r.manager_name, team: r.team_name });
  }

  let highestScore = 0;
  let highestEntryId = 0;
  let highestGw = 0;
  const gwWins = new Map<number, { wins: number; bestScore: number }>();
  const greenWeeks = new Map<number, number>();

  byGw.forEach((weekRows) => {
    if (weekRows.length === 0) return;

    const points = weekRows.map((r) => r.gw_points ?? 0);
    const avg = points.reduce((sum, p) => sum + p, 0) / points.length;
    const bestScore = Math.max(...points);

    for (const r of weekRows) {
      const gwPoints = r.gw_points ?? 0;
      if (gwPoints > highestScore) {
        highestScore = gwPoints;
        highestEntryId = r.entry_id;
        highestGw = r.gw;
      }
      if (gwPoints === bestScore) {
        const current = gwWins.get(r.entry_id) ?? { wins: 0, bestScore: 0 };
        gwWins.set(r.entry_id, {
          wins: current.wins + 1,
          bestScore: Math.max(current.bestScore, bestScore),
        });
      }
      if (gwPoints > avg) {
        greenWeeks.set(r.entry_id, (greenWeeks.get(r.entry_id) ?? 0) + 1);
      }
    }
  });

  const captainPoints = new Map<number, number>();
  rawByGw?.forEach((weekRows) => {
    for (const raw of weekRows) {
      const entryRaw = raw.entry_id ?? raw.entry;
      const entryId =
        typeof entryRaw === "number"
          ? entryRaw
          : typeof entryRaw === "string"
            ? Number(entryRaw) || 0
            : 0;
      const points = numericCaptainPoints(raw);
      if (!entryId || points == null) continue;
      captainPoints.set(entryId, (captainPoints.get(entryId) ?? 0) + points);
    }
  });

  const pickGwWins = () => {
    let best: { entryId: number; wins: number; bestScore: number } | null = null;
    for (const [entryId, value] of gwWins.entries()) {
      if (
        !best ||
        value.wins > best.wins ||
        (value.wins === best.wins && value.bestScore > best.bestScore)
      ) {
        best = { entryId, ...value };
      }
    }
    return best;
  };

  const pickMax = (values: Map<number, number>) => {
    let best: { entryId: number; value: number } | null = null;
    for (const [entryId, value] of values.entries()) {
      if (!best || value > best.value) {
        best = { entryId, value };
      }
    }
    return best;
  };

  const gwWinsLeader = pickGwWins();
  const captainLeader = pickMax(captainPoints);
  const greenLeader = pickMax(greenWeeks);

  const managerFor = (entryId?: number) =>
    entryId ? names.get(entryId) : undefined;
  const highestManager = managerFor(highestEntryId);
  const gwWinsManager = managerFor(gwWinsLeader?.entryId);
  const captainManager = managerFor(captainLeader?.entryId);
  const greenManager = managerFor(greenLeader?.entryId);

  return {
    highestGwScore: {
      points: highestScore,
      manager: highestManager?.manager ?? "—",
      teamName: highestManager?.team ?? "—",
      gw: highestGw,
    },
    mostGwWins: {
      wins: gwWinsLeader?.wins ?? 0,
      manager: gwWinsManager?.manager ?? "—",
      teamName: gwWinsManager?.team ?? "—",
    },
    captainKing: {
      points: captainLeader?.value ?? 0,
      manager: captainManager?.manager ?? "—",
      teamName: captainManager?.team ?? "—",
    },
    mostGreenWeeks: {
      weeks: greenLeader?.value ?? 0,
      manager: greenManager?.manager ?? "—",
      teamName: greenManager?.team ?? "—",
    },
  };
}

/** Green streak = consecutive GWs scoring strictly above that week's league average GW score. */
export function computeGreenStreaksFromTimeline(
  rows: LeagueSnapshotTimelineRow[]
): GreenStreakRow[] {
  if (rows.length === 0) return [];

  const byGw = new Map<number, LeagueSnapshotTimelineRow[]>();
  for (const r of rows) {
    const list = byGw.get(r.gw) ?? [];
    list.push(r);
    byGw.set(r.gw, list);
  }

  const gwAvg = new Map<number, number>();
  byGw.forEach((weekRows) => {
    const pts = weekRows.map((r) => r.gw_points ?? 0);
    if (pts.length === 0) return;
    const sum = pts.reduce((a, b) => a + b, 0);
    gwAvg.set(weekRows[0].gw, sum / pts.length);
  });

  const byEntry = new Map<number, LeagueSnapshotTimelineRow[]>();
  for (const r of rows) {
    const list = byEntry.get(r.entry_id) ?? [];
    list.push(r);
    byEntry.set(r.entry_id, list);
  }

  const isGreen = (r: LeagueSnapshotTimelineRow) => {
    const avg = gwAvg.get(r.gw);
    if (avg == null) return false;
    return (r.gw_points ?? 0) > avg;
  };

  const results: GreenStreakRow[] = [];

  byEntry.forEach((timeline) => {
    const sorted = [...timeline].sort((a, b) => a.gw - b.gw);
    let bestStreak = 0;
    let bestSum = 0;
    let run = 0;
    let runSum = 0;
    let prevGwInRun = -1;

    for (const r of sorted) {
      const g = isGreen(r);
      const contiguous = prevGwInRun < 0 || r.gw === prevGwInRun + 1;
      if (g && contiguous) {
        run += 1;
        runSum += r.gw_points ?? 0;
        prevGwInRun = r.gw;
      } else if (g) {
        run = 1;
        runSum = r.gw_points ?? 0;
        prevGwInRun = r.gw;
      } else {
        if (run > bestStreak) {
          bestStreak = run;
          bestSum = runSum;
        }
        run = 0;
        runSum = 0;
        prevGwInRun = -1;
      }
      if (run > bestStreak) {
        bestStreak = run;
        bestSum = runSum;
      }
    }

    let currentStreak = 0;
    let curSumTail = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      const r = sorted[i];
      const g = isGreen(r);
      if (!g) break;
      if (currentStreak === 0) {
        currentStreak = 1;
        curSumTail = r.gw_points ?? 0;
      } else {
        const prev = sorted[i + 1];
        if (prev && r.gw === prev.gw - 1) {
          currentStreak += 1;
          curSumTail += r.gw_points ?? 0;
        } else break;
      }
    }

    const meta = sorted[0];
    results.push({
      manager: meta.manager_name,
      teamName: meta.team_name,
      currentStreak,
      bestStreak,
      streakPoints: bestSum,
    });
  });

  return results
    .filter((r) => r.bestStreak > 0 || r.currentStreak > 0)
    .sort((a, b) => b.bestStreak - a.bestStreak)
    .slice(0, 20);
}

// Helper function to inspect table structure
export async function inspectTableColumns(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`Error inspecting ${tableName}:`, error);
      return null;
    }

    if (data && data.length > 0) {
      console.log(`Available columns in ${tableName}:`, Object.keys(data[0]));
      console.log(`Sample data from ${tableName}:`, data[0]);
      return Object.keys(data[0]);
    }

    return null;
  } catch (error) {
    console.log(`Failed to inspect ${tableName}:`, error);
    return null;
  }
}

// Helper function to get available months from the database
export async function getAvailableMonths(): Promise<string[]> {
  try {
    console.log('Getting available months...');
    
    const { data, error } = await supabase
      .from('vw_manager_of_month_totals')
      .select('month_utc')
      .limit(50); // Get a reasonable sample

    if (error) {
      console.log('Error getting available months:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No month data found');
      return [];
    }

    // Extract unique months
    const months = Array.from(new Set(data.map((row) => row.month_utc)));
    console.log('Available months:', months);
    
    return months.sort().reverse(); // Most recent first
  } catch (error) {
    console.log('Failed to get available months:', error);
    return [];
  }
}

// Fetch chip usage ROI data
export async function fetchChipUsageRoi(): Promise<ChipUsageRoi[]> {
  try {
    const { data, error } = await supabase
      .from('vw_chip_usage_roi')
      .select('*')
      .order('gw', { ascending: true })
      .order('roi_vs_league_avg', { ascending: false });

    if (error) {
      console.error('Error fetching chip usage ROI:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch chip usage ROI:', error);
    return [];
  }
}

/**
 * Fetch manager-of-month totals for a specific calendar month key (e.g. from winners view).
 * When monthUtc is omitted, uses the most recent month from the database.
 */
export async function fetchManagerOfMonthTotalsForMonth(
  monthUtc?: string
): Promise<ManagerOfMonthTotal[]> {
  try {
    console.log("Fetching manager of month totals...");

    await inspectTableColumns("vw_manager_of_month_totals");

    const availableMonths = await getAvailableMonths();

    let query = supabase.from("vw_manager_of_month_totals").select("*");

    let targetMonth: string | undefined = monthUtc;

    if (!targetMonth && availableMonths.length > 0) {
      targetMonth = availableMonths[0];
    }

    if (targetMonth) {
      query = query.eq("month_utc", targetMonth);
      console.log(`Filtering by month_utc = "${targetMonth}"`);
    } else {
      console.log("No month filter and no available months, fetching all data");
    }
    
    // Execute the query with a reasonable limit
    const { data, error } = await query.limit(20);

    if (error) {
      console.error('Error fetching manager of month totals:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No manager of month data found');
      return [];
    }

    console.log(`Found ${data.length} manager of month records`);
    console.log('Sample manager of month data:', data[0]);

    // Try to find a points column (could be named differently)
    const pointsColumn = Object.keys(data[0]).find(key => 
      key.toLowerCase().includes('points') || 
      key.toLowerCase().includes('total') ||
      key.toLowerCase().includes('score')
    );

    console.log('Found points column:', pointsColumn);

    // Sort by the points column we found, or fallback to entry_id
    const sortedData = data.sort((a, b) => {
      if (pointsColumn && a[pointsColumn] != null && b[pointsColumn] != null) {
        return b[pointsColumn] - a[pointsColumn]; // Descending
      }
      return 0;
    });

    // Add rank manually
    const dataWithRank = sortedData.map((item, index) => ({
      ...item,
      rank: index + 1,
      total_points:
        (pointsColumn ? item[pointsColumn] : undefined) ||
        item.points ||
        item.total_points ||
        0,
    }));

    return dataWithRank;
  } catch (error) {
    console.error('Failed to fetch manager of month totals:', error);
    return [];
  }
}

// Fetch all manager of month winners - discover columns first
export async function fetchManagerOfMonthWinners(): Promise<ManagerOfMonthWinner[]> {
  try {
    console.log('Fetching manager of month winners...');
    
    // First, let's see what columns are available
    await inspectTableColumns('vw_manager_of_month_winners');
    
    const { data, error } = await supabase
      .from('vw_manager_of_month_winners')
      .select('*')
      .order('month_utc', { ascending: false })
      .limit(12); // Limit to avoid too much data

    if (error) {
      console.error('Error fetching manager of month winners:', error);
      return [];
    }

    if (data && data.length > 0) {
      console.log(`Found ${data.length} manager of month winners`);
      console.log('Sample manager of month winner data:', data[0]);
      
      // Find the points column
      const pointsColumn = Object.keys(data[0]).find(key => 
        key.toLowerCase().includes('points') || 
        key.toLowerCase().includes('total') ||
        key.toLowerCase().includes('score')
      );

      console.log('Found points column in winners:', pointsColumn);

      // Normalize the data
      const normalizedData = data.map((item) => ({
        ...item,
        total_points:
          (pointsColumn ? item[pointsColumn] : undefined) ||
          item.points ||
          item.total_points ||
          0,
      }));

      return normalizedData;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch manager of month winners:', error);
    return [];
  }
}

/** Current standings for one gameweek (full table, ordered by rank). */
export async function fetchLeagueStandings(
  gameweek: number
): Promise<LeagueStandingsRow[]> {
  try {
    const { data, error } = await supabase
      .from("league_snapshots")
      .select("*")
      .eq("gw", gameweek)
      .order("rank", { ascending: true });

    if (!error && data?.length) {
      return data.map((row) =>
        normalizeLeagueSnapshotRow(row as Record<string, unknown>)
      );
    }

    const { timeline } = await fetchLeagueSnapshotFull();
    return timeline.filter((r) => r.gw === gameweek);
  } catch (error) {
    console.error("Failed to fetch league standings:", error);
    return [];
  }
}

/** Optional live green streaks when view `vw_green_streaks` exists (see supabase/schema/optional_views.sql). */
export async function fetchGreenStreaks(): Promise<GreenStreakRow[]> {
  try {
    const { data, error } = await supabase
      .from("vw_green_streaks")
      .select("*")
      .order("best_streak", { ascending: false })
      .limit(20);

    if (error) {
      console.log("Green streaks view unavailable or error:", error.message);
      return [];
    }

    if (!data?.length) return [];

    return data.map((row: Record<string, unknown>) => ({
      manager: String(
        row.manager_name ?? row.manager ?? ""
      ),
      teamName: String(row.team_name ?? row.team ?? ""),
      currentStreak: Number(row.current_streak ?? row.currentStreak ?? 0),
      bestStreak: Number(row.best_streak ?? row.bestStreak ?? 0),
      streakPoints: Number(row.streak_points ?? row.streakPoints ?? 0),
    }));
  } catch (e) {
    console.log("fetchGreenStreaks:", e);
    return [];
  }
}

/**
 * Gameweek snapshot cards: uses `vw_gameweek_highlights` when present, else partial data from `league_snapshots`.
 * See supabase/schema/optional_views.sql for the full-featured view.
 */
export async function fetchGameweekStats(
  gameweek: number
): Promise<GameweekStatsDisplay | null> {
  try {
    const { data: highlight, error: hlError } = await supabase
      .from("vw_gameweek_highlights")
      .select("*")
      .eq("gw", gameweek)
      .limit(1)
      .maybeSingle();

    if (!hlError && highlight && typeof highlight === "object") {
      const h = highlight as Record<string, unknown>;
      return {
        highestScore: {
          points: Number(h.highest_score_points ?? h.highest_points ?? 0),
          manager: String(h.highest_score_manager ?? h.highest_manager ?? "Unknown"),
        },
        bestCaptain: {
          points: Number(h.best_captain_points ?? 0),
          captain: String(h.best_captain_name ?? "Unknown"),
          manager: String(h.best_captain_manager ?? "Unknown"),
        },
        biggestRise: {
          positions: Number(h.biggest_rise_positions ?? 0),
          manager: String(h.biggest_rise_manager ?? "Unknown"),
        },
        biggestFall: {
          positions: Number(h.biggest_fall_positions ?? 0),
          manager: String(h.biggest_fall_manager ?? "Unknown"),
        },
      };
    }

    const { timeline, rawByGw } = await fetchLeagueSnapshotFull();
    return computeGameweekStatsFromTimeline(timeline, gameweek, rawByGw);
  } catch (error) {
    console.error("Failed to fetch gameweek stats:", error);
    return null;
  }
}

// Helper function to get the latest gameweek number
export async function getLatestGameweek(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("league_snapshots")
      .select("gw")
      .order("gw", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data?.gw != null) {
      return data.gw as number;
    }

    const wide = await fetchWideLeagueStandingsRows();
    const fromWide = latestGwFromWideRows(wide);
    if (fromWide > 0) return fromWide;

    console.log("Could not get latest gameweek, using default 24");
    return 24;
  } catch (error) {
    console.error("Failed to get latest gameweek:", error);
    return 24;
  }
}

// Debug function to list all available tables
export async function listAvailableTables() {
  try {
    // This won't work with RLS, but we can try common table names
    const tablesToTry = [
      'vw_chip_usage_roi',
      'vw_manager_of_month_totals', 
      'vw_manager_of_month_winners',
      'vw_gameweek_highlights',
      'vw_green_streaks',
      'league_snapshots',
      'managers',
      'league_data',
      'gameweek_data'
    ];

    for (const tableName of tablesToTry) {
      console.log(`\n--- Checking table: ${tableName} ---`);
      await inspectTableColumns(tableName);
    }
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}