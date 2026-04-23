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

    if (error) {
      console.error("Error fetching league standings:", error);
      return [];
    }

    const rows = data || [];
    return rows.map((row) =>
      normalizeLeagueSnapshotRow(row as Record<string, unknown>)
    );
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

    const { data, error } = await supabase
      .from("league_snapshots")
      .select("*")
      .eq("gw", gameweek)
      .order("rank", { ascending: true });

    if (error) {
      console.error("Error fetching gameweek data:", error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log("No data found for gameweek:", gameweek);
      return null;
    }

    console.log(`Found ${data.length} entries for gameweek ${gameweek}`);

    const normalized = data.map((row) =>
      normalizeLeagueSnapshotRow(row as Record<string, unknown>)
    );
    const sortedByGw = [...normalized].sort(
      (a, b) => (b.gw_points ?? 0) - (a.gw_points ?? 0)
    );
    const topGw = sortedByGw[0];

    return {
      highestScore: {
        points: topGw?.gw_points ?? topGw?.total_points ?? 0,
        manager: topGw?.manager_name || "Unknown",
      },
      bestCaptain: {
        points: 0,
        captain: "—",
        manager: "Coming soon",
      },
      biggestRise: {
        positions: 0,
        manager: "Coming soon",
      },
      biggestFall: {
        positions: 0,
        manager: "Coming soon",
      },
    };
  } catch (error) {
    console.error("Failed to fetch gameweek stats:", error);
    return null;
  }
}

// Helper function to get the latest gameweek number
export async function getLatestGameweek(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('league_snapshots')
      .select('gw')
      .order('gw', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.log('Could not get latest gameweek, using default 24');
      return 24;
    }

    console.log('Latest gameweek found:', data.gw);
    return data.gw;
  } catch (error) {
    console.error('Failed to get latest gameweek:', error);
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