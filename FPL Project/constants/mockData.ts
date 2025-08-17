export const mockLeagueData = [
  { rank: 1, managerName: "Hans Müller", teamName: "Alpine Eagles", totalPoints: 2234, captain: "Salah", chipUsed: "TC", trend: "up" },
  { rank: 2, managerName: "Sophie Weber", teamName: "Zurich Strikers", totalPoints: 2198, captain: "Haaland", chipUsed: null, trend: "down" },
  { rank: 3, managerName: "Marco Rossi", teamName: "Basel Bombers", totalPoints: 2187, captain: "Kane", chipUsed: "BB", trend: "up" },
  { rank: 4, managerName: "Anna Fischer", teamName: "Geneva Giants", totalPoints: 2156, captain: "Son", chipUsed: null, trend: "same" },
  { rank: 5, managerName: "Peter Zimmermann", teamName: "Bern United", totalPoints: 2143, captain: "Mané", chipUsed: "FH", trend: "down" },
  { rank: 6, managerName: "Lisa Schneider", teamName: "Lausanne Lions", totalPoints: 2098, captain: "De Bruyne", chipUsed: null, trend: "up" },
];

export const gameweekStats = {
  highestScore: { manager: "Hans Müller", points: 94 },
  lowestScore: { manager: "Lisa Schneider", points: 31 },
  bestCaptain: { manager: "Sophie Weber", captain: "Haaland", points: 26 },
  biggestRise: { manager: "Marco Rossi", positions: 3 },
  biggestFall: { manager: "Peter Zimmermann", positions: 2 },
};

export const seasonStats = {
  mostWeeksFirst: { manager: "Hans Müller", weeks: 12 },
  mostWeeksLast: { manager: "Lisa Schneider", weeks: 4 },
  bestChipUser: { manager: "Anna Fischer", efficiency: "85%" },
};

// Mock data representing vw_chip_usage_roi view
export const chipUsageRoiData = [
  { entry_id: 1, manager_name: "Hans Müller", team_name: "Alpine Eagles", gw: 24, chip: "TC", points: 94, gw_avg: 52.3, roi_vs_league_avg: 41.7 },
  { entry_id: 3, manager_name: "Marco Rossi", team_name: "Basel Bombers", gw: 22, chip: "BB", points: 78, gw_avg: 48.1, roi_vs_league_avg: 29.9 },
  { entry_id: 4, manager_name: "Anna Fischer", team_name: "Geneva Giants", gw: 20, chip: "WC", points: 85, gw_avg: 56.2, roi_vs_league_avg: 28.8 },
  { entry_id: 2, manager_name: "Sophie Weber", team_name: "Zurich Strikers", gw: 18, chip: "FH", points: 71, gw_avg: 45.5, roi_vs_league_avg: 25.5 },
  { entry_id: 5, manager_name: "Peter Zimmermann", team_name: "Bern United", gw: 16, chip: "TC", points: 69, gw_avg: 51.8, roi_vs_league_avg: 17.2 },
  { entry_id: 6, manager_name: "Lisa Schneider", team_name: "Lausanne Lions", gw: 14, chip: "BB", points: 58, gw_avg: 49.3, roi_vs_league_avg: 8.7 },
];

// Best chip user based on highest ROI
export const bestChipRoi = chipUsageRoiData.reduce((best, current) => 
  current.roi_vs_league_avg > best.roi_vs_league_avg ? current : best
);

// Mock data representing vw_manager_of_month_totals view
export const managerOfMonthTotals = [
  { entry_id: 1, manager_name: "Hans Müller", team_name: "Alpine Eagles", month_utc: "2024-01", total_points: 487, rank: 1 },
  { entry_id: 2, manager_name: "Sophie Weber", team_name: "Zurich Strikers", month_utc: "2024-01", total_points: 461, rank: 2 },
  { entry_id: 3, manager_name: "Marco Rossi", team_name: "Basel Bombers", month_utc: "2024-01", total_points: 445, rank: 3 },
  { entry_id: 4, manager_name: "Anna Fischer", team_name: "Geneva Giants", month_utc: "2024-01", total_points: 432, rank: 4 },
  { entry_id: 5, manager_name: "Peter Zimmermann", team_name: "Bern United", month_utc: "2024-01", total_points: 419, rank: 5 },
  { entry_id: 6, manager_name: "Lisa Schneider", team_name: "Lausanne Lions", month_utc: "2024-01", total_points: 398, rank: 6 },
];

// Mock data representing vw_manager_of_month_winners view
export const managerOfMonthWinners = [
  { month_utc: "2024-01", manager_name: "Hans Müller", team_name: "Alpine Eagles", total_points: 487 },
  { month_utc: "2023-12", manager_name: "Sophie Weber", team_name: "Zurich Strikers", total_points: 512 },
  { month_utc: "2023-11", manager_name: "Marco Rossi", team_name: "Basel Bombers", total_points: 489 },
];

// Current month winner (most recent)
export const currentMonthWinner = managerOfMonthWinners[0];

// Mock data for longest green streaks
export const longestGreenStreaks = [
  { manager_name: "Hans Müller", team_name: "Alpine Eagles", current_streak: 7, best_streak: 12, streak_points: 578 },
  { manager_name: "Sophie Weber", team_name: "Zurich Strikers", current_streak: 3, best_streak: 9, streak_points: 445 },
  { manager_name: "Marco Rossi", team_name: "Basel Bombers", current_streak: 5, best_streak: 8, streak_points: 398 },
  { manager_name: "Anna Fischer", team_name: "Geneva Giants", current_streak: 0, best_streak: 6, streak_points: 312 },
  { manager_name: "Peter Zimmermann", team_name: "Bern United", current_streak: 2, best_streak: 7, streak_points: 289 },
  { manager_name: "Lisa Schneider", team_name: "Lausanne Lions", current_streak: 1, best_streak: 5, streak_points: 201 },
];