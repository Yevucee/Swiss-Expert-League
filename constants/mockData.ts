// Mock data for fallback when database is unavailable
export const gameweekStats = {
  highestScore: {
    points: 84,
    manager: "Alex Mueller"
  },
  bestCaptain: {
    points: 26,
    captain: "Erling Haaland",
    manager: "Sarah Weber"
  },
  biggestRise: {
    positions: 7,
    manager: "Marco Rossi"
  },
  biggestFall: {
    positions: 5,
    manager: "Lisa Schmidt"
  }
};

export const seasonStats = {
  mostWeeksFirst: {
    weeks: 8,
    manager: "Thomas Zimmermann"
  },
  mostWeeksLast: {
    weeks: 3,
    manager: "Peter Keller"
  },
  bestChipUsage: {
    roi: 47,
    manager: "Emma Fischer",
    gw: 12,
    chip: "Triple Captain"
  }
};

export const leagueTableData = [
  {
    rank: 1,
    manager: "Thomas Zimmermann",
    teamName: "Alpine Eagles FC",
    points: 1847,
    gameweekPoints: 71,
    trend: "up" as const,
    trendChange: 2
  },
  {
    rank: 2,
    manager: "Sarah Weber",
    teamName: "Matterhorn United",
    points: 1832,
    gameweekPoints: 84,
    trend: "up" as const,
    trendChange: 1
  },
  {
    rank: 3,
    manager: "Alex Mueller",
    teamName: "Geneva Giants",
    points: 1798,
    gameweekPoints: 69,
    trend: "down" as const,
    trendChange: 1
  },
  {
    rank: 4,
    manager: "Emma Fischer",
    teamName: "Zurich Zebras",
    points: 1775,
    gameweekPoints: 58,
    trend: "same" as const,
    trendChange: 0
  },
  {
    rank: 5,
    manager: "Marco Rossi",
    teamName: "Ticino Tigers",
    points: 1743,
    gameweekPoints: 76,
    trend: "up" as const,
    trendChange: 7
  },
  {
    rank: 6,
    manager: "Lisa Schmidt",
    teamName: "Basel Bombers",
    points: 1721,
    gameweekPoints: 45,
    trend: "down" as const,
    trendChange: 5
  },
  {
    rank: 7,
    manager: "David Lehmann",
    teamName: "Bern Bears",
    points: 1698,
    gameweekPoints: 62,
    trend: "up" as const,
    trendChange: 1
  },
  {
    rank: 8,
    manager: "Anna Meier",
    teamName: "Lausanne Lions",
    points: 1654,
    gameweekPoints: 59,
    trend: "same" as const,
    trendChange: 0
  },
  {
    rank: 9,
    manager: "Stefan Huber",
    teamName: "St. Gallen Sharks",
    points: 1632,
    gameweekPoints: 67,
    trend: "up" as const,
    trendChange: 2
  },
  {
    rank: 10,
    manager: "Nina Brunner",
    teamName: "Lucerne Lynx",
    points: 1598,
    gameweekPoints: 54,
    trend: "down" as const,
    trendChange: 3
  },
  {
    rank: 11,
    manager: "Oliver Graf",
    teamName: "Winterthur Wolves",
    points: 1567,
    gameweekPoints: 48,
    trend: "down" as const,
    trendChange: 1
  },
  {
    rank: 12,
    manager: "Peter Keller",
    teamName: "Thun Thunder",
    points: 1534,
    gameweekPoints: 41,
    trend: "down" as const,
    trendChange: 2
  }
];

