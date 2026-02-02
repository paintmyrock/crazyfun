// ============================================
// Crazy Fun Boxing - Combat Engine
// Core damage, overheat, and stun mechanics
// ============================================

import {
  FighterRuntimeState,
  PunchType,
  ActionType,
  HitEffect,
  DamageNumber,
  FighterStats,
} from "@/data/boxing/types";
import {
  PUNCH_DATA,
  DAMAGE_CONFIG,
  OVERHEAT_CONFIG,
  STUN_CONFIG,
  DEFENSE_CONFIG,
} from "@/data/boxing/config";

// -------------------- Types --------------------

export interface DamageResult {
  damage: number;
  stunDamage: number;
  isCrit: boolean;
  isBlocked: boolean;
  isPerfectBlock: boolean;
  hitEffect: HitEffect;
  damageNumber: DamageNumber;
}

export interface CombatUpdate {
  attackerState: Partial<FighterRuntimeState>;
  defenderState: Partial<FighterRuntimeState>;
  effects: HitEffect[];
  damageNumbers: DamageNumber[];
}

// -------------------- Utility Functions --------------------

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// -------------------- Damage Calculation --------------------

/**
 * Calculate damage for an attack
 */
export function calculateDamage(
  punchType: PunchType,
  attackerStats: FighterStats,
  defenderStats: FighterStats,
  options: {
    chargeLevel?: number;
    comboCount?: number;
    isOverheated?: boolean;
    isBlocking?: boolean;
    isTurtleDefense?: boolean;
    isPerfectBlock?: boolean;
    isCounterHit?: boolean;
  }
): DamageResult {
  const punchData = PUNCH_DATA[punchType];
  const now = Date.now();

  // Base damage calculation
  let damage = punchData.baseDamage * (attackerStats.power / DAMAGE_CONFIG.attackScaling);

  // Charge multiplier for power punches
  if (options.chargeLevel !== undefined && options.chargeLevel > 0) {
    const chargeMultiplier = 1 + options.chargeLevel * (DAMAGE_CONFIG.chargeMultiplierMax - 1);
    damage *= chargeMultiplier;
  }

  // Combo multiplier
  if (options.comboCount && options.comboCount > 0) {
    const comboMultiplier = Math.min(
      DAMAGE_CONFIG.comboMax,
      1 + options.comboCount * DAMAGE_CONFIG.comboScaling
    );
    damage *= comboMultiplier;
  }

  // Overheat penalty
  if (options.isOverheated) {
    damage *= OVERHEAT_CONFIG.penaltyDamageMultiplier;
  }

  // Critical hit check
  const isCrit = Math.random() < attackerStats.critChance;
  if (isCrit) {
    damage *= DAMAGE_CONFIG.critMultiplier;
  }

  // Defense reduction
  const defenseReduction =
    (100 - defenderStats.defense * 0.5) / DAMAGE_CONFIG.defenseScaling;
  damage *= defenseReduction;

  // Block reduction
  let isBlocked = false;
  let isPerfectBlock = false;

  if (options.isPerfectBlock) {
    damage = 0;
    isBlocked = true;
    isPerfectBlock = true;
  } else if (options.isTurtleDefense) {
    damage *= DEFENSE_CONFIG.turtleDamageReduction;
    isBlocked = true;
  } else if (options.isBlocking) {
    damage *= DEFENSE_CONFIG.blockDamageReduction;
    isBlocked = true;
  }

  // Ensure minimum damage (unless blocked)
  if (!isBlocked) {
    damage = Math.max(DAMAGE_CONFIG.minimumDamage, Math.floor(damage));
  } else {
    damage = Math.floor(damage);
  }

  // Stun damage calculation
  let stunDamage = punchData.stunDamage;

  if (options.isCounterHit) {
    stunDamage *= STUN_CONFIG.counterHitMultiplier;
  }

  if (isBlocked) {
    stunDamage *= STUN_CONFIG.blockStunReduction;
  }

  stunDamage = Math.floor(stunDamage);

  // Create hit effect
  const effectType = isPerfectBlock
    ? "block"
    : isBlocked
      ? "block"
      : isCrit
        ? "crit"
        : "impact";

  const hitEffect: HitEffect = {
    id: generateId(),
    x: 0, // Will be set by caller based on defender position
    y: 0,
    type: effectType,
    startTime: now,
    durationMs: 300,
  };

  // Create damage number
  const damageNumber: DamageNumber = {
    id: generateId(),
    x: 0, // Will be set by caller
    y: 0,
    value: damage,
    isCrit,
    startTime: now,
  };

  return {
    damage,
    stunDamage,
    isCrit,
    isBlocked,
    isPerfectBlock,
    hitEffect,
    damageNumber,
  };
}

