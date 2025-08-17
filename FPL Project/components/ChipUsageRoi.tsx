import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { ChipIcon } from "./ChipIcon";
import { chipUsageRoiData } from "../constants/mockData";

export function ChipUsageRoi() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chip Usage ROI Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          ROI = Return on Investment compared to league average for that gameweek
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Manager</TableHead>
              <TableHead>GW</TableHead>
              <TableHead>Chip</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">GW Avg</TableHead>
              <TableHead className="text-right">ROI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chipUsageRoiData.map((row, index) => (
              <TableRow key={`${row.entry_id}-${row.gw}`} className={index === 0 ? "bg-green-50" : ""}>
                <TableCell>
                  <div>
                    <div className="font-medium">{row.manager_name}</div>
                    <div className="text-sm text-muted-foreground">{row.team_name}</div>
                  </div>
                </TableCell>
                <TableCell>{row.gw}</TableCell>
                <TableCell>
                  <ChipIcon chip={row.chip} />
                </TableCell>
                <TableCell className="text-right font-medium">{row.points}</TableCell>
                <TableCell className="text-right">{row.gw_avg}</TableCell>
                <TableCell className="text-right">
                  <Badge 
                    variant={row.roi_vs_league_avg > 20 ? "default" : row.roi_vs_league_avg > 0 ? "secondary" : "destructive"}
                    className={row.roi_vs_league_avg > 20 ? "bg-green-600" : ""}
                  >
                    +{row.roi_vs_league_avg}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}