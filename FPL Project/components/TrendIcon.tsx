import { TrendingUp, TrendingDown } from "lucide-react";

export function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-600" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-600" />;
  return <div className="w-4 h-4" />;
}