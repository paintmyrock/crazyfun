import { useState, useEffect } from "react";
import { FusionCreature, Move, BattleState } from "@/data/battle/types";
import { TYPE_COLORS, TYPE_EMOJI } from "@/data/battle/types";
import {
  initializeBattle,
  executeTurn,
  selectAIMove,
  calculateXpReward,
} from "@/utils/battle/battleEngine";
import { HealthBar } from "../components/HealthBar";
import { PixelButton } from "../ui/PixelButton";
import { PixelPanel } from "../ui/PixelPanel";
import { useTrainer } from "@/contexts/TrainerContext";
import { cn } from "@/lib/utils";

interface BattleScreenProps {
  playerFusion: FusionCreature;
  opponentFusion: FusionCreature;
  onBattleEnd: (won: boolean) => void;
}

export function BattleScreen({
  playerFusion,
  opponentFusion,
  onBattleEnd,
}: BattleScreenProps) {
  const [battleState, setBattleState] = useState<BattleState>(() =>
    initializeBattle(playerFusion, opponentFusion)
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const { addXp, updateFusionStats } = useTrainer();

  // Handle AI turn
  useEffect(() => {
    if (
      battleState.status === "battling" &&
      !battleState.isPlayerTurn &&
      !isAnimating
    ) {
      const timer = setTimeout(() => {
        executeAITurn();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [battleState.isPlayerTurn, battleState.status, isAnimating]);

  const executeAITurn = () => {
    setIsAnimating(true);
    const aiMove = selectAIMove(opponentFusion);
    const newState = executeTurn(battleState, aiMove, false);
    setBattleState(newState);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePlayerMove = (move: Move) => {
    if (!battleState.isPlayerTurn || isAnimating) return;

    setIsAnimating(true);
    const newState = executeTurn(battleState, move, true);
    setBattleState(newState);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleEndBattle = () => {
    const won = battleState.status === "victory";
    const xp = calculateXpReward(won);
    addXp(xp);
    updateFusionStats(playerFusion.fusionKey, won);
    onBattleEnd(won);
  };

  const isBattleOver =
    battleState.status === "victory" || battleState.status === "defeat";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Battle Field */}
        <div className="relative">
          {/* Opponent Side */}
          <PixelPanel variant="dark" className="mb-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "text-6xl transition-transform duration-200",
                  isAnimating && !battleState.isPlayerTurn && "scale-125"
                )}
              >
                {opponentFusion.imageEmoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-white text-lg">
                    {opponentFusion.name}
                  </span>
                  {opponentFusion.types.map((type) => (
                    <span
                      key={type}
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-bold",
                        TYPE_COLORS[type].bg,
                        TYPE_COLORS[type].text
                      )}
                    >
                      {TYPE_EMOJI[type]}
                    </span>
                  ))}
                </div>
                <HealthBar
                  current={battleState.opponentHp}
                  max={opponentFusion.stats.hp}
                />
              </div>
            </div>
          </PixelPanel>

          {/* VS Indicator */}
          <div className="text-center text-4xl font-bold text-yellow-400 my-2">
            ⚔️
          </div>

          {/* Player Side */}
          <PixelPanel variant="dark" className="mb-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "text-6xl transition-transform duration-200",
                  isAnimating && battleState.isPlayerTurn && "scale-125"
                )}
              >
                {playerFusion.imageEmoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-white text-lg">
                    {playerFusion.name}
                  </span>
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                    YOU
                  </span>
                  {playerFusion.types.map((type) => (
                    <span
                      key={type}
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-bold",
                        TYPE_COLORS[type].bg,
                        TYPE_COLORS[type].text
                      )}
                    >
                      {TYPE_EMOJI[type]}
                    </span>
                  ))}
                </div>
                <HealthBar
                  current={battleState.playerHp}
                  max={playerFusion.stats.hp}
                />
              </div>
            </div>
          </PixelPanel>
        </div>

        {/* Battle Log */}
        <PixelPanel className="mb-4 max-h-32 overflow-y-auto">
          <div className="space-y-1">
            {battleState.battleLog.slice(-4).map((log, i) => (
              <p
                key={i}
                className={cn(
                  "text-sm",
                  i === battleState.battleLog.length - 1
                    ? "font-bold text-slate-800"
                    : "text-slate-600"
                )}
              >
                {log}
              </p>
            ))}
          </div>
        </PixelPanel>

        {/* Move Selection or Battle End */}
        {!isBattleOver ? (
          <PixelPanel variant="dark">
            <h3 className="text-center font-bold text-white mb-3">
              {battleState.isPlayerTurn
                ? "Choose your move!"
                : "Opponent is thinking..."}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {playerFusion.moves.map((move) => (
                <button
                  key={move.id}
                  onClick={() => handlePlayerMove(move)}
                  disabled={!battleState.isPlayerTurn || isAnimating}
                  className={cn(
                    "p-4 rounded-lg border-4 transition-all",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    TYPE_COLORS[move.type].bg,
                    TYPE_COLORS[move.type].text,
                    battleState.isPlayerTurn &&
                      !isAnimating &&
                      "hover:scale-105 hover:shadow-lg cursor-pointer"
                  )}
                >
                  <div className="font-bold text-lg">{move.name}</div>
                  <div className="text-sm opacity-80">
                    {TYPE_EMOJI[move.type]} Power: {move.power}
                  </div>
                </button>
              ))}
            </div>
          </PixelPanel>
        ) : (
          <PixelPanel
            variant={battleState.status === "victory" ? "default" : "dark"}
            className="text-center"
          >
            <div className="text-6xl mb-4">
              {battleState.status === "victory" ? "🎉" : "😢"}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {battleState.status === "victory" ? "YOU WIN!" : "YOU LOSE..."}
            </h2>
            <p className="text-lg mb-4">
              {battleState.status === "victory"
                ? `${opponentFusion.name} was defeated!`
                : `${playerFusion.name} fainted...`}
            </p>
            <p className="text-sm text-slate-600 mb-4">
              +{calculateXpReward(battleState.status === "victory")} XP earned!
            </p>
            <PixelButton variant="primary" size="lg" onClick={handleEndBattle}>
              Continue
            </PixelButton>
          </PixelPanel>
        )}

        {/* Turn Indicator */}
        <div className="text-center mt-4 text-white">
          Turn {battleState.turn}
        </div>
      </div>
    </div>
  );
}
