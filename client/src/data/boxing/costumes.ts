// ============================================
// Crazy Fun Boxing - Costume Definitions
// ============================================

import { Costume, CostumeId, CostumeUnlockRequirement, PlayerProgress } from "./types";

export const COSTUMES: Costume[] = [
  // =====================
  // DEFAULT - Always Available
  // =====================
  {
    id: "default",
    name: "Classic",
    description: "The standard boxing outfit. Clean and professional.",
    emoji: "🥊",
    rarity: "common",
    unlockRequirement: { type: "free" },
  },

  // =====================
  // CHICKEN SUIT - First Win
  // =====================
  {
    id: "chicken",
    name: "Chicken Suit",
    description: "Bawk bawk! Prove you're no chicken in the ring!",
    emoji: "🐔",
    rarity: "rare",
    unlockRequirement: {
      type: "achievement",
      achievementId: "first_win",
    },
  },

  // =====================
  // KNIGHT ARMOR - 2500 Coins
  // =====================
  {
    id: "knight",
    name: "Knight Armor",
    description: "Chivalrous and shiny. For honor and glory!",
    emoji: "🤺",
    rarity: "epic",
    unlockRequirement: {
      type: "coins",
      amount: 2500,
    },
  },

  // =====================
  // BANANA SHORTS - 10 Wins
  // =====================
  {
    id: "banana",
    name: "Banana Shorts",
    description: "Appealing in every way. Drives opponents bananas!",
    emoji: "🍌",
    rarity: "rare",
    unlockRequirement: {
      type: "wins",
      amount: 10,
    },
  },

  // =====================
  // ASTRONAUT - Level 15
  // =====================
  {
    id: "astronaut",
    name: "Space Suit",
    description: "One small step for boxing, one giant leap for punchkind.",
    emoji: "👨‍🚀",
    rarity: "epic",
    unlockRequirement: {
      type: "level",
      amount: 15,
    },
  },

  // =====================
  // DISCO - 10-Hit Combo Achievement
  // =====================
  {
    id: "disco",
    name: "Disco Fever",
    description: "Boogie your way to victory! Staying alive, staying alive!",
    emoji: "🪩",
    rarity: "rare",
    unlockRequirement: {
      type: "achievement",
      achievementId: "combo_10",
    },
  },

  // =====================
  // SUPERHERO - 50 Wins + 100 Gloves
  // =====================
  {
    id: "superhero",
    name: "Super Boxer",
    description: "With great power comes great knockouts!",
    emoji: "🦸",
    rarity: "legendary",
    unlockRequirement: {
      type: "combined",
      requirements: [
        { type: "wins", amount: 50 },
        { type: "gloves", amount: 100 },
      ],
    },
  },
];

// -------------------- Helper Functions --------------------

export function getCostumeById(id: CostumeId): Costume | undefined {
  return COSTUMES.find((c) => c.id === id);
}

export function getCostumesByRarity(rarity: Costume["rarity"]): Costume[] {
  return COSTUMES.filter((c) => c.rarity === rarity);
}

function checkSingleRequirement(
  requirement: CostumeUnlockRequirement,
  progress: PlayerProgress
): { met: boolean; reason?: string } {
  switch (requirement.type) {
    case "free":
      return { met: true };

    case "coins":
      const hasCoins = progress.currencies.coins >= (requirement.amount || 0);
      return {
        met: hasCoins,
        reason: hasCoins ? undefined : `Need ${requirement.amount} coins`,
      };

    case "gloves":
      const hasGloves = progress.currencies.gloves >= (requirement.amount || 0);
      return {
        met: hasGloves,
        reason: hasGloves ? undefined : `Need ${requirement.amount} gloves`,
      };

    case "wins":
      const hasWins = progress.statistics.wins >= (requirement.amount || 0);
      return {
        met: hasWins,
        reason: hasWins ? undefined : `Win ${requirement.amount} fights`,
      };

    case "level":
      const hasLevel = progress.level >= (requirement.amount || 0);
      return {
        met: hasLevel,
        reason: hasLevel ? undefined : `Reach level ${requirement.amount}`,
      };

    case "achievement":
      const hasAchievement = progress.achievements.includes(
        requirement.achievementId || ""
      );
      return {
        met: hasAchievement,
        reason: hasAchievement
          ? undefined
          : `Unlock achievement: ${requirement.achievementId}`,
      };

    default:
      return { met: false, reason: "Unknown requirement" };
  }
}

export function checkCostumeUnlockRequirement(
  costume: Costume,
  progress: PlayerProgress
): { canUnlock: boolean; reasons: string[] } {
  const requirement = costume.unlockRequirement;

  if (requirement.type === "combined" && requirement.requirements) {
    const results = requirement.requirements.map((req) =>
      checkSingleRequirement(req, progress)
    );
    const allMet = results.every((r) => r.met);
    const reasons = results.filter((r) => !r.met).map((r) => r.reason!);
    return { canUnlock: allMet, reasons };
  }

  const result = checkSingleRequirement(requirement, progress);
  return {
    canUnlock: result.met,
    reasons: result.reason ? [result.reason] : [],
  };
}

export function isCostumeUnlocked(
  costumeId: CostumeId,
  unlockedCostumes: CostumeId[]
): boolean {
  // Default costume is always unlocked
  if (costumeId === "default") return true;
  return unlockedCostumes.includes(costumeId);
}

export function getUnlockProgress(
  costume: Costume,
  progress: PlayerProgress
): { current: number; required: number; percent: number } | null {
  const requirement = costume.unlockRequirement;

  switch (requirement.type) {
    case "coins":
      return {
        current: progress.currencies.coins,
        required: requirement.amount || 0,
        percent: Math.min(
          100,
          (progress.currencies.coins / (requirement.amount || 1)) * 100
        ),
      };

    case "gloves":
      return {
        current: progress.currencies.gloves,
        required: requirement.amount || 0,
        percent: Math.min(
          100,
          (progress.currencies.gloves / (requirement.amount || 1)) * 100
        ),
      };

    case "wins":
      return {
        current: progress.statistics.wins,
        required: requirement.amount || 0,
        percent: Math.min(
          100,
          (progress.statistics.wins / (requirement.amount || 1)) * 100
        ),
      };

    case "level":
      return {
        current: progress.level,
        required: requirement.amount || 0,
        percent: Math.min(
          100,
          (progress.level / (requirement.amount || 1)) * 100
        ),
      };

    default:
      return null;
  }
}

// Get rarity color for UI
export function getRarityColor(rarity: Costume["rarity"]): string {
  switch (rarity) {
    case "common":
      return "text-gray-500";
    case "rare":
      return "text-blue-500";
    case "epic":
      return "text-purple-500";
    case "legendary":
      return "text-yellow-500";
  }
}

// Get rarity background for cards
export function getRarityBackground(rarity: Costume["rarity"]): string {
  switch (rarity) {
    case "common":
      return "bg-gray-100";
    case "rare":
      return "bg-blue-100";
    case "epic":
      return "bg-purple-100";
    case "legendary":
      return "bg-gradient-to-br from-yellow-100 to-orange-100";
  }
}
