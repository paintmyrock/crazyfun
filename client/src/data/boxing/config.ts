// ============================================
// Crazy Fun Boxing - Game Configuration
// All tunable parameters in one place
// ============================================

import {
  PunchData,
  PunchType,
  AIBehavior,
  DifficultyTier,
  UpgradeDefinition,
  FighterUpgrades,
  FinisherGesture,
  FinisherGestureType,
} from "./types";

// -------------------- Input Configuration --------------------

export const INPUT_CONFIG = {
  // Gesture detection thresholds
  tapMaxDuration: 200, // Max ms for a tap (vs hold)
  doubleTapWindow: 300, // Max ms between taps for double-tap
  holdMinDuration: 300, // Min ms to register as hold
  swipeMinDistance: 50, // Min pixels to register as swipe
  swipeMaxDuration: 400, // Max ms for swipe gesture
  swipeMinVelocity: 0.3, // Min pixels/ms for swipe

  // Screen zones (normalized 0-1)
  screenCenterX: 0.5, // Dividing line for left/right

  // Charge mechanics
  minChargeTime: 300, // Min ms for minimum charge
  maxChargeTime: 1500, // Ms for full charge
  chargeDecayRate: 0.5, // How fast charge decays if held too long

  // Input buffer
  inputBufferSize: 3, // Max queued actions
  inputBufferWindow: 200, // How long actions stay in buffer (ms)

  // Multi-touch
  twoFingerHoldMinDuration: 150, // Min ms for turtle defense
};

// -------------------- Overheat Configuration --------------------

export const OVERHEAT_CONFIG = {
  maxOverheat: 100,
  warningThreshold: 80, // Yellow zone starts
  criticalThreshold: 95, // Red zone, penalties apply

  recoveryRate: 15, // Points per second when not attacking
  recoveryDelayMs: 800, // Time after last action before recovery starts

  // Penalties when overheated
  penaltyDamageMultiplier: 0.7, // 30% less damage
  penaltySpeedMultiplier: 0.6, // 40% slower actions
  penaltyStaminaCostMultiplier: 1.5, // 50% more stamina cost
};

// -------------------- Stun Configuration --------------------

export const STUN_CONFIG = {
  maxStunMeter: 100,
  stunThreshold: 100, // Triggers stun when reached
  stunDuration: 2000, // Ms of stun

  decayRate: 10, // Points per second when not being hit
  decayDelayMs: 1500, // Ms after last hit before decay

  blockStunReduction: 0.3, // 70% less stun when blocking
  counterHitMultiplier: 1.5, // 50% more stun on counter hit
};

// -------------------- Defense Configuration --------------------

export const DEFENSE_CONFIG = {
  // Block
  blockDamageReduction: 0.2, // Take 20% damage when blocking
  blockStaminaDrain: 8, // Per second while blocking
  perfectBlockWindow: 100, // Ms for perfect block timing
  perfectBlockStunBonus: 25, // Stun dealt back on perfect block

  // Turtle defense
  turtleDamageReduction: 0.05, // Take 5% damage
  turtleStaminaDrain: 15, // Per second

  // Dodge
  dodgeInvincibilityFrames: 200, // Ms of invincibility
  dodgeDuration: 350, // Total dodge animation time
  dodgeCooldown: 600, // Ms before can dodge again
};

// -------------------- Damage Configuration --------------------

export const DAMAGE_CONFIG = {
  attackScaling: 50, // baseDamage * (attackerPower / 50)
  defenseScaling: 100, // * (100 - defense * 0.5) / 100
  comboScaling: 0.1, // +10% per combo hit
  comboMax: 1.5, // Max 50% bonus from combo
  critMultiplier: 1.5, // 50% more on crit
  minimumDamage: 1, // Always deal at least 1
  chargeMultiplierMax: 2.5, // Max charge damage bonus
};

// -------------------- Punch Data --------------------

