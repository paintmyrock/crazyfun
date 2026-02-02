// ============================================
// Crazy Fun Boxing - Main Menu Screen
// ============================================

import { useBoxing } from "@/contexts/BoxingContext";
import { Button } from "@/components/ui/button";
import { getFighterById } from "@/data/boxing/fighters";

interface MainMenuProps {
  onFight: () => void;
  onFighters: () => void;
  onUpgrades: () => void;
}

export function MainMenu({ onFight, onFighters, onUpgrades }: MainMenuProps) {
  const { player, getXpProgress } = useBoxing();

  if (!player) return null;

  const selectedFighter = getFighterById(player.selectedFighter);
  const xpProgress = getXpProgress();

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gradient-to-b from-blue-900 to-purple-900">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-white mb-2 font-[Fredoka]">
          Crazy Fun Boxing
        </h1>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">{player.avatarEmoji}</span>
          <span className="text-xl text-white font-bold">{player.username}</span>
        </div>
      </div>

      {/* Level & XP */}
      <div className="w-full max-w-sm bg-black/30 rounded-2xl p-4 mb-4 cartoon-border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-bold">Level {player.level}</span>
          <span className="text-gray-300 text-sm">
            {xpProgress.current} / {xpProgress.required} XP
          </span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-300"
            style={{ width: `${xpProgress.percent}%` }}
          />
        </div>
      </div>

      {/* Currencies */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 bg-yellow-500/20 rounded-xl px-4 py-2 cartoon-border">
          <span className="text-2xl">🪙</span>
          <span className="text-white font-bold">{player.currencies.coins}</span>
        </div>
        <div className="flex items-center gap-2 bg-red-500/20 rounded-xl px-4 py-2 cartoon-border">
          <span className="text-2xl">🥊</span>
          <span className="text-white font-bold">{player.currencies.gloves}</span>
        </div>
      </div>

      {/* Selected Fighter Preview */}
      <div className="w-full max-w-sm bg-black/30 rounded-2xl p-4 mb-6 cartoon-border">
        <div className="text-center">
          <span className="text-6xl">{selectedFighter?.emoji}</span>
          <h2 className="text-xl font-bold text-white mt-2">{selectedFighter?.name}</h2>
          <p className="text-gray-300 text-sm">{selectedFighter?.nickname}</p>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-2 mb-6">
        <div className="bg-green-500/20 rounded-xl p-3 text-center cartoon-border">
          <div className="text-2xl font-bold text-green-400">{player.statistics.wins}</div>
          <div className="text-xs text-gray-300">Wins</div>
        </div>
        <div className="bg-red-500/20 rounded-xl p-3 text-center cartoon-border">
          <div className="text-2xl font-bold text-red-400">{player.statistics.losses}</div>
          <div className="text-xs text-gray-300">Losses</div>
        </div>
        <div className="bg-yellow-500/20 rounded-xl p-3 text-center cartoon-border">
          <div className="text-2xl font-bold text-yellow-400">
            {player.statistics.currentWinStreak}
          </div>
          <div className="text-xs text-gray-300">Streak</div>
        </div>
      </div>

      {/* Menu Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <Button
          onClick={onFight}
          className="w-full h-16 text-2xl font-bold bg-red-500 hover:bg-red-600 cartoon-border"
        >
          FIGHT!
        </Button>
        <Button
          onClick={onFighters}
          className="w-full h-12 text-lg font-bold bg-blue-500 hover:bg-blue-600 cartoon-border"
        >
          Fighters & Costumes
        </Button>
        <Button
          onClick={onUpgrades}
          className="w-full h-12 text-lg font-bold bg-purple-500 hover:bg-purple-600 cartoon-border"
        >
          Upgrades
        </Button>
      </div>

      {/* Version */}
      <div className="mt-auto pt-4 text-gray-500 text-xs">v1.0.0</div>
    </div>
  );
}

export default MainMenu;