// -------------------- Overheat System --------------------

/**
 * Add overheat from an action
 */
export function addOverheat(
  currentOverheat: number,
  punchType: PunchType,
  isOverheated: boolean
): number {
  const punchData = PUNCH_DATA[punchType];
  let cost = punchData.staminaCost;

  // Extra cost when overheated
  if (isOverheated) {
    cost *= OVERHEAT_CONFIG.penaltyStaminaCostMultiplier;
  }

  return clamp(currentOverheat + cost, 0, OVERHEAT_CONFIG.maxOverheat);
}

/**
 * Update overheat recovery
 */
export function updateOverheatRecovery(
  currentOverheat: number,
  lastActionTime: number,
  deltaMs: number,
  recoveryMultiplier: number = 1
): { overheat: number; isOverheated: boolean } {
  const now = Date.now();

  // Check if recovery delay has passed
  if (now - lastActionTime < OVERHEAT_CONFIG.recoveryDelayMs) {
    return {
      overheat: currentOverheat,
      isOverheated: currentOverheat >= OVERHEAT_CONFIG.criticalThreshold,
    };
  }

  // Apply recovery
  const recovery = (OVERHEAT_CONFIG.recoveryRate * deltaMs * recoveryMultiplier) / 1000;
  const newOverheat = Math.max(0, currentOverheat - recovery);

  return {
    overheat: newOverheat,
    isOverheated: newOverheat >= OVERHEAT_CONFIG.criticalThreshold,
  };
}

/**
 * Get overheat status
 */
export function getOverheatStatus(overheat: number): "normal" | "warning" | "critical" {
  if (overheat >= OVERHEAT_CONFIG.criticalThreshold) return "critical";
  if (overheat >= OVERHEAT_CONFIG.warningThreshold) return "warning";
  return "normal";
}

// -------------------- Stun System --------------------

/**
 * Add stun damage to a fighter
 */
export function addStunDamage(
  currentStunMeter: number,
  stunDamage: number
): { stunMeter: number; isStunned: boolean } {
  const newStunMeter = clamp(currentStunMeter + stunDamage, 0, STUN_CONFIG.maxStunMeter);

  return {
    stunMeter: newStunMeter,
    isStunned: newStunMeter >= STUN_CONFIG.stunThreshold,
  };
}

/**
 * Update stun meter decay
 */
export function updateStunDecay(
  currentStunMeter: number,
  lastHitTime: number,
  deltaMs: number
): number {
  const now = Date.now();

  // Check if decay delay has passed
  if (now - lastHitTime < STUN_CONFIG.decayDelayMs) {
    return currentStunMeter;
  }

  // Apply decay
  const decay = (STUN_CONFIG.decayRate * deltaMs) / 1000;
  return Math.max(0, currentStunMeter - decay);
}

/**
 * Check if fighter should recover from stun
 */
export function checkStunRecovery(
  isStunned: boolean,
  stunEndTime: number
): { isStunned: boolean; stunMeter: number } {
  if (!isStunned) {
    return { isStunned: false, stunMeter: 0 };
  }

  const now = Date.now();
  if (now >= stunEndTime) {
    return { isStunned: false, stunMeter: 0 };
  }

  return { isStunned: true, stunMeter: STUN_CONFIG.maxStunMeter };
}

