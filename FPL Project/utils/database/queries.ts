import { supabase } from "../supabase/client";

/** ===== Types that match your DB ===== */

export type LiveRow = {
  entry_id: number;
  rank: number;
  manager_name: string;
  team_name: string;
  total_points: number;
  updated_at: string | null;
};

export interface ChipUsageRoi {
  gw: number;
  entry_id: number;
  manager_name: string;
  team_name: string;
  chip: string;
  points: number;
  gw_avg: number;
  roi_vs_league_avg: number;
}

export interface ManagerOfMonthTotal {
  month_utc: string;
  entry_id: number;
  manager_name: string;
  team_name: string;
  month_points?: number;   // present in your view
  month_rank?: number;     // present in your view
  total_points?: number;   // normalized convenience
}

export interface ManagerOfMonthWinner extends ManagerOfMonthTotal {}

export interface LeagueSnapshot {
  id: number;
  league_id: number;
  gw: number;
  entry_id: number;
  rank: number;
  total_points: number;
  captured_at: string;
}

/** ===== Helpers ===== */

export async function inspectTableColumns(tableName: string) {
  try {
    const { data, error } = await supabase.from(tableName).select("*").limit(1);
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

export async function listAvailableTables() {
  const tablesToTry = [
    "vw_chip_usage_roi",
    "vw_manager_of_month_totals",
    "vw_manager_of_month_winners",
    "league_snapshots",
    "managers",
    "live_table",
  ];
  for (const tableName of tablesToTry) {
    console.log(`\n--- Checking table: ${tableName} ---`);
    await inspectTableColumns(tableName);
  }
}

/** ===== Queries used by the UI ===== */

/** Current live standings (names + ranks) */
export async function fetchLeagueStandings(): Promise<LiveRow[]> {
  try {
    const { data, error } = await supabase
      .from("live_table")
      .select("entry_id,rank,manager_name,team_name,total_points,updated_at")
      .order("rank", { ascending: true });
    if (error) {
      console.error("Error fetching live standings:", error);
      return [];
    }
    return data ?? [];
  } catch (error) {
    console.error("Failed to fetch live standings:", error);
    return [];
  }
}

/** Chip ROI (may be empty if no chips played yet in early GWs) */
export async function fetchChipUsageRoi(): Promise<ChipUsageRoi[]> {
  try {
    const { data, error } = await supabase
      .from("vw_chip_usage_roi")
      .select("gw,entry_id,manager_name,team_name,chip,points,gw_avg,roi_vs_league_avg")
      .order("roi_vs_league_avg", { ascending: false });
    if (error) {
      console.error("Error fetching chip usage ROI:", error);
      return [];
    }
    return data ?? [];
  } catch (error) {
    console.error("Failed to fetch chip usage ROI:", error);
    return [];
  }
}

/** Available months for Manager of the Month (distinct list) */
export async function getAvailableMonths(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("vw_manager_of_month_totals")
      .select("month_utc")
      .order("month_utc", { ascending: false });
    if (error || !data) return [];
    return Array.from(new Set(data.map((r) => r.month_utc)));
  } catch {
    return [];
  }
}

/** Manager of Month totals for a selected month_utc */
export async function fetchManagerOfMonthTotals(
  monthUtc?: string
): Promise<ManagerOfMonthTotal[]> {
  try {
    let query = supabase.from("vw_manager_of_month_totals").select("*");

    // If month not provided, pick most recent
    if (!monthUtc) {
      const months = await getAvailableMonths();
      if (months.length > 0) monthUtc = months[0];
    }
    if (monthUtc) query = query.eq("month_utc", monthUtc);

    const { data, error } = await query.order("month_rank", { ascending: true });
    if (error) {
      console.error("Error fetching manager of month totals:", error);
      return [];
    }

    const rows = (data ?? []).map((r) => ({
      ...r,
      total_points: r.month_points ?? r.total_points ?? 0,
    }));
    return rows;
  } catch (error) {
    console.error("Failed to fetch manager of month totals:", error);
    return [];
  }
}

/** Manager of Month winners (sorted recent → old) */
export async function fetchManagerOfMonthWinners(): Promise<ManagerOfMonthWinner[]> {
  try {
    const { data, error } = await supabase
      .from("vw_manager_of_month_winners")
      .select("*")
      .order("month_utc", { ascending: false });
    if (error) {
      console.error("Error fetching manager of month winners:", error);
      return [];
    }
    return (data ?? []).map((r) => ({
      ...r,
      total_points: (r as any).month_points ?? (r as any).total_points ?? 0,
    }));
  } catch (error) {
    console.error("Failed to fetch manager of month winners:", error);
    return [];
  }
}

/** Latest gameweek in snapshots */
export async function getLatestGameweek(): Promise<number> {
  try {
    const { data } = await supabase
      .from("league_snapshots")
      .select("gw")
      .order("gw", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data?.gw ?? 1;
  } catch (error) {
    console.error("Failed to get latest gameweek:", error);
    return 1;
  }
}

/** GW stats derived from snapshots (basic; captain/rise/fall need extra data) */
export async function fetchGameweekStats(gameweek: number) {
  try {
    const { data, error } = await supabase
      .from("league_snapshots")
      .select("entry_id,total_points")
      .eq("gw", gameweek);

    if (error || !data || !data.length) return null;

    const top = [...data].sort((a, b) => b.total_points - a.total_points)[0];

    // Optional enrich: manager name
    let manager = "Unknown";
    if (top?.entry_id) {
      const { data: m } = await supabase
        .from("managers")
        .select("manager_name")
        .eq("entry_id", top.entry_id)
        .maybeSingle();
      manager = m?.manager_name ?? manager;
    }

    return {
      highestScore: { points: top?.total_points ?? 0, manager },
      bestCaptain: { points: 0, captain: "Unknown", manager: "Unknown" }, // needs captain data from gw_scores/picks
      biggestRise: { positions: 0, manager: "Unknown" },                  // needs prev GW compare
      biggestFall: { positions: 0, manager: "Unknown" },
    };
  } catch (error) {
    console.error("Failed to fetch gameweek stats:", error);
    return null;
  }
}
