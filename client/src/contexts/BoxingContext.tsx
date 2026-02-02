// ============================================
// Crazy Fun Boxing - Game Context
// ============================================

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  PlayerProgress,
  FighterId,
  CostumeId,
  FighterUpgrades,
  PlayerStatistics,
  Currencies,
  DifficultyTier,
} from "@/data/boxing/types";
import { DEFAULT_FIGHTER_UPGRADES, PROGRESSION_CONFIG } from "@/data/boxing/config";
import { getStarterFighters } from "@/data/boxing/fighters";

// -------------------- Context Types --------------------

interface BoxingContextType {
  // Player state
  player: PlayerProgress | null;
  isLoaded: boolean;

  // Player creation
  createPlayer: (username: string, avatarEmoji: string) => void;

  // Fighter & costume management
  selectFighter: (fighterId: FighterId) => void;
  selectCostume: (costumeId: CostumeId) => void;
  unlockFighter: (fighterId: FighterId) => boolean;
  unlockCostume: (costumeId: CostumeId) => boolean;

  // Currency management
  addCurrency: (type: keyof Currencies, amount: number) => void;
  spendCurrency: (type: keyof Currencies, amount: number) => boolean;

  // Progression
  addXp: (amount: number) => void;
  getXpForNextLevel: () => number;
  getXpProgress: () => { current: number; required: number; percent: number };

  // Upgrades
  getUpgradeLevel: (fighterId: FighterId, upgrade: keyof FighterUpgrades) => number;
  purchaseUpgrade: (
    fighterId: FighterId,
    upgrade: keyof FighterUpgrades,
    cost: number,
    currencyType: keyof Currencies
  ) => boolean;

  // Statistics
  updateStatistics: (updates: Partial<PlayerStatistics>) => void;
  recordFightResult: (
    won: boolean,
    difficulty: DifficultyTier,
    stats: {
      knockdowns: number;
      maxCombo: number;
      damageDealt: number;
      damageReceived: number;
      usedFinisher: boolean;
      perfectWin: boolean;
    }
  ) => { xp: number; coins: number; gloves: number };

  // Achievements
  unlockAchievement: (achievementId: string) => void;
  hasAchievement: (achievementId: string) => boolean;

  // Data management
  clearData: () => void;
}

const BoxingContext = createContext<BoxingContextType | undefined>(undefined);

const STORAGE_KEY = "crazyfun_boxing";

// -------------------- Helper Functions --------------------

function calculateLevel(xp: number): number {
  // XP curve: XP(level) = 100 * level^1.5
  // Inverse: level = (xp / 100) ^ (1/1.5)
  const { xpBase, xpExponent } = PROGRESSION_CONFIG;
  return Math.max(1, Math.floor(Math.pow(xp / xpBase, 1 / xpExponent)));
}

function xpForLevel(level: number): number {
  const { xpBase, xpExponent } = PROGRESSION_CONFIG;
  return Math.floor(xpBase * Math.pow(level, xpExponent));
}

function createDefaultPlayer(username: string, avatarEmoji: string): PlayerProgress {
  const starterFighters = getStarterFighters();
  const defaultFighter = starterFighters[0]?.id ?? "rocky";

  // Initialize upgrades for all starter fighters
  const fighterUpgrades: Record<FighterId, FighterUpgrades> = {} as Record<
    FighterId,
    FighterUpgrades
  >;
  starterFighters.forEach((f) => {
    fighterUpgrades[f.id] = { ...DEFAULT_FIGHTER_UPGRADES };
  });

  return {
    id: `boxer_${Date.now()}`,
    username,
    avatarEmoji,
    createdAt: Date.now(),

    xp: 0,
    level: 1,
    currencies: {
      coins: 0,
      gloves: 0,
    },

    selectedFighter: defaultFighter,
    selectedCostume: "default",

    unlockedFighters: starterFighters.map((f) => f.id),
    unlockedCostumes: ["default"],
    fighterUpgrades,

    achievements: [],
    statistics: {
      totalFights: 0,
      wins: 0,
      losses: 0,
      knockouts: 0,
      perfectWins: 0,
      totalDamageDealt: 0,
      totalDamageReceived: 0,
      longestWinStreak: 0,
      currentWinStreak: 0,
      highestCombo: 0,
      finishersLanded: 0,
    },
  };
}

// -------------------- Provider Component --------------------

