import { Crown, Target, Zap, Star } from "lucide-react";

export function ChipIcon({ chip }: { chip: string | null }) {
  if (!chip) return null;
  
  const chipIcons = {
    TC: <Crown className="w-4 h-4 text-yellow-600" />,
    BB: <Target className="w-4 h-4 text-blue-600" />,
    FH: <Zap className="w-4 h-4 text-purple-600" />,
    WC: <Star className="w-4 h-4 text-green-600" />,
  };

  return (
    <div className="flex items-center gap-1">
      {chipIcons[chip as keyof typeof chipIcons]}
      <span className="text-xs">{chip}</span>
    </div>
  );
}