import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { ChipIcon } from "./ChipIcon";
import { useLeagueData } from "../hooks/useLeagueData";
import { chipUsageData } from "../constants/mockData";

export function ChipUsageRoi() {
  const { chipUsageRoi, hasData } = useLeagueData();
  
  // Use real data if available, fallback to mock data
  const displayData = hasData && chipUsageRoi.length > 0 ? chipUsageRoi : chipUsageData;

  const getChipName = (chip: string) => {
    const chipMap: { [key: string]: string } = {
      '3xc': 'Triple Captain',
      'TC': 'Triple Captain',
      'BB': 'Bench Boost',
      'FH': 'Free Hit',
      'WC': 'Wildcard',
      'triple_captain': 'Triple Captain',
      'bench_boost': 'Bench Boost',
      'free_hit': 'Free Hit',
      'wildcard': 'Wildcard'
    };
    return chipMap[chip] || chip;
  };

  const getChipIcon = (chip: string) => {
    const iconMap: { [key: string]: "crown" | "users" | "target" | "shuffle" } = {
      '3xc': 'crown',
      'TC': 'crown',
      'BB': 'users',
      'FH': 'target',
      'WC': 'shuffle',
      'triple_captain': 'crown',
      'bench_boost': 'users',
      'free_hit': 'target',
      'wildcard': 'shuffle',
      'Triple Captain': 'crown',
      'Bench Boost': 'users',
      'Free Hit': 'target',
      'Wildcard': 'shuffle'
    };
    return iconMap[chip] || 'crown';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Chip Usage Performance</CardTitle>
        {!hasData && (
          <Badge variant="outline" className="text-xs">Demo Data</Badge>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Manager</TableHead>
              <TableHead>Chip</TableHead>
              <TableHead className="text-center">Gameweek</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">ROI vs Avg</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.slice(0, 12).map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {row.manager_name || row.manager}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ChipIcon chip={getChipIcon(row.chip)} />
                    <span>{getChipName(row.chip)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {row.gw || row.gameweek}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {row.points}
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-bold ${
                    (row.roi_vs_league_avg || row.roi || 0) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {(row.roi_vs_league_avg || row.roi || 0) >= 0 ? '+' : ''}
                    {row.roi_vs_league_avg || row.roi || 0}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}