export const PUNCH_DATA: Record<PunchType, PunchData> = {
  jab: {
    type: "jab",
    baseDamage: 8,
    staminaCost: 5,
    stunDamage: 5,
    windupMs: 100,
    recoveryMs: 150,
    canCombo: true,
  },
  hook: {
    type: "hook",
    baseDamage: 15,
    staminaCost: 12,
    stunDamage: 10,
    windupMs: 200,
    recoveryMs: 250,
    canCombo: true,
  },
  uppercut: {
    type: "uppercut",
    baseDamage: 20,
    staminaCost: 18,
    stunDamage: 15,
    windupMs: 300,
    recoveryMs: 350,
    canCombo: false,
  },
  body: {
    type: "body",
    baseDamage: 10,
    staminaCost: 8,
    stunDamage: 8,
    windupMs: 150,
    recoveryMs: 200,
    canCombo: true,
  },
  power: {
    type: "power",
    baseDamage: 15, // Multiplied by charge level
    staminaCost: 25,
    stunDamage: 20,
    windupMs: 350,
    recoveryMs: 400,
    canCombo: false,
  },
  combo: {
    type: "combo",
    baseDamage: 25,
    staminaCost: 20,
    stunDamage: 15,
    windupMs: 250,
    recoveryMs: 300,
    canCombo: false,
  },
};

// -------------------- Finisher Configuration --------------------

export const FINISHER_CONFIG = {
  hpThreshold: 0.2, // 20% HP triggers window
  stunTrigger: true, // Also trigger on stun
  windowDuration: 5000, // Ms window stays open
  toleranceMultiplier: 1.2, // 20% more forgiving
  successDamageBonus: 1.5, // 50% more damage on success
  failureRecovery: 0.1, // Opponent recovers 10% HP on failure
};

export const FINISHER_GESTURES: Record<FinisherGestureType, FinisherGesture> = {
  lightning_bolt: {
    type: "lightning_bolt",
    name: "Thunder Strike",
    description: "Draw a lightning bolt (zig-zag down)",
    emoji: "⚡",
    baseDamage: 50,
    timeLimit: 2000,
  },
  circle: {
    type: "circle",
    name: "Cyclone Punch",
    description: "Draw a circle",
    emoji: "🌀",
    baseDamage: 40,
    timeLimit: 1500,
  },
  rapid_alternating: {
    type: "rapid_alternating",
    name: "Fury Combo",
    description: "Tap left-right rapidly (8 times)",
    emoji: "👊",
    baseDamage: 55,
    timeLimit: 2500,
  },
  swipe_sequence: {
    type: "swipe_sequence",
    name: "Hurricane Hook",
    description: "Swipe left-right-up",
    emoji: "🌪️",
    baseDamage: 65,
    timeLimit: 2000,
  },
};

// -------------------- Difficulty Configurations --------------------

export const DIFFICULTY_CONFIGS: Record<DifficultyTier, AIBehavior> = {
  rookie: {
    tier: "rookie",
    reactionTimeMin: 400,
    reactionTimeMax: 700,
    blockProbability: 0.25,
    dodgeProbability: 0.1,
    attackFrequency: 3, // Attacks per 10 seconds
    comboChance: 0.1,
    heavyPunchChance: 0.05,
    damageMultiplier: 0.7,
    healthMultiplier: 0.8,
    adaptationRate: 0,
  },
  amateur: {
    tier: "amateur",
    reactionTimeMin: 300,
    reactionTimeMax: 550,
    blockProbability: 0.4,
    dodgeProbability: 0.2,
    attackFrequency: 5,
    comboChance: 0.25,
    heavyPunchChance: 0.1,
    damageMultiplier: 0.85,
    healthMultiplier: 1.0,
    adaptationRate: 0.1,
  },
  pro: {
    tier: "pro",
    reactionTimeMin: 200,
    reactionTimeMax: 400,
    blockProbability: 0.55,
    dodgeProbability: 0.35,
    attackFrequency: 7,
    comboChance: 0.45,
    heavyPunchChance: 0.2,
    damageMultiplier: 1.0,
    healthMultiplier: 1.2,
    adaptationRate: 0.25,
  },
  champion: {
    tier: "champion",
    reactionTimeMin: 150,
    reactionTimeMax: 300,
    blockProbability: 0.7,
    dodgeProbability: 0.5,
    attackFrequency: 9,
    comboChance: 0.6,
    heavyPunchChance: 0.3,
    damageMultiplier: 1.15,
    healthMultiplier: 1.4,
    adaptationRate: 0.4,
  },
  legend: {
    tier: "legend",
    reactionTimeMin: 100,
    reactionTimeMax: 220,
    blockProbability: 0.85,
    dodgeProbability: 0.65,
    attackFrequency: 11,
    comboChance: 0.75,
    heavyPunchChance: 0.4,
    damageMultiplier: 1.3,
    healthMultiplier: 1.6,
    adaptationRate: 0.6,
  },
};

