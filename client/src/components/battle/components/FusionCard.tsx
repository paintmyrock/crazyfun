import { FusionCreature } from "@/data/battle/types";
import { TYPE_COLORS, TYPE_EMOJI } from "@/data/battle/types";
import { PixelPanel } from "../ui/PixelPanel";
import { cn } from "@/lib/utils";

interface FusionCardProps {
  fusion: FusionCreature;
  showStats?: boolean;
  showMoves?: boolean;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}

export function FusionCard({
  fusion,
  showStats = false,
  showMoves = false,
  onClick,
  selected = false,
  compact = false,
}: FusionCardProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "text-left w-full",
        onClick && "hover:scale-102 transition-transform",
        selected && "ring-4 ring-yellow-400 rounded-xl"
      )}
    >
      <PixelPanel className={compact ? "p-3" : "p-4"}>
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn("text-center", compact ? "text-4xl" : "text-6xl")}>
            {fusion.imageEmoji}
          </div>
          <div className="flex-1">
            <h3 className={cn("font-bold text-slate-800", compact ? "text-lg" : "text-xl")}>
              {fusion.name}
            </h3>
            <div className="flex gap-1 mt-1">
              {fusion.types.map((type, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                    TYPE_COLORS[type].bg,
                    TYPE_COLORS[type].text
                  )}
                >
                  {TYPE_EMOJI[type]} {type}
                </span>
              ))}
            </div>
            {!compact && (
              <p className="text-sm text-slate-600 mt-2">{fusion.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-5 gap-2 mt-4">
            <StatBox label="HP" value={fusion.stats.hp} color="bg-red-400" />
            <StatBox label="ATK" value={fusion.stats.attack} color="bg-orange-400" />
            <StatBox label="DEF" value={fusion.stats.defense} color="bg-blue-400" />
            <StatBox label="SPD" value={fusion.stats.speed} color="bg-green-400" />
            <StatBox label="SP" value={fusion.stats.specialPower} color="bg-purple-400" />
          </div>
        )}

        {/* Moves */}
        {showMoves && (
          <div className="mt-4 space-y-2">
            <h4 className="font-bold text-sm text-slate-700">Moves:</h4>
            {fusion.moves.map((move, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg",
                  TYPE_COLORS[move.type].bg,
                  TYPE_COLORS[move.type].text
                )}
              >
                <span className="font-bold">{move.name}</span>
                <span className="text-sm opacity-80">PWR: {move.power}</span>
              </div>
            ))}
          </div>
        )}
      </PixelPanel>
    </Wrapper>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={cn("rounded-lg p-2 text-center text-white", color)}>
      <div className="text-xs font-bold opacity-80">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
