// ============================================
// Crazy Fun Boxing - AI Controller
// State machine AI with difficulty scaling
// ============================================

import {
  AIState,
  AIBehavior,
  AIRuntimeState,
  PunchType,
  DifficultyTier,
  FighterRuntimeState,
  ActionType,
} from "@/data/boxing/types";
import { DIFFICULTY_CONFIGS, PUNCH_DATA } from "@/data/boxing/config";

// -------------------- Types --------------------

export interface AIDecision {
  action: ActionType | null;
  delay: number; // Ms before executing
}

// -------------------- State Management --------------------

export function createAIState(): AIRuntimeState {
  return {
    currentState: "idle",
    stateEnterTime: Date.now(),
    lastAttackTime: 0,
    lastBlockTime: 0,
    queuedAttack: null,
    playerPatternHistory: [],
    predictedNextPunch: null,
  };
}

export function resetAIState(state: AIRuntimeState): AIRuntimeState {
  return {
    ...state,
    currentState: "idle",
    stateEnterTime: Date.now(),
    queuedAttack: null,
  };
}

// -------------------- Behavior Configuration --------------------

export function getBehavior(difficulty: DifficultyTier): AIBehavior {
  return DIFFICULTY_CONFIGS[difficulty];
}

// -------------------- Reaction Time --------------------

/**
 * Get a gaussian-distributed reaction time for more human-like feel
 */
function getReactionTime(behavior: AIBehavior): number {
  const { reactionTimeMin, reactionTimeMax } = behavior;
  const mean = (reactionTimeMin + reactionTimeMax) / 2;
  const stdDev = (reactionTimeMax - reactionTimeMin) / 4;

  // Box-Muller transform for gaussian distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  const reaction = mean + z * stdDev;
  return Math.max(reactionTimeMin, Math.min(reactionTimeMax, reaction));
}

// -------------------- Pattern Analysis --------------------

/**
 * Record player punch for pattern analysis
 */
export function recordPlayerPunch(
  state: AIRuntimeState,
  punchType: PunchType
): AIRuntimeState {
  const history = [...state.playerPatternHistory, punchType].slice(-10);

  // Predict next punch based on patterns
  const predicted = predictNextPunch(history);

  return {
    ...state,
    playerPatternHistory: history,
    predictedNextPunch: predicted,
  };
}

/**
 * Simple pattern prediction based on history
 */
function predictNextPunch(history: PunchType[]): PunchType | null {
  if (history.length < 3) return null;

  // Look for repeating patterns
  const lastTwo = history.slice(-2).join(",");
  let matchCount: Record<PunchType, number> = {
    jab: 0,
    hook: 0,
    uppercut: 0,
    body: 0,
    power: 0,
    combo: 0,
  };

  // Count what follows the pattern
  for (let i = 0; i < history.length - 2; i++) {
    const pattern = `${history[i]},${history[i + 1]}`;
    if (pattern === lastTwo && i + 2 < history.length) {
      matchCount[history[i + 2]]++;
    }
  }

  // Return most likely next punch
  let maxCount = 0;
  let predicted: PunchType | null = null;

  for (const [punch, count] of Object.entries(matchCount)) {
    if (count > maxCount) {
      maxCount = count;
      predicted = punch as PunchType;
    }
  }

  return predicted;
}

// -------------------- Decision Making --------------------

/**
 * Main AI decision function
 */
export function makeDecision(
  aiState: AIRuntimeState,
  aiFighter: FighterRuntimeState,
  playerFighter: FighterRuntimeState,
  behavior: AIBehavior
): AIDecision {
  const now = Date.now();

  // Can't act if stunned
  if (aiFighter.isStunned || aiFighter.state === "stunned") {
    return { action: null, delay: 0 };
  }

  // Can't act if knocked down
  if (aiFighter.state === "knocked_down") {
    return { action: null, delay: 0 };
  }

  // State machine transitions
  switch (aiState.currentState) {
    case "idle":
      return decideFromIdle(aiState, aiFighter, playerFighter, behavior);

    case "attacking":
      // Already attacking, wait for completion
      return { action: null, delay: 0 };

    case "blocking":
      return decideFromBlocking(aiState, aiFighter, playerFighter, behavior);

    case "dodging":
      // Already dodging, wait for completion
      return { action: null, delay: 0 };

    case "recovering":
      // Recovering from attack, limited options
      return decideFromRecovery(aiState, aiFighter, playerFighter, behavior);

    default:
      return { action: null, delay: 0 };
  }
}

/**
 * Decide action from idle state
 */
function decideFromIdle(
  aiState: AIRuntimeState,
  aiFighter: FighterRuntimeState,
  playerFighter: FighterRuntimeState,
  behavior: AIBehavior
): AIDecision {
  const now = Date.now();

  // Check if player is attacking - react defensively
  if (playerFighter.state === "attacking") {
    return decideDefense(behavior);
  }

  // Check attack frequency
  const timeSinceLastAttack = now - aiState.lastAttackTime;
  const attackInterval = 10000 / behavior.attackFrequency; // Convert to ms interval

  if (timeSinceLastAttack >= attackInterval) {
    return decideAttack(aiFighter, playerFighter, behavior);
  }

  // Idle - wait for opportunity
  return { action: null, delay: getReactionTime(behavior) };
}

/**
 * Decide defensive action
 */
function decideDefense(behavior: AIBehavior): AIDecision {
  const roll = Math.random();
  const reactionTime = getReactionTime(behavior);

  // Decide between block and dodge
  if (roll < behavior.dodgeProbability) {
    // Dodge
    const direction = Math.random() < 0.5 ? "dodge_left" : "dodge_right";
    return { action: direction, delay: reactionTime };
  } else if (roll < behavior.dodgeProbability + behavior.blockProbability) {
    // Block
    return { action: "block", delay: reactionTime };
  }

  // No defensive action (got hit)
  return { action: null, delay: 0 };
}