export const chipUsageData = [
  {
    manager: "Emma Fischer",
    chip: "Triple Captain",
    gameweek: 12,
    points: 78,
    roi: 47,
    chipIcon: "crown" as const
  },
  {
    manager: "Thomas Zimmermann",
    chip: "Bench Boost",
    gameweek: 18,
    points: 89,
    roi: 42,
    chipIcon: "users" as const
  },
  {
    manager: "Sarah Weber",
    chip: "Free Hit",
    gameweek: 23,
    points: 71,
    roi: 38,
    chipIcon: "target" as const
  },
  {
    manager: "Marco Rossi",
    chip: "Triple Captain",
    gameweek: 9,
    points: 65,
    roi: 34,
    chipIcon: "crown" as const
  },
  {
    manager: "Alex Mueller",
    chip: "Wildcard",
    gameweek: 7,
    points: 82,
    roi: 31,
    chipIcon: "shuffle" as const
  },
  {
    manager: "David Lehmann",
    chip: "Bench Boost",
    gameweek: 15,
    points: 58,
    roi: 27,
    chipIcon: "users" as const
  },
  {
    manager: "Lisa Schmidt",
    chip: "Free Hit",
    gameweek: 11,
    points: 64,
    roi: 23,
    chipIcon: "target" as const
  },
  {
    manager: "Anna Meier",
    chip: "Wildcard",
    gameweek: 5,
    points: 73,
    roi: 18,
    chipIcon: "shuffle" as const
  },
  {
    manager: "Stefan Huber",
    chip: "Triple Captain",
    gameweek: 20,
    points: 52,
    roi: 12,
    chipIcon: "crown" as const
  },
  {
    manager: "Nina Brunner",
    chip: "Bench Boost",
    gameweek: 13,
    points: 49,
    roi: 8,
    chipIcon: "users" as const
  },
  {
    manager: "Oliver Graf",
    chip: "Free Hit",
    gameweek: 22,
    points: 45,
    roi: -3,
    chipIcon: "target" as const
  },
  {
    manager: "Peter Keller",
    chip: "Wildcard",
    gameweek: 16,
    points: 38,
    roi: -12,
    chipIcon: "shuffle" as const
  }
];

export const managerOfMonthTotals = [
  {
    entry_id: 1,
    rank: 1,
    manager_name: "Thomas Zimmermann",
    team_name: "Alpine Eagles FC",
    month_utc: "2024-01",
    total_points: 342
  },
  {
    entry_id: 2,
    rank: 2,
    manager_name: "Sarah Weber",
    team_name: "Matterhorn United",
    month_utc: "2024-01",
    total_points: 328
  },
  {
    entry_id: 3,
    rank: 3,
    manager_name: "Emma Fischer",
    team_name: "Zurich Zebras",
    month_utc: "2024-01",
    total_points: 315
  },
  {
    entry_id: 4,
    rank: 4,
    manager_name: "Alex Mueller",
    team_name: "Geneva Giants",
    month_utc: "2024-01",
    total_points: 298
  },
  {
    entry_id: 5,
    rank: 5,
    manager_name: "Marco Rossi",
    team_name: "Ticino Tigers",
    month_utc: "2024-01",
    total_points: 285
  }
];

export const currentMonthWinner = {
  month_utc: "2024-01",
  manager_name: "Thomas Zimmermann",
  team_name: "Alpine Eagles FC",
  total_points: 342
};

export const greenStreakData = [
  {
    manager: "Sarah Weber",
    teamName: "Matterhorn United",
    currentStreak: 7,
    bestStreak: 9,
    streakPoints: 534
  },
  {
    manager: "Thomas Zimmermann",
    teamName: "Alpine Eagles FC",
    currentStreak: 5,
    bestStreak: 8,
    streakPoints: 389
  },
  {
    manager: "Emma Fischer",
    teamName: "Zurich Zebras",
    currentStreak: 4,
    bestStreak: 7,
    streakPoints: 312
  },
  {
    manager: "Marco Rossi",
    teamName: "Ticino Tigers",
    currentStreak: 3,
    bestStreak: 6,
    streakPoints: 245
  },
  {
    manager: "Alex Mueller",
    teamName: "Geneva Giants",
    currentStreak: 0,
    bestStreak: 5,
    streakPoints: 0
  }
];