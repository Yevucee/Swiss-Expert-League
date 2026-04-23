import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  computeGameweekStatsFromTimeline,
  computeGreenStreaksFromTimeline,
  fetchChipUsageRoi,
  fetchGreenStreaks,
  fetchLeagueSnapshotFull,
  fetchManagerOfMonthTotalsForMonth,
  fetchManagerOfMonthWinners,
  getAvailableMonths,
  getLatestGameweek,
  latestGwFromTimeline,
  listAvailableTables,
  resolveSeasonAggregates,
  type ChipUsageRoi,
  type GameweekStatsDisplay,
  type GreenStreakRow,
  type LeagueStandingsRow,
  type ManagerOfMonthTotal,
  type ManagerOfMonthWinner,
  type SeasonAggregateStats,
} from "../utils/database/queries";

const REFRESH_MS = 5 * 60 * 1000;

export type LeagueDataContextValue = {
  chipUsageRoi: ChipUsageRoi[];
  managerOfMonthTotals: ManagerOfMonthTotal[];
  managerOfMonthWinners: ManagerOfMonthWinner[];
  currentMonthWinner: ManagerOfMonthWinner | null;
  bestChipRoi: ChipUsageRoi | null;
  leagueStandings: LeagueStandingsRow[];
  gameweekStats: GameweekStatsDisplay | null;
  latestGameweek: number;
  availableMonths: string[];
  greenStreaks: GreenStreakRow[];
  hasGreenStreakData: boolean;
  seasonAggregates: SeasonAggregateStats | null;
  loading: boolean;
  error: string | null;
  hasData: boolean;
  refresh: () => void;
};

function useLeagueDataState(): LeagueDataContextValue {
  const [chipUsageRoi, setChipUsageRoi] = useState<ChipUsageRoi[]>([]);
  const [managerOfMonthTotals, setManagerOfMonthTotals] = useState<
    ManagerOfMonthTotal[]
  >([]);
  const [managerOfMonthWinners, setManagerOfMonthWinners] = useState<
    ManagerOfMonthWinner[]
  >([]);
  const [leagueStandings, setLeagueStandings] = useState<LeagueStandingsRow[]>(
    []
  );
  const [gameweekStats, setGameweekStats] = useState<GameweekStatsDisplay | null>(
    null
  );
  const [latestGameweek, setLatestGameweek] = useState(24);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [greenStreaks, setGreenStreaks] = useState<GreenStreakRow[]>([]);
  const [seasonAggregates, setSeasonAggregates] =
    useState<SeasonAggregateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadSeq = useRef(0);

  const loadData = useCallback(async () => {
    const seq = ++loadSeq.current;
    try {
      setLoading(true);
      setError(null);

      if (process.env.NODE_ENV !== "production") {
        await listAvailableTables();
      }

      const [{ timeline, rawByGw }, months, chipRoiData, monthWinnersData] =
        await Promise.all([
          fetchLeagueSnapshotFull(),
          getAvailableMonths(),
          fetchChipUsageRoi(),
          fetchManagerOfMonthWinners(),
        ]);
      if (seq !== loadSeq.current) return;
      setAvailableMonths(months);
      setChipUsageRoi(chipRoiData);
      setManagerOfMonthWinners(monthWinnersData);

      let currentGw = latestGwFromTimeline(timeline);
      if (currentGw === 0) {
        currentGw = await getLatestGameweek();
      }
      if (seq !== loadSeq.current) return;
      setLatestGameweek(currentGw);

      const standingsData = timeline.filter((r) => r.gw === currentGw);
      setLeagueStandings(standingsData);

      const gameweekData = computeGameweekStatsFromTimeline(
        timeline,
        currentGw,
        rawByGw
      );
      setGameweekStats(gameweekData);

      setSeasonAggregates(await resolveSeasonAggregates(timeline));

      const greenView = await fetchGreenStreaks();
      if (seq !== loadSeq.current) return;
      setGreenStreaks(
        greenView.length > 0
          ? greenView
          : computeGreenStreaksFromTimeline(timeline)
      );

      const winner = monthWinnersData[0] ?? null;
      const monthForTotals =
        winner?.month_utc ?? (months.length > 0 ? months[0] : undefined);

      const monthTotalsData = await fetchManagerOfMonthTotalsForMonth(
        monthForTotals
      );
      if (seq !== loadSeq.current) return;
      setManagerOfMonthTotals(monthTotalsData);
    } catch (err) {
      if (seq !== loadSeq.current) return;
      console.error("Unexpected error loading league data:", err);
      setError("Unexpected error occurred while loading data");
    } finally {
      if (seq === loadSeq.current) {
        setLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void loadData();
    }, REFRESH_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void loadData();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadData]);

  const currentMonthWinner =
    managerOfMonthWinners.length > 0 ? managerOfMonthWinners[0] : null;
  const bestChipRoi = chipUsageRoi.length > 0 ? chipUsageRoi[0] : null;
  const hasGreenStreakData = greenStreaks.length > 0;
  const hasData =
    chipUsageRoi.length > 0 ||
    managerOfMonthTotals.length > 0 ||
    managerOfMonthWinners.length > 0 ||
    leagueStandings.length > 0;

  return {
    chipUsageRoi,
    managerOfMonthTotals,
    managerOfMonthWinners,
    currentMonthWinner,
    bestChipRoi,
    leagueStandings,
    gameweekStats,
    latestGameweek,
    availableMonths,
    greenStreaks,
    hasGreenStreakData,
    seasonAggregates,
    loading,
    error: hasData ? null : error,
    hasData,
    refresh,
  };
}

const LeagueDataContext = createContext<LeagueDataContextValue | null>(null);

export function LeagueDataProvider({ children }: { children: ReactNode }) {
  const value = useLeagueDataState();
  return (
    <LeagueDataContext.Provider value={value}>{children}</LeagueDataContext.Provider>
  );
}

export function useLeagueDataContext(): LeagueDataContextValue {
  const ctx = useContext(LeagueDataContext);
  if (!ctx) {
    throw new Error("useLeagueDataContext must be used within LeagueDataProvider");
  }
  return ctx;
}