/**
 * Decide attack action
 */
function decideAttack(
  aiFighter: FighterRuntimeState,
  playerFighter: FighterRuntimeState,
  behavior: AIBehavior
): AIDecision {
  const roll = Math.random();

  // Choose attack type based on probabilities
  let action: ActionType;

  if (roll < behavior.heavyPunchChance) {
    // Power punch
    action = "power_punch";
  } else if (roll < behavior.heavyPunchChance + behavior.comboChance) {
    // Combo punch
    action = "combo_punch";
  } else {
    // Basic jab
    action = Math.random() < 0.5 ? "jab_left" : "jab_right";
  }

  // Add reaction time delay
  const delay = getReactionTime(behavior) * 0.5; // Faster for attacks

  return { action, delay };
}

/**
 * Decide from blocking state
 */
function decideFromBlocking(
  aiState: AIRuntimeState,
  aiFighter: FighterRuntimeState,
  playerFighter: FighterRuntimeState,
  behavior: AIBehavior
): AIDecision {
  // If player stopped attacking, counter attack
  if (playerFighter.state !== "attacking") {
    // Release block and counter
    const roll = Math.random();
    if (roll < 0.3 + behavior.adaptationRate * 0.3) {
      // Counter attack
      return {
        action: Math.random() < 0.5 ? "jab_left" : "jab_right",
        delay: 50, // Quick counter
      };
    }
    // Just release block
    return { action: "release_defense", delay: 100 };
  }

  // Keep blocking
  return { action: null, delay: 0 };
}

/**
 * Decide from recovery state
 */
function decideFromRecovery(
  aiState: AIRuntimeState,
  aiFighter: FighterRuntimeState,
  playerFighter: FighterRuntimeState,
  behavior: AIBehavior
): AIDecision {
  // If player is attacking during our recovery, try to block
  if (playerFighter.state === "attacking") {
    const roll = Math.random();
    if (roll < behavior.blockProbability * 0.5) {
      // Emergency block (lower chance during recovery)
      return { action: "block", delay: 50 };
    }
  }

  return { action: null, delay: 0 };
}

// -------------------- State Transitions --------------------

/**
 * Update AI state based on actions and events
 */
export function updateAIState(
  state: AIRuntimeState,
  event: {
    type: "action_started" | "action_ended" | "got_hit" | "blocked" | "dodged" | "stunned" | "recovered";
    action?: ActionType;
  }
): AIRuntimeState {
  const now = Date.now();

  switch (event.type) {
    case "action_started":
      if (event.action?.includes("jab") || event.action?.includes("punch")) {
        return {
          ...state,
          currentState: "attacking",
          stateEnterTime: now,
          lastAttackTime: now,
        };
      }
      if (event.action === "block" || event.action === "turtle_defense") {
        return {
          ...state,
          currentState: "blocking",
          stateEnterTime: now,
          lastBlockTime: now,
        };
      }
      if (event.action?.includes("dodge")) {
        return {
          ...state,
          currentState: "dodging",
          stateEnterTime: now,
        };
      }
      break;

    case "action_ended":
      return {
        ...state,
        currentState: "recovering",
        stateEnterTime: now,
      };

    case "got_hit":
      return {
        ...state,
        currentState: "recovering",
        stateEnterTime: now,
      };

    case "blocked":
      return {
        ...state,
        currentState: "blocking",
        stateEnterTime: now,
      };

    case "dodged":
      return {
        ...state,
        currentState: "idle",
        stateEnterTime: now,
      };

    case "stunned":
      return {
        ...state,
        currentState: "stunned",
        stateEnterTime: now,
      };

    case "recovered":
      return {
        ...state,
        currentState: "idle",
        stateEnterTime: now,
      };
  }

  return state;
}

// -------------------- Difficulty Adaptation --------------------

/**
 * Adapt behavior based on match state
 */
export function adaptBehavior(
  baseBehavior: AIBehavior,
  aiFighter: FighterRuntimeState,
  playerFighter: FighterRuntimeState
): AIBehavior {
  const adaptRate = baseBehavior.adaptationRate;
  if (adaptRate === 0) return baseBehavior;

  const behavior = { ...baseBehavior };

  // Adapt based on health difference
  const healthDiff =
    playerFighter.currentHealth / playerFighter.maxHealth -
    aiFighter.currentHealth / aiFighter.maxHealth;

  if (healthDiff > 0.2) {
    // AI is losing - get more aggressive
    behavior.attackFrequency *= 1 + adaptRate * 0.5;
    behavior.heavyPunchChance *= 1 + adaptRate * 0.3;
  } else if (healthDiff < -0.2) {
    // AI is winning - play more defensive
    behavior.blockProbability *= 1 + adaptRate * 0.3;
    behavior.dodgeProbability *= 1 + adaptRate * 0.2;
  }

  // Adapt based on player's combo count
  if (playerFighter.comboCount > 3) {
    // Player is on a roll - improve defense
    behavior.blockProbability = Math.min(0.95, behavior.blockProbability * (1 + adaptRate));
    behavior.dodgeProbability = Math.min(0.8, behavior.dodgeProbability * (1 + adaptRate * 0.5));
  }

  return behavior;
}

// -------------------- Finisher Response --------------------

/**
 * AI response during player's finisher window
 */
export function respondToFinisher(behavior: AIBehavior): boolean {
  // Higher difficulty AI is more likely to interrupt/avoid finisher
  const escapeChance = behavior.adaptationRate * 0.5;
  return Math.random() < escapeChance;
}
