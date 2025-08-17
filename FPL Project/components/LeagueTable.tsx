import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Trophy } from "lucide-react";
import { ChipIcon } from "./ChipIcon";
import { TrendIcon } from "./TrendIcon";
import { mockLeagueData } from "../constants/mockData";

export function LeagueTable() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Live League Table</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-red-50">
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead className="text-right">Total Points</TableHead>
                <TableHead>Captain</TableHead>
                <TableHead>Chip</TableHead>
                <TableHead className="w-16">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLeagueData.map((manager) => (
                <TableRow key={manager.rank} className={manager.rank === 1 ? "bg-yellow-50" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {manager.rank === 1 && <Trophy className="w-4 h-4 text-yellow-600" />}
                      {manager.rank}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{manager.managerName}</TableCell>
                  <TableCell>{manager.teamName}</TableCell>
                  <TableCell className="text-right font-bold">{manager.totalPoints.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-red-200 text-red-700">
                      {manager.captain}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ChipIcon chip={manager.chipUsed} />
                  </TableCell>
                  <TableCell>
                    <TrendIcon trend={manager.trend} />
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