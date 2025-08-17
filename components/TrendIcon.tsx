import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendIconProps {
  trend: "up" | "down" | "same";
  change: number;
}

export function TrendIcon({ trend, change }: TrendIconProps) {
  if (trend === "up") {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <TrendingUp className="w-3 h-3" />
        <span className="text-xs font-medium">+{change}</span>
      </div>
    );
  }

  if (trend === "down") {
    return (
      <div className="flex items-center gap-1 text-red-600">
        <TrendingDown className="w-3 h-3" />
        <span className="text-xs font-medium">-{change}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-gray-400">
      <Minus className="w-3 h-3" />
      <span className="text-xs font-medium">0</span>
    </div>
  );
}