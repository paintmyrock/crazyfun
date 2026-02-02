// ============================================
// Crazy Fun Boxing - Fighter Definitions
// ============================================

import { Fighter, FighterId } from "./types";

export const FIGHTERS: Fighter[] = [
  // =====================
  // ROCKY - The Balanced Brawler (Starter)
  // =====================
  {
    id: "rocky",
    name: "Rocky Rhodes",
    nickname: "The Balanced Brawler",
    description:
      "A well-rounded fighter with no weaknesses. Perfect for beginners learning the ropes.",
    emoji: "🥊",
    stats: {
      maxHealth: 100,
      power: 1.0,
      speed: 1.0,
      defense: 1.0,
      stamina: 100,
      staminaRegen: 10,
      critChance: 0.1,
    },
    trait: {
      id: "adaptable",
      name: "Adaptable",
      description: "Gains +5% to all stats after the first round",
      type: "stat_bonus",
      value: 0.05,
    },
    unlockCost: 0,
    unlockLevel: 0,
  },

  // =====================
  // FLASH - Lightning Fists (Starter)
  // =====================
  {
    id: "flash",
    name: "Flash Fernandez",
    nickname: "Lightning Fists",
    description:
      "Blazing fast but fragile. Overwhelm opponents before they can react!",
    emoji: "⚡",
    stats: {
      maxHealth: 75,
      power: 0.8,
      speed: 1.4,
      defense: 0.6,
      stamina: 120,
      staminaRegen: 12,
      critChance: 0.15,
    },
    trait: {
      id: "combo_master",
      name: "Combo Master",
      description: "Combos extend by 2 extra hits before ending",
      type: "combo_extender",
      value: 2,
    },
    unlockCost: 0,
    unlockLevel: 0,
  },

  // =====================
  // BRUNO - The Heavyweight (Starter)
  // =====================
  {
    id: "bruno",
    name: "Bruno 'Bruiser' Bianchi",
    nickname: "The Heavyweight",
    description:
      "Slow but devastating. One good hit can turn any fight around.",
    emoji: "💪",
    stats: {
      maxHealth: 130,
      power: 1.5,
      speed: 0.7,
      defense: 1.4,
      stamina: 80,
      staminaRegen: 8,
      critChance: 0.05,
    },
    trait: {
      id: "heavy_hitter",
      name: "Heavy Hitter",
      description: "15% crit chance on all punches. Crits deal 2x damage",
      type: "critical_chance",
      value: 0.15,
    },
    unlockCost: 0,
    unlockLevel: 0,
  },

  // =====================
  // PHOENIX - The Comeback King (Unlockable)
  // =====================
  {
    id: "phoenix",
    name: "Phoenix Martinez",
    nickname: "The Comeback King",
    description:
      "Gets stronger as health drops. Turns desperation into devastation!",
    emoji: "🔥",
    stats: {
      maxHealth: 90,
      power: 0.9,
      speed: 1.1,
      defense: 0.8,
      stamina: 100,
      staminaRegen: 10,
      critChance: 0.1,
    },
    trait: {
      id: "fury_mode",
      name: "Rising Phoenix",
      description:
        "Below 30% health: +30% damage, +20% speed, +50% special charge",
      type: "fury_mode",
      value: 0.3, // 30% damage boost
      threshold: 30, // Activates at 30% HP
    },
    unlockCost: 50, // 50 gloves
    unlockLevel: 10,
  },
];

// -------------------- Helper Functions --------------------

export function getFighterById(id: FighterId): Fighter | undefined {
  return FIGHTERS.find((f) => f.id === id);
}

export function getStarterFighters(): Fighter[] {
  return FIGHTERS.filter((f) => f.unlockCost === 0);
}

export function getUnlockableFighters(): Fighter[] {
  return FIGHTERS.filter((f) => f.unlockCost > 0);
}

export function isFighterUnlocked(
  fighterId: FighterId,
  unlockedFighters: FighterId[]
): boolean {
  const fighter = getFighterById(fighterId);
  if (!fighter) return false;
  if (fighter.unlockCost === 0) return true;
  return unlockedFighters.includes(fighterId);
}

export function canUnlockFighter(
  fighterId: FighterId,
  playerLevel: number,
  gloves: number
): { canUnlock: boolean; reason?: string } {
  const fighter = getFighterById(fighterId);
  if (!fighter) return { canUnlock: false, reason: "Fighter not found" };
  if (fighter.unlockCost === 0) return { canUnlock: true };

  if (playerLevel < fighter.unlockLevel) {
    return {
      canUnlock: false,
      reason: `Reach level ${fighter.unlockLevel}`,
    };
  }

  if (gloves < fighter.unlockCost) {
    return {
      canUnlock: false,
      reason: `Need ${fighter.unlockCost} gloves`,
    };
  }

  return { canUnlock: true };
}

// Get effective stats with trait applied
export function getEffectiveFighterStats(
  fighter: Fighter,
  currentHealth: number,
  round: number
): typeof fighter.stats {
  const stats = { ...fighter.stats };

  switch (fighter.trait.type) {
    case "stat_bonus":
      // Rocky's adaptable trait - bonus after round 1
      if (round > 1) {
        const bonus = 1 + fighter.trait.value;
        stats.power *= bonus;
        stats.speed *= bonus;
        stats.defense *= bonus;
        stats.stamina *= bonus;
      }
      break;

    case "critical_chance":
      // Bruno's heavy hitter trait
      stats.critChance = fighter.trait.value;
      break;

    case "fury_mode":
      // Phoenix's fury mode - activates at low health
      const healthPercent = (currentHealth / stats.maxHealth) * 100;
      if (healthPercent <= (fighter.trait.threshold || 30)) {
        stats.power *= 1 + fighter.trait.value; // +30% damage
        stats.speed *= 1.2; // +20% speed
        // Special charge bonus handled separately
      }
      break;

    // combo_extender doesn't modify base stats
  }

  return stats;
}

// Get combo extension from trait
export function getComboExtension(fighter: Fighter): number {
  if (fighter.trait.type === "combo_extender") {
    return fighter.trait.value;
  }
  return 0;
}

// Check if fury mode is active
export function isFuryModeActive(
  fighter: Fighter,
  currentHealth: number
): boolean {
  if (fighter.trait.type !== "fury_mode") return false;
  const healthPercent = (currentHealth / fighter.stats.maxHealth) * 100;
  return healthPercent <= (fighter.trait.threshold || 30);
}
