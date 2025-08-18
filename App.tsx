// UI bits
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Trophy, TrendingUp, TrendingDown, Crown, Award, AlertCircle } from "lucide-react";

// Components (match real exports)
import { Header } from "./components/Header";                 // named
import { LeagueTable } from "./components/LeagueTable";       // named
import { StatCard } from "./components/StatCard";             // named
import ChipUsageRoi from "./components/ChipUsageRoi";         // default
import { ManagerOfTheMonth } from "./components/ManagerOfTheMonth";  // named
import { LongestGreenStreak } from "./components/LongestGreenStreak"; // named

// Alerts
import { Alert, AlertDescription } from "./components/ui/alert";

// Hook (we made it a default export)
import useLeagueData from "./hooks/useLeagueData";

// (optional) mock data fallback if you’re still keeping it
import { gameweekStats, seasonStats } from "./constants/mockData";

export default function App() {
  const {
    chipUsageRoi,
    managerOfMonthTotals,
    currentMonthWinner,
    bestChipRoi,
    leagueStandings,
    gameweekStats: liveGameweekStats,
    latestGameweek,
    loading,
    error,
    hasData
  } = useLeagueData();

  // Use live data if available, fallback to mock data
  const displayGameweekStats = liveGameweekStats || gameweekStats;
  const displayBestChipRoi = bestChipRoi || { 
    roi_vs_league_avg: seasonStats.bestChipUsage?.roi || 0, 
    manager_name: seasonStats.bestChipUsage?.manager || "Loading...", 
    gw: seasonStats.bestChipUsage?.gw || 0, 
    chip: seasonStats.bestChipUsage?.chip || ""
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Swiss Expert League data...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Show connection status */}
        {!hasData && (
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              Using demo data. Database connection issues detected. Some features may show placeholder information.
            </AlertDescription>
          </Alert>
        )}

        {hasData && (
          <Alert className="border-green-500 bg-green-50">
            <Trophy className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Connected to live Swiss Expert League database! Showing real data from gameweek {latestGameweek}.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Gameweek Snapshot - Top Priority */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Gameweek {latestGameweek} Snapshot
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Highest Score"
              value={displayGameweekStats.highestScore?.points?.toString() || "0"}
              subtitle={displayGameweekStats.highestScore?.manager || "Loading..."}
              icon={Trophy}
            />
            <StatCard
              title="Best Captain"
              value={displayGameweekStats.bestCaptain?.points?.toString() || "0"}
              subtitle={`${displayGameweekStats.bestCaptain?.captain || "Loading..."} (${displayGameweekStats.bestCaptain?.manager || ""})`}
              icon={Crown}
              color="text-yellow-600"
            />
            <StatCard
              title="Biggest Rise"
              value={`+${displayGameweekStats.biggestRise?.positions || 0}`}
              subtitle={displayGameweekStats.biggestRise?.manager || "Loading..."}
              icon={TrendingUp}
              color="text-green-600"
            />
            <StatCard
              title="Biggest Fall"
              value={`-${displayGameweekStats.biggestFall?.positions || 0}`}
              subtitle={displayGameweekStats.biggestFall?.manager || "Loading..."}
              icon={TrendingDown}
              color="text-red-600"
            />
          </div>
        </section>

        <LeagueTable />

        {/* Manager of the Month - Smaller Section */}
        <ManagerOfTheMonth />

        {/* Longest Green Streak */}
        <LongestGreenStreak />

        {/* Season Stats with ROI Explainer */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Season Statistics</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Best Chip Usage</strong> = highest positive impact compared to league average. 
                ROI is calculated as (chip week score – average GW score).
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  Most Weeks at #1
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{seasonStats.mostWeeksFirst.weeks}</div>
                <p className="text-sm text-muted-foreground">{seasonStats.mostWeeksFirst.manager}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-gray-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-gray-600" />
                  Most Weeks Last Place
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{seasonStats.mostWeeksLast.weeks}</div>
                <p className="text-sm text-muted-foreground">{seasonStats.mostWeeksLast.manager}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Best Chip Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+{displayBestChipRoi.roi_vs_league_avg}</div>
                <p className="text-sm text-muted-foreground">
                  {displayBestChipRoi.manager_name} (GW {displayBestChipRoi.gw} {displayBestChipRoi.chip})
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Chip Usage ROI Analysis */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Chip Usage Analysis</h2>
          <ChipUsageRoi />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-600">
            Swiss Expert League • Updates every 5 minutes during gameweeks
          </p>
          {hasData && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated from live database • Gameweek {latestGameweek}
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
