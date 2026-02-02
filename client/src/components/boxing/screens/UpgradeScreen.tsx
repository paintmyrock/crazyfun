// ============================================
// Crazy Fun Boxing - Upgrade Screen
// ============================================

import { useBoxing } from "@/contexts/BoxingContext";
import { Button } from "@/components/ui/button";
import { UPGRADE_DEFINITIONS } from "@/data/boxing/config";
import { FighterUpgrades } from "@/data/boxing/types";
import { getFighterById } from "@/data/boxing/fighters";

interface UpgradeScreenProps {
  onBack: () => void;
}

export function UpgradeScreen({ onBack }: UpgradeScreenProps) {
  const { player, getUpgradeLevel, purchaseUpgrade } = useBoxing();

  if (!player) return null;

  const selectedFighter = getFighterById(player.selectedFighter);
  const upgrades = Object.values(UPGRADE_DEFINITIONS);

  const calculateUpgradeCost = (
    upgrade: (typeof UPGRADE_DEFINITIONS)[keyof typeof UPGRADE_DEFINITIONS],
    currentLevel: number
  ): number => {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
  };

  const handleUpgrade = (upgradeId: keyof FighterUpgrades) => {
    const upgrade = UPGRADE_DEFINITIONS[upgradeId];
    const currentLevel = getUpgradeLevel(player.selectedFighter, upgradeId);
    const cost = calculateUpgradeCost(upgrade, currentLevel);

    if (currentLevel < upgrade.maxLevel) {
      purchaseUpgrade(player.selectedFighter, upgradeId, cost, upgrade.currencyType);
    }
  };

  const canAfford = (
    upgrade: (typeof UPGRADE_DEFINITIONS)[keyof typeof UPGRADE_DEFINITIONS],
    currentLevel: number
  ): boolean => {
    const cost = calculateUpgradeCost(upgrade, currentLevel);
    if (upgrade.currencyType === "coins") {
      return player.currencies.coins >= cost;
    }
    return player.currencies.gloves >= cost;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-900 to-gray-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button onClick={onBack} variant="outline" className="cartoon-border">
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white">Upgrades</h1>
        <div className="w-16" />
      </div>

      {/* Currency Display */}
      <div className="flex justify-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-yellow-500/20 rounded-xl px-4 py-2 cartoon-border">
          <span className="text-2xl">🪙</span>
          <span className="text-white font-bold">{player.currencies.coins}</span>
        </div>
        <div className="flex items-center gap-2 bg-red-500/20 rounded-xl px-4 py-2 cartoon-border">
          <span className="text-2xl">🥊</span>
          <span className="text-white font-bold">{player.currencies.gloves}</span>
        </div>
      </div>

      {/* Selected Fighter */}
      <div className="bg-black/30 rounded-xl p-4 mb-4 cartoon-border">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{selectedFighter?.emoji}</span>
          <div>
            <h2 className="text-white font-bold">{selectedFighter?.name}</h2>
            <p className="text-gray-400 text-sm">Upgrading this fighter</p>
          </div>
        </div>
      </div>

      {/* Upgrade List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {upgrades.map((upgrade) => {
          const currentLevel = getUpgradeLevel(player.selectedFighter, upgrade.id);
          const cost = calculateUpgradeCost(upgrade, currentLevel);
          const isMaxed = currentLevel >= upgrade.maxLevel;
          const affordable = canAfford(upgrade, currentLevel);
          const currencyIcon = upgrade.currencyType === "coins" ? "🪙" : "🥊";

          // Calculate effect display
          const currentEffect = upgrade.baseEffect + currentLevel * upgrade.effectPerLevel;
          const nextEffect = upgrade.baseEffect + (currentLevel + 1) * upgrade.effectPerLevel;

          return (
            <div
              key={upgrade.id}
              className={`p-4 rounded-xl cartoon-border ${
                isMaxed ? "bg-green-900/30" : "bg-black/30"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-white font-bold">{upgrade.name}</h3>
                  <p className="text-gray-400 text-xs">{upgrade.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-yellow-400">
                    Lv. {currentLevel} / {upgrade.maxLevel}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-700 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${(currentLevel / upgrade.maxLevel) * 100}%` }}
                />
              </div>

              {/* Effect preview */}
              <div className="flex justify-between items-center mb-3 text-xs">
                <span className="text-gray-400">
                  Current: {upgrade.id === "comboWindow" ? `${currentEffect}ms` : `${(currentEffect * 100).toFixed(0)}%`}
                </span>
                {!isMaxed && (
                  <span className="text-green-400">
                    Next: {upgrade.id === "comboWindow" ? `${nextEffect}ms` : `${(nextEffect * 100).toFixed(0)}%`}
                  </span>
                )}
              </div>

              {/* Upgrade button */}
              {!isMaxed && (
                <Button
                  onClick={() => handleUpgrade(upgrade.id)}
                  disabled={!affordable}
                  className={`w-full cartoon-border ${
                    affordable
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                >
                  Upgrade ({cost} {currencyIcon})
                </Button>
              )}

              {isMaxed && (
                <div className="text-center text-green-400 font-bold py-2">
                  MAXED OUT!
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-500/20 rounded-xl text-center">
        <p className="text-blue-300 text-xs">
          Tip: Upgrades apply to each fighter individually. Choose wisely!
        </p>
      </div>
    </div>
  );
}

export default UpgradeScreen;
