// ============================================
// Crazy Fun Boxing - Fighter Selection Screen
// ============================================

import { useState } from "react";
import { useBoxing } from "@/contexts/BoxingContext";
import { Button } from "@/components/ui/button";
import { FIGHTERS, isFighterUnlocked, canUnlockFighter } from "@/data/boxing/fighters";
import { COSTUMES, isCostumeUnlocked, checkCostumeUnlockRequirement } from "@/data/boxing/costumes";
import { FighterId, CostumeId } from "@/data/boxing/types";

interface FighterSelectProps {
  onBack: () => void;
}

export function FighterSelect({ onBack }: FighterSelectProps) {
  const {
    player,
    selectFighter,
    selectCostume,
    unlockFighter,
    spendCurrency,
  } = useBoxing();

  const [selectedTab, setSelectedTab] = useState<"fighters" | "costumes">("fighters");

  if (!player) return null;

  const handleFighterSelect = (fighterId: FighterId) => {
    if (isFighterUnlocked(fighterId, player.unlockedFighters)) {
      selectFighter(fighterId);
    }
  };

  const handleFighterUnlock = (fighterId: FighterId) => {
    const fighter = FIGHTERS.find((f) => f.id === fighterId);
    if (!fighter) return;

    const canUnlock = canUnlockFighter(fighterId, player.level, player.currencies.gloves);
    if (canUnlock.canUnlock) {
      if (spendCurrency("gloves", fighter.unlockCost)) {
        unlockFighter(fighterId);
      }
    }
  };

  const handleCostumeSelect = (costumeId: CostumeId) => {
    if (isCostumeUnlocked(costumeId, player.unlockedCostumes)) {
      selectCostume(costumeId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button onClick={onBack} variant="outline" className="cartoon-border">
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white">Select</h1>
        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => setSelectedTab("fighters")}
          className={`flex-1 cartoon-border ${
            selectedTab === "fighters"
              ? "bg-blue-500"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Fighters
        </Button>
        <Button
          onClick={() => setSelectedTab("costumes")}
          className={`flex-1 cartoon-border ${
            selectedTab === "costumes"
              ? "bg-purple-500"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Costumes
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedTab === "fighters" ? (
          <div className="grid grid-cols-2 gap-3">
            {FIGHTERS.map((fighter) => {
              const isUnlocked = isFighterUnlocked(fighter.id, player.unlockedFighters);
              const isSelected = player.selectedFighter === fighter.id;
              const unlockStatus = canUnlockFighter(
                fighter.id,
                player.level,
                player.currencies.gloves
              );

              return (
                <div
                  key={fighter.id}
                  onClick={() => isUnlocked && handleFighterSelect(fighter.id)}
                  className={`p-4 rounded-xl cartoon-border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-500 ring-4 ring-yellow-400"
                      : isUnlocked
                        ? "bg-gray-800 hover:bg-gray-700"
                        : "bg-gray-900 opacity-60"
                  }`}
                >
                  <div className="text-center">
                    <span className="text-5xl">{fighter.emoji}</span>
                    <h3 className="text-white font-bold mt-2">{fighter.name}</h3>
                    <p className="text-gray-400 text-xs">{fighter.nickname}</p>

                    {!isUnlocked && (
                      <div className="mt-2">
                        {unlockStatus.canUnlock ? (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFighterUnlock(fighter.id);
                            }}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-xs"
                          >
                            Unlock ({fighter.unlockCost} 🥊)
                          </Button>
                        ) : (
                          <p className="text-red-400 text-xs">{unlockStatus.reason}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stats preview */}
                  {isUnlocked && (
                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">HP</span>
                        <span className="text-white">{fighter.stats.maxHealth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Power</span>
                        <span className="text-white">{fighter.stats.power.toFixed(1)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Speed</span>
                        <span className="text-white">{fighter.stats.speed.toFixed(1)}x</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {COSTUMES.map((costume) => {
              const isUnlocked = isCostumeUnlocked(costume.id, player.unlockedCostumes);
              const isSelected = player.selectedCostume === costume.id;
              const unlockStatus = checkCostumeUnlockRequirement(costume, player);

              return (
                <div
                  key={costume.id}
                  onClick={() => isUnlocked && handleCostumeSelect(costume.id)}
                  className={`p-4 rounded-xl cartoon-border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-purple-500 ring-4 ring-yellow-400"
                      : isUnlocked
                        ? "bg-gray-800 hover:bg-gray-700"
                        : "bg-gray-900 opacity-60"
                  }`}
                >
                  <div className="text-center">
                    <span className="text-5xl">{costume.emoji}</span>
                    <h3 className="text-white font-bold mt-2">{costume.name}</h3>
                    <p className="text-gray-400 text-xs capitalize">{costume.rarity}</p>

                    {!isUnlocked && (
                      <div className="mt-2">
                        {unlockStatus.reasons.length > 0 ? (
                          <p className="text-red-400 text-xs">{unlockStatus.reasons[0]}</p>
                        ) : (
                          <p className="text-green-400 text-xs">Ready to unlock!</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Fighter Info */}
      <div className="mt-4 p-4 bg-black/30 rounded-xl cartoon-border">
        <div className="flex items-center gap-3">
          <span className="text-4xl">
            {FIGHTERS.find((f) => f.id === player.selectedFighter)?.emoji}
          </span>
          <div>
            <h3 className="text-white font-bold">
              {FIGHTERS.find((f) => f.id === player.selectedFighter)?.name}
            </h3>
            <p className="text-gray-400 text-sm">
              Costume: {COSTUMES.find((c) => c.id === player.selectedCostume)?.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FighterSelect;
