// ============================================
// Crazy Fun Boxing - Stamina/Overheat Bar
// ============================================

import { OVERHEAT_CONFIG } from "@/data/boxing/config";

interface StaminaBarProps {
  overheat: number;
  isOverheated: boolean;
  className?: string;
}

export function StaminaBar({ overheat, isOverheated, className = "" }: StaminaBarProps) {
  const percent = Math.min(100, (overheat / OVERHEAT_CONFIG.maxOverheat) * 100);

  // Color based on overheat level
  let barColor = "bg-blue-500";
  let bgColor = "bg-blue-900";

  if (percent >= OVERHEAT_CONFIG.criticalThreshold) {
    barColor = "bg-red-500";
    bgColor = "bg-red-900";
  } else if (percent >= OVERHEAT_CONFIG.warningThreshold) {
    barColor = "bg-orange-500";
    bgColor = "bg-orange-900";
  }

  // Animation when overheated
  const pulseClass = isOverheated ? "animate-pulse" : "";
  const shakeClass = isOverheated ? "animate-[shake_0.1s_infinite]" : "";

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold">HEAT</span>
        {isOverheated && (
          <span className="text-xs text-red-500 font-bold animate-pulse">OVERHEATED!</span>
        )}
      </div>
      <div
        className={`h-3 ${bgColor} rounded-full overflow-hidden cartoon-border ${shakeClass}`}
      >
        <div
          className={`h-full ${barColor} ${pulseClass} transition-all duration-100`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {/* Warning threshold marker */}
      <div className="relative h-0">
        <div
          className="absolute top-[-12px] w-0.5 h-3 bg-yellow-400"
          style={{ left: `${OVERHEAT_CONFIG.warningThreshold}%` }}
        />
        <div
          className="absolute top-[-12px] w-0.5 h-3 bg-red-400"
          style={{ left: `${OVERHEAT_CONFIG.criticalThreshold}%` }}
        />
      </div>
    </div>
  );
}

export default StaminaBar;