export function BoxingProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerProgress | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlayer(parsed);
      } catch (e) {
        console.error("Failed to parse boxing save data:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when player changes
  useEffect(() => {
    if (player && isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    }
  }, [player, isLoaded]);

  // -------------------- Player Creation --------------------

  const createPlayer = (username: string, avatarEmoji: string) => {
    setPlayer(createDefaultPlayer(username, avatarEmoji));
  };

  // -------------------- Fighter & Costume Management --------------------

  const selectFighter = (fighterId: FighterId) => {
    if (!player) return;
    if (!player.unlockedFighters.includes(fighterId)) return;
    setPlayer({ ...player, selectedFighter: fighterId });
  };

  const selectCostume = (costumeId: CostumeId) => {
    if (!player) return;
    if (costumeId !== "default" && !player.unlockedCostumes.includes(costumeId)) return;
    setPlayer({ ...player, selectedCostume: costumeId });
  };

  const unlockFighter = (fighterId: FighterId): boolean => {
    if (!player) return false;
    if (player.unlockedFighters.includes(fighterId)) return true;

    // Initialize upgrades for the new fighter
    const newUpgrades = {
      ...player.fighterUpgrades,
      [fighterId]: { ...DEFAULT_FIGHTER_UPGRADES },
    };

    setPlayer({
      ...player,
      unlockedFighters: [...player.unlockedFighters, fighterId],
      fighterUpgrades: newUpgrades,
    });
    return true;
  };

  const unlockCostume = (costumeId: CostumeId): boolean => {
    if (!player) return false;
    if (player.unlockedCostumes.includes(costumeId)) return true;

    setPlayer({
      ...player,
      unlockedCostumes: [...player.unlockedCostumes, costumeId],
    });
    return true;
  };

  // -------------------- Currency Management --------------------

  const addCurrency = (type: keyof Currencies, amount: number) => {
    if (!player || amount <= 0) return;
    setPlayer({
      ...player,
      currencies: {
        ...player.currencies,
        [type]: player.currencies[type] + amount,
      },
    });
  };

  const spendCurrency = (type: keyof Currencies, amount: number): boolean => {
    if (!player || amount <= 0) return false;
    if (player.currencies[type] < amount) return false;

    setPlayer({
      ...player,
      currencies: {
        ...player.currencies,
        [type]: player.currencies[type] - amount,
      },
    });
    return true;
  };

  // -------------------- Progression --------------------

  const addXp = (amount: number) => {
    if (!player || amount <= 0) return;

    const newXp = player.xp + amount;
    const newLevel = calculateLevel(newXp);

    setPlayer({
      ...player,
      xp: newXp,
      level: newLevel,
    });
  };

  const getXpForNextLevel = (): number => {
    if (!player) return 100;
    return xpForLevel(player.level + 1);
  };

  const getXpProgress = (): { current: number; required: number; percent: number } => {
    if (!player) return { current: 0, required: 100, percent: 0 };

    const currentLevelXp = xpForLevel(player.level);
    const nextLevelXp = xpForLevel(player.level + 1);
    const progress = player.xp - currentLevelXp;
    const required = nextLevelXp - currentLevelXp;

    return {
      current: progress,
      required,
      percent: Math.min(100, (progress / required) * 100),
    };
  };

  // -------------------- Upgrades --------------------

  const getUpgradeLevel = (fighterId: FighterId, upgrade: keyof FighterUpgrades): number => {
    if (!player) return 0;
    return player.fighterUpgrades[fighterId]?.[upgrade] ?? 0;
  };

  const purchaseUpgrade = (
    fighterId: FighterId,
    upgrade: keyof FighterUpgrades,
    cost: number,
    currencyType: keyof Currencies
  ): boolean => {
    if (!player) return false;
    if (player.currencies[currencyType] < cost) return false;

    const currentLevel = player.fighterUpgrades[fighterId]?.[upgrade] ?? 0;
    if (currentLevel >= 10) return false; // Max level

    setPlayer({
      ...player,
      currencies: {
        ...player.currencies,
        [currencyType]: player.currencies[currencyType] - cost,
      },
      fighterUpgrades: {
        ...player.fighterUpgrades,
        [fighterId]: {
          ...player.fighterUpgrades[fighterId],
          [upgrade]: currentLevel + 1,
        },
      },
    });
    return true;
  };

  // -------------------- Statistics --------------------

  const updateStatistics = (updates: Partial<PlayerStatistics>) => {
    if (!player) return;
    setPlayer({
      ...player,
      statistics: {
        ...player.statistics,
        ...updates,
      },
    });
  };

  const recordFightResult = (
    won: boolean,
    difficulty: DifficultyTier,
    stats: {
      knockdowns: number;
      maxCombo: number;
      damageDealt: number;
      damageReceived: number;
      usedFinisher: boolean;
      perfectWin: boolean;
    }
  ): { xp: number; coins: number; gloves: number } => {
    if (!player) return { xp: 0, coins: 0, gloves: 0 };

    const config = PROGRESSION_CONFIG;
    const diffMultiplier = config.difficultyXpMultipliers[difficulty];

    // Calculate base rewards
    let xp = won ? config.winBaseXp : config.loseBaseXp;
    let coins = won ? config.winBaseCoins : config.loseBaseCoins;
    let gloves = 0;

    // Apply difficulty multiplier
    xp = Math.floor(xp * diffMultiplier);
    coins = Math.floor(coins * diffMultiplier);

    // Bonuses (only for wins)
    if (won) {
      // Knockdown bonus
      xp += stats.knockdowns * config.knockdownBonus.xp;
      coins += stats.knockdowns * config.knockdownBonus.coins;

      // Combo bonus (per 5 hits)
      const comboSets = Math.floor(stats.maxCombo / 5);
      xp += comboSets * config.comboBonus.xpPer5Hits;
      coins += comboSets * config.comboBonus.coinsPer5Hits;

      // Perfect win bonus
      if (stats.perfectWin) {
        xp += config.perfectWinBonus.xp;
        coins += config.perfectWinBonus.coins;
        gloves += config.perfectWinBonus.gloves;
      }

      // Finisher bonus
      if (stats.usedFinisher) {
        xp += config.finisherBonus.xp;
        coins += config.finisherBonus.coins;
      }

      // Glove drop chance
      if (Math.random() < config.gloveDropChance[difficulty]) {
        gloves += 1;
        // Extra glove chance
        if (Math.random() < config.gloveExtraChance[difficulty]) {
          gloves += 1;
        }
      }
    }

    // Update statistics
    const newWinStreak = won ? player.statistics.currentWinStreak + 1 : 0;
    const newStats: PlayerStatistics = {
      ...player.statistics,
      totalFights: player.statistics.totalFights + 1,
      wins: player.statistics.wins + (won ? 1 : 0),
      losses: player.statistics.losses + (won ? 0 : 1),
      knockouts: player.statistics.knockouts + stats.knockdowns,
      perfectWins: player.statistics.perfectWins + (stats.perfectWin ? 1 : 0),
      totalDamageDealt: player.statistics.totalDamageDealt + stats.damageDealt,
      totalDamageReceived: player.statistics.totalDamageReceived + stats.damageReceived,
      currentWinStreak: newWinStreak,
      longestWinStreak: Math.max(player.statistics.longestWinStreak, newWinStreak),
      highestCombo: Math.max(player.statistics.highestCombo, stats.maxCombo),
      finishersLanded: player.statistics.finishersLanded + (stats.usedFinisher ? 1 : 0),
    };

    // Update XP and level
    const newXp = player.xp + xp;
    const newLevel = calculateLevel(newXp);

    // Update player
    setPlayer({
      ...player,
      xp: newXp,
      level: newLevel,
      currencies: {
        coins: player.currencies.coins + coins,
        gloves: player.currencies.gloves + gloves,
      },
      statistics: newStats,
    });

    return { xp, coins, gloves };
  };

  // -------------------- Achievements --------------------

  const unlockAchievement = (achievementId: string) => {
    if (!player) return;
    if (player.achievements.includes(achievementId)) return;

    setPlayer({
      ...player,
      achievements: [...player.achievements, achievementId],
    });
  };

  const hasAchievement = (achievementId: string): boolean => {
    if (!player) return false;
    return player.achievements.includes(achievementId);
  };

  // -------------------- Data Management --------------------

  const clearData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPlayer(null);
  };

  // -------------------- Provider --------------------

  return (
    <BoxingContext.Provider
      value={{
        player,
        isLoaded,
        createPlayer,
        selectFighter,
        selectCostume,
        unlockFighter,
        unlockCostume,
        addCurrency,
        spendCurrency,
        addXp,
        getXpForNextLevel,
        getXpProgress,
        getUpgradeLevel,
        purchaseUpgrade,
        updateStatistics,
        recordFightResult,
        unlockAchievement,
        hasAchievement,
        clearData,
      }}
    >
      {children}
    </BoxingContext.Provider>
  );
}

// -------------------- Hook --------------------

export function useBoxing() {
  const context = useContext(BoxingContext);
  if (!context) {
    throw new Error("useBoxing must be used within BoxingProvider");
  }
  return context;
}