// -------------------- Defense System --------------------

/**
 * Check if dodge is successful (invincibility frames)
 */
export function checkDodgeInvincibility(
  isDodging: boolean,
  invincibleUntil: number
): boolean {
  if (!isDodging) return false;
  return Date.now() < invincibleUntil;
}

/**
 * Check for perfect block timing
 */
export function checkPerfectBlock(
  blockStartTime: number,
  attackLandTime: number
): boolean {
  const blockDuration = attackLandTime - blockStartTime;
  return blockDuration <= DEFENSE_CONFIG.perfectBlockWindow;
}

/**
 * Apply block stamina drain
 */
export function applyBlockDrain(
  currentOverheat: number,
  deltaMs: number,
  isTurtleDefense: boolean
): number {
  const drainRate = isTurtleDefense
    ? DEFENSE_CONFIG.turtleStaminaDrain
    : DEFENSE_CONFIG.blockStaminaDrain;

  const drain = (drainRate * deltaMs) / 1000;
  return clamp(currentOverheat + drain, 0, OVERHEAT_CONFIG.maxOverheat);
}

// -------------------- Action Execution --------------------

/**
 * Get punch type from action
 */
export function getPunchTypeFromAction(action: ActionType): PunchType | null {
  switch (action) {
    case "jab_left":
    case "jab_right":
      return "jab";
    case "combo_punch":
      return "combo";
    case "power_punch":
      return "power";
    default:
      return null;
  }
}

/**
 * Get action timing (windup + recovery)
 */
export function getActionTiming(
  action: ActionType,
  speedMultiplier: number = 1,
  isOverheated: boolean = false
): { windupMs: number; recoveryMs: number; totalMs: number } {
  const punchType = getPunchTypeFromAction(action);

  if (!punchType) {
    // Non-attack actions have different timings
    switch (action) {
      case "dodge_left":
      case "dodge_right":
        return {
          windupMs: 0,
          recoveryMs: DEFENSE_CONFIG.dodgeDuration,
          totalMs: DEFENSE_CONFIG.dodgeDuration,
        };
      case "block":
      case "turtle_defense":
        return { windupMs: 0, recoveryMs: 0, totalMs: 0 }; // Instant
      default:
        return { windupMs: 0, recoveryMs: 0, totalMs: 0 };
    }
  }

  const punchData = PUNCH_DATA[punchType];
  let windupMs = punchData.windupMs / speedMultiplier;
  let recoveryMs = punchData.recoveryMs / speedMultiplier;

  if (isOverheated) {
    windupMs /= OVERHEAT_CONFIG.penaltySpeedMultiplier;
    recoveryMs /= OVERHEAT_CONFIG.penaltySpeedMultiplier;
  }

  return {
    windupMs,
    recoveryMs,
    totalMs: windupMs + recoveryMs,
  };
}

/**
 * Check if punch can combo
 */
export function canCombo(punchType: PunchType): boolean {
  return PUNCH_DATA[punchType].canCombo;
}

/**
 * Calculate combo continuation window
 */
export function getComboWindow(
  baseWindow: number,
  comboWindowUpgrade: number
): number {
  // Base window + upgrade bonus (50ms per level)
  return baseWindow + comboWindowUpgrade * 50;
}

// -------------------- Combat Resolution --------------------

/**
 * Resolve an attack against a defender
 */
