// ============================================
// Crazy Fun Boxing - Health Bar Component
// ============================================

interface HealthBarProps {
  current: number;
  max: number;
  isPlayer?: boolean;
  showValue?: boolean;
  className?: string;
}

export function HealthBar({
  current,
  max,
  isPlayer = true,
  showValue = true,
  className = "",
}: HealthBarProps) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));

  // Color based on health percentage
  let barColor = "bg-green-500";
  if (percent <= 20) {
    barColor = "bg-red-500";
  } else if (percent <= 50) {
    barColor = "bg-yellow-500";
  }

  // Pulse animation when low health
  const pulseClass = percent <= 20 ? "animate-pulse" : "";

  return (
    <div className={`w-full ${className}`}>
      {showValue && (
        <div className={`text-xs font-bold mb-1 ${isPlayer ? "text-left" : "text-right"}`}>
          {Math.ceil(current)} / {max} HP
        </div>
      )}
      <div
        className={`h-4 bg-gray-800 rounded-full overflow-hidden cartoon-border ${
          isPlayer ? "" : "flex-row-reverse"
        }`}
      >
        <div
          className={`h-full ${barColor} ${pulseClass} transition-all duration-200`}
          style={{
            width: `${percent}%`,
            marginLeft: isPlayer ? 0 : "auto",
          }}
        />
      </div>
    </div>
  );
}

export default HealthBar;