// -------------------- Upgrade Definitions --------------------

export const UPGRADE_DEFINITIONS: Record<keyof FighterUpgrades, UpgradeDefinition> = {
  punchSpeed: {
    id: "punchSpeed",
    name: "Quick Hands",
    description: "+5% punch speed per level",
    maxLevel: 10,
    baseEffect: 1.0,
    effectPerLevel: 0.05,
    baseCost: 100,
    costMultiplier: 1.3,
    currencyType: "coins",
  },
  staminaCapacity: {
    id: "staminaCapacity",
    name: "Iron Lungs",
    description: "+8% max stamina per level",
    maxLevel: 10,
    baseEffect: 1.0,
    effectPerLevel: 0.08,
    baseCost: 120,
    costMultiplier: 1.35,
    currencyType: "coins",
  },
  overheatRecovery: {
    id: "overheatRecovery",
    name: "Cool Down",
    description: "+10% overheat recovery per level",
    maxLevel: 10,
    baseEffect: 1.0,
    effectPerLevel: 0.1,
    baseCost: 150,
    costMultiplier: 1.4,
    currencyType: "coins",
  },
  comboWindow: {
    id: "comboWindow",
    name: "Rhythm Master",
    description: "+50ms combo window per level",
    maxLevel: 10,
    baseEffect: 300, // Base 300ms window
    effectPerLevel: 50,
    baseCost: 200,
    costMultiplier: 1.25,
    currencyType: "coins",
  },
  specialChargeRate: {
    id: "specialChargeRate",
    name: "Power Surge",
    description: "+8% special charge rate per level",
    maxLevel: 10,
    baseEffect: 1.0,
    effectPerLevel: 0.08,
    baseCost: 5, // Uses gloves
    costMultiplier: 1.5,
    currencyType: "gloves",
  },
};

// -------------------- Match Configuration --------------------

export const MATCH_CONFIG = {
  roundDurationMs: 90000, // 90 seconds
  maxRounds: 3,
  countdownDurationMs: 3000, // 3 seconds
  koAnimationDurationMs: 2000,
  roundTransitionDurationMs: 3000,
  healthRegenBetweenRounds: 0.2, // 20% health restored
};

// -------------------- Progression Configuration --------------------

export const PROGRESSION_CONFIG = {
  // XP curve: XP(level) = 100 * level^1.5
  xpExponent: 1.5,
  xpBase: 100,

  // Base rewards
  winBaseXp: 50,
  loseBaseXp: 15,
  winBaseCoins: 100,
  loseBaseCoins: 25,

  // Difficulty multipliers for rewards
  difficultyXpMultipliers: {
    rookie: 1.0,
    amateur: 1.3,
    pro: 1.7,
    champion: 2.2,
    legend: 3.0,
  } as Record<DifficultyTier, number>,

  // Bonus rewards
  knockdownBonus: { xp: 10, coins: 20 },
  comboBonus: { xpPer5Hits: 15, coinsPer5Hits: 15 },
  perfectWinBonus: { xp: 50, coins: 100, gloves: 1 },
  finisherBonus: { xp: 25, coins: 50 },

  // Glove drop rates
  gloveDropChance: {
    rookie: 0.05,
    amateur: 0.1,
    pro: 0.15,
    champion: 1.0, // Guaranteed
    legend: 1.0,
  } as Record<DifficultyTier, number>,

  gloveExtraChance: {
    rookie: 0,
    amateur: 0,
    pro: 0,
    champion: 0.2,
    legend: 0.4,
  } as Record<DifficultyTier, number>,
};

// -------------------- Default Values --------------------

export const DEFAULT_FIGHTER_UPGRADES: FighterUpgrades = {
  punchSpeed: 0,
  staminaCapacity: 0,
  overheatRecovery: 0,
  comboWindow: 0,
  specialChargeRate: 0,
};