export function resolveAttack(
  attacker: FighterRuntimeState,
  defender: FighterRuntimeState,
  attackerStats: FighterStats,
  defenderStats: FighterStats,
  punchType: PunchType,
  options: {
    chargeLevel?: number;
  }
): CombatUpdate {
  const now = Date.now();

  // Check if defender is invincible (dodging)
  if (checkDodgeInvincibility(defender.isDodging, defender.invincibleUntil)) {
    // Miss effect
    const missEffect: HitEffect = {
      id: generateId(),
      x: defender.x,
      y: defender.y,
      type: "miss",
      startTime: now,
      durationMs: 200,
    };

    return {
      attackerState: {},
      defenderState: {},
      effects: [missEffect],
      damageNumbers: [],
    };
  }

  // Check for perfect block
  const isPerfectBlock =
    defender.isBlocking &&
    !defender.isTurtleDefense &&
    checkPerfectBlock(defender.stateStartTime, now);

  // Calculate damage
  const damageResult = calculateDamage(punchType, attackerStats, defenderStats, {
    chargeLevel: options.chargeLevel,
    comboCount: attacker.comboCount,
    isOverheated: attacker.isOverheated,
    isBlocking: defender.isBlocking,
    isTurtleDefense: defender.isTurtleDefense,
    isPerfectBlock,
    isCounterHit: defender.state === "attacking",
  });

  // Set effect positions
  damageResult.hitEffect.x = defender.x;
  damageResult.hitEffect.y = defender.y;
  damageResult.damageNumber.x = defender.x;
  damageResult.damageNumber.y = defender.y - 50;

  // Calculate new defender health
  const newHealth = Math.max(0, defender.currentHealth - damageResult.damage);

  // Calculate stun
  const stunResult = addStunDamage(defender.stunMeter, damageResult.stunDamage);

  // Calculate attacker's new overheat
  const newOverheat = addOverheat(attacker.overheat, punchType, attacker.isOverheated);

  // Update combo count
  const newComboCount = damageResult.isBlocked ? 0 : attacker.comboCount + 1;

  // Prepare state updates
  const attackerUpdate: Partial<FighterRuntimeState> = {
    overheat: newOverheat,
    isOverheated: newOverheat >= OVERHEAT_CONFIG.criticalThreshold,
    comboCount: newComboCount,
    lastActionTime: now,
  };

  const defenderUpdate: Partial<FighterRuntimeState> = {
    currentHealth: newHealth,
    stunMeter: stunResult.stunMeter,
    isStunned: stunResult.isStunned,
    lastHitTime: now,
  };

  // If stunned, set stun end time
  if (stunResult.isStunned && !defender.isStunned) {
    defenderUpdate.stunEndTime = now + STUN_CONFIG.stunDuration;
    defenderUpdate.state = "stunned";
    defenderUpdate.stateStartTime = now;

    // Add stun effect
    const stunEffect: HitEffect = {
      id: generateId(),
      x: defender.x,
      y: defender.y - 30,
      type: "stun",
      startTime: now,
      durationMs: 500,
    };

    return {
      attackerState: attackerUpdate,
      defenderState: defenderUpdate,
      effects: [damageResult.hitEffect, stunEffect],
      damageNumbers: [damageResult.damageNumber],
    };
  }

  // Perfect block counter effect
  if (isPerfectBlock) {
    // Apply stun to attacker on perfect block
    const counterStun = addStunDamage(attacker.stunMeter, DEFENSE_CONFIG.perfectBlockStunBonus);
    attackerUpdate.stunMeter = counterStun.stunMeter;
    if (counterStun.isStunned) {
      attackerUpdate.isStunned = true;
      attackerUpdate.stunEndTime = now + STUN_CONFIG.stunDuration;
    }
  }

  return {
    attackerState: attackerUpdate,
    defenderState: defenderUpdate,
    effects: [damageResult.hitEffect],
    damageNumbers: damageResult.damage > 0 ? [damageResult.damageNumber] : [],
  };
}

// -------------------- Special Meter --------------------

/**
 * Add special meter charge
 */
export function addSpecialCharge(
  currentSpecial: number,
  damageDealt: number,
  chargeRateMultiplier: number = 1
): number {
  // Charge based on damage dealt
  const charge = damageDealt * 0.5 * chargeRateMultiplier;
  return clamp(currentSpecial + charge, 0, 100);
}

/**
 * Check if special is ready
 */
export function isSpecialReady(specialMeter: number): boolean {
  return specialMeter >= 100;
}
