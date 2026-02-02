// ============================================
// Crazy Fun Boxing - Results Screen
// ============================================

import { useEffect, useState } from "react";
import { useBoxing } from "@/contexts/BoxingContext";
import { Button } from "@/components/ui/button";
import { DifficultyTier } from "@/data/boxing/types";
import { FightResult } from "./FightScreen";
import confetti from "canvas-confetti";

interface ResultsScreenProps {
  result: FightResult;
  difficulty: DifficultyTier;
  onContinue: () => void;
  onRematch: () => void;
}

interface RewardDisplay {
  xp: number;
  coins: number;
  gloves: number;
  bonuses: Array<{ name: string; value: string }>;
}

export function ResultsScreen({
  result,
  difficulty,
  onContinue,
  onRematch,
}: ResultsScreenProps) {
  const { recordFightResult, player } = useBoxing();
  const [rewards, setRewards] = useState<RewardDisplay | null>(null);
  const [showRewards, setShowRewards] = useState(false);
  const [levelUp, setLevelUp] = useState(false);

  useEffect(() => {
    // Record the fight and get rewards
    const oldLevel = player?.level || 1;
    const earnedRewards = recordFightResult(result.won, difficulty, {
      knockdowns: result.knockdowns,
      maxCombo: result.maxCombo,
      damageDealt: result.damageDealt,
      damageReceived: result.damageReceived,
      usedFinisher: result.usedFinisher,
      perfectWin: result.perfectWin,
    });

    // Build bonus list
    const bonuses: Array<{ name: string; value: string }> = [];

    if (result.knockdowns > 0) {
      bonuses.push({ name: "Knockdowns", value: `+${result.knockdowns * 10} XP` });
    }
    if (result.maxCombo >= 5) {
      bonuses.push({ name: `${result.maxCombo}-Hit Combo`, value: `+${Math.floor(result.maxCombo / 5) * 15} XP` });
    }
    if (result.perfectWin) {
      bonuses.push({ name: "Perfect Win!", value: "+50 XP, +1 Glove" });
    }
    if (result.usedFinisher) {
      bonuses.push({ name: "Finisher!", value: "+25 XP" });
    }

    setRewards({
      xp: earnedRewards.xp,
      coins: earnedRewards.coins,
      gloves: earnedRewards.gloves,
      bonuses,
    });

    // Check for level up
    setTimeout(() => {
      if (player && player.level > oldLevel) {
        setLevelUp(true);
      }
    }, 500);

    // Animate rewards
    setTimeout(() => setShowRewards(true), 500);

    // Confetti for wins
    if (result.won) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FFA500", "#FF6B35"],
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      {/* Result Header */}
      <div className="text-center mb-8">
        <h1
          className={`text-5xl font-bold mb-2 ${
            result.won ? "text-green-400" : "text-red-400"
          }`}
        >
          {result.won ? "VICTORY!" : "DEFEAT"}
        </h1>
        <p className="text-gray-400">
          Round {result.rounds} - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </p>
      </div>

      {/* Stats */}
      <div className="w-full max-w-sm bg-black/50 rounded-2xl p-4 mb-6 cartoon-border">
        <h2 className="text-white font-bold mb-3">Fight Stats</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Damage Dealt</span>
            <span className="text-white font-bold">{result.damageDealt}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Damage Taken</span>
            <span className="text-white font-bold">{result.damageReceived}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Max Combo</span>
            <span className="text-yellow-400 font-bold">{result.maxCombo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Knockdowns</span>
            <span className="text-orange-400 font-bold">{result.knockdowns}</span>
          </div>
        </div>
      </div>

      {/* Rewards */}
      {showRewards && rewards && (
        <div className="w-full max-w-sm bg-black/50 rounded-2xl p-4 mb-6 cartoon-border animate-[bounceIn_0.3s_ease-out]">
          <h2 className="text-white font-bold mb-3">Rewards</h2>

          {/* XP */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="flex-1">
              <div className="text-gray-400 text-xs">Experience</div>
              <div className="text-white font-bold text-lg">+{rewards.xp} XP</div>
            </div>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-yellow-500/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🪙</span>
            </div>
            <div className="flex-1">
              <div className="text-gray-400 text-xs">Coins</div>
              <div className="text-white font-bold text-lg">+{rewards.coins}</div>
            </div>
          </div>

          {/* Gloves */}
          {rewards.gloves > 0 && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-500/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🥊</span>
              </div>
              <div className="flex-1">
                <div className="text-gray-400 text-xs">Gloves</div>
                <div className="text-white font-bold text-lg">+{rewards.gloves}</div>
              </div>
            </div>
          )}

          {/* Bonuses */}
          {rewards.bonuses.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h3 className="text-gray-400 text-xs mb-2">BONUSES</h3>
              {rewards.bonuses.map((bonus, i) => (
                <div key={i} className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-400">{bonus.name}</span>
                  <span className="text-white">{bonus.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Level Up */}
      {levelUp && (
        <div className="w-full max-w-sm bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-2xl p-4 mb-6 cartoon-border animate-pulse">
          <div className="text-center">
            <span className="text-4xl">🎉</span>
            <h2 className="text-2xl font-bold text-yellow-400">LEVEL UP!</h2>
            <p className="text-white">You reached level {player?.level}!</p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <Button
          onClick={onRematch}
          className="w-full h-14 text-xl font-bold bg-blue-500 hover:bg-blue-600 cartoon-border"
        >
          Rematch
        </Button>
        <Button
          onClick={onContinue}
          variant="outline"
          className="w-full h-12 font-bold cartoon-border"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export default ResultsScreen;
