import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import useLeagueData from "../hooks/useLeagueData";
import { Badge } from "./ui/badge"; // optional: shows "No data" if empty

// Supabase row shape we expect from `league_snapshots`
type LeagueRow = {
  entry_id: number;
  rank: number;
  manager_name: string;
  team_name: string;
  total_points: number;
  gw_points: number | null;
};

export function LeagueTable() {
  const { leagueStandings } = useLeagueData();

  // Use Supabase data only
  const rows = (leagueStandings as LeagueRow[]) ?? [];
  const empty = rows.length === 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">League Table</h2>
        {empty && <Badge variant="outline" className="text-xs">No data</Badge>}
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
                {/* Trend removed for now */}
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.slice(0, 12).map((row) => (
                <TableRow key={row.entry_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {row.rank === 1 && <div className="w-2 h-6 bg-yellow-500 rounded-full" />}
                      {row.rank > 1 && row.rank <= 3 && <div className="w-2 h-6 bg-gray-400 rounded-full" />}
                      {row.rank > 10 && <div className="w-2 h-6 bg-red-500 rounded-full" />}
                      <span>{row.rank}</span>
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">
                    {row.manager_name ?? "Unknown Manager"}
                  </TableCell>

                  <TableCell className="text-gray-600">
                    {row.team_name ?? "Unknown Team"}
                  </TableCell>

                  <TableCell className="text-right font-bold">
                    {(row.total_points ?? 0).toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right">
                    {row.gw_points ?? 0}
                  </TableCell>
                </TableRow>
              ))}

              {empty && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No standings yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
