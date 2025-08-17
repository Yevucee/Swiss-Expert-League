import { Crown, Users, Target, Shuffle } from "lucide-react";

interface ChipIconProps {
  chip: "crown" | "users" | "target" | "shuffle";
  className?: string;
}

export function ChipIcon({ chip, className = "w-4 h-4" }: ChipIconProps) {
  const icons = {
    crown: Crown,
    users: Users,
    target: Target,
    shuffle: Shuffle,
  };

  const Icon = icons[chip];
  return <Icon className={className} />;
}