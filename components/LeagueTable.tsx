import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { TrendIcon } from "./TrendIcon";
import { useLeagueData } from "../hooks/useLeagueData";
import { leagueTableData } from "../constants/mockData";

export function LeagueTable() {
  const { leagueStandings, hasData } = useLeagueData();
  
  // Use real data if available, fallback to mock data
  const displayData = hasData && leagueStandings.length > 0 ? leagueStandings : leagueTableData;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">League Table</h2>
        {!hasData && (
          <Badge variant="outline" className="text-xs">Demo Data</Badge>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Current Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead className="text-right">Total Points</TableHead>
                <TableHead className="text-right">GW Points</TableHead>
                <TableHead className="text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.slice(0, 12).map((row, index) => (
                <TableRow key={row.entry_id || index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {(row.rank || index + 1) === 1 && (
                        <div className="w-2 h-6 bg-yellow-500 rounded-full"></div>
                      )}
                      {(row.rank || index + 1) <= 3 && (row.rank || index + 1) > 1 && (
                        <div className="w-2 h-6 bg-gray-400 rounded-full"></div>
                      )}
                      {(row.rank || index + 1) > 10 && (
                        <div className="w-2 h-6 bg-red-500 rounded-full"></div>
                      )}
                      <span>{row.rank || index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {row.manager_name || row.manager || 'Unknown Manager'}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {row.team_name || row.teamName || 'Unknown Team'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {(row.points || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.gameweekPoints || row.gw_points || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    <TrendIcon 
                      trend={row.trend || "same"} 
                      change={row.trendChange || row.trend_change || 0} 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}