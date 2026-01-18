import { BaseEntity } from "@/data/battle/types";
import { TYPE_COLORS, TYPE_EMOJI } from "@/data/battle/types";
import { cn } from "@/lib/utils";

interface EntityCardProps {
  entity: BaseEntity;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: { card: "p-2", emoji: "text-3xl", name: "text-xs" },
  md: { card: "p-3", emoji: "text-5xl", name: "text-sm" },
  lg: { card: "p-4", emoji: "text-7xl", name: "text-base" },
};

export function EntityCard({
  entity,
  selected = false,
  onClick,
  disabled = false,
  size = "md",
}: EntityCardProps) {
  const typeColor = TYPE_COLORS[entity.elementalType];
  const styles = sizeStyles[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-xl border-4 transition-all duration-200",
        "hover:scale-105 active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        styles.card,
        selected
          ? "border-yellow-400 bg-yellow-100 shadow-lg ring-4 ring-yellow-300"
          : "border-slate-300 bg-white hover:border-slate-400"
      )}
    >
      <div className={cn("mb-1", styles.emoji)}>{entity.imageEmoji}</div>
      <div className={cn("font-bold text-slate-800", styles.name)}>
        {entity.name}
      </div>
      <div
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1",
          typeColor.bg,
          typeColor.text
        )}
      >
        {TYPE_EMOJI[entity.elementalType]} {entity.elementalType}
      </div>
    </button>
  );
}
