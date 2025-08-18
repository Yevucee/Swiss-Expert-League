import { useEffect, useState } from "react";
import { fetchChipUsageRoi, type ChipUsageRoi } from "@/utils/database/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatRoi(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  // roi_vs_league_avg is typically “points vs league avg”, show 1 dp
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return n.toFixed(1);
}

export default function ChipUsageRoi() {
  const [rows, setRows] = useState<ChipUsageRoi[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchChipUsageRoi();
        if (!cancelled) setRows(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load chip ROI");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (rows === null) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">
        Loading chip ROI…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">
        No chips played yet this season.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-3 text-lg font-semibold">Best Chip ROI (vs league avg)</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Manager</TableHead>
            <TableHead className="hidden sm:table-cell">Team</TableHead>
            <TableHead>Chip</TableHead>
            <TableHead>GW</TableHead>
            <TableHead className="text-right">Points</TableHead>
            <TableHead className="text-right">ROI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.entry_id}-${row.gw}-${row.chip}`}>
              <TableCell className="font-medium">{row.manager_name}</TableCell>
              <TableCell className="hidden sm:table-cell">{row.team_name}</TableCell>
              <TableCell>{row.chip ?? "—"}</TableCell>
              <TableCell>{row.gw}</TableCell>
              <TableCell className="text-right">{row.points ?? 0}</TableCell>
              <TableCell className="text-right">{formatRoi(row.roi_vs_league_avg)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
