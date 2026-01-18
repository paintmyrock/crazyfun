import { cn } from "@/lib/utils";

interface HealthBarProps {
  current: number;
  max: number;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "h-3",
  md: "h-5",
  lg: "h-7",
};

export function HealthBar({
  current,
  max,
  showText = true,
  size = "md",
}: HealthBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  // Color based on health percentage
  let barColor = "bg-green-500";
  if (percentage <= 25) {
    barColor = "bg-red-500";
  } else if (percentage <= 50) {
    barColor = "bg-yellow-500";
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          "w-full bg-slate-300 rounded-full border-2 border-slate-400 overflow-hidden",
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 rounded-full",
            barColor
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <div className="text-center text-sm font-bold text-slate-700 mt-1">
          {current} / {max} HP
        </div>
      )}
    </div>
  );
}
