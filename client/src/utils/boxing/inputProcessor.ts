// ============================================
// Crazy Fun Boxing - Input Processor
// Maps touch gestures to combat actions
// ============================================

import {
  TouchGesture,
  GestureType,
  ActionType,
  QueuedAction,
  FighterRuntimeState,
} from "@/data/boxing/types";
import { INPUT_CONFIG } from "@/data/boxing/config";

// -------------------- Types --------------------

export interface InputProcessorState {
  actionQueue: QueuedAction[];
  lastProcessedTime: number;
}

export interface ProcessedInput {
  action: ActionType | null;
  chargeLevel?: number;
  rejected: boolean;
  rejectReason?: string;
}

// -------------------- Gesture to Action Mapping --------------------

const GESTURE_ACTION_MAP: Record<GestureType, ActionType | null> = {
  tap_left: "jab_left",
  tap_right: "jab_right",
  double_tap: "combo_punch",
  hold_start: null, // No immediate action, wait for release
  hold_release: "power_punch",
  swipe_left: "dodge_left",
  swipe_right: "dodge_right",
  swipe_down: "block",
  two_finger_hold: "turtle_defense",
  two_finger_release: "release_defense",
};

// -------------------- Input Processor --------------------

export function createInputProcessor(): InputProcessorState {
  return {
    actionQueue: [],
    lastProcessedTime: 0,
  };
}

/**
 * Process a gesture and convert it to a queued action
 */
export function processGesture(
  gesture: TouchGesture,
  state: InputProcessorState,
  fighterState: FighterRuntimeState
): ProcessedInput {
  const now = Date.now();

  // Clean up expired actions
  state.actionQueue = state.actionQueue.filter((a) => a.expiresAt > now);

  // Check if fighter can accept input
  const canAcceptInput = checkCanAcceptInput(fighterState);
  if (!canAcceptInput.allowed) {
    return {
      action: null,
      rejected: true,
      rejectReason: canAcceptInput.reason,
    };
  }

  // Map gesture to action
  const action = GESTURE_ACTION_MAP[gesture.type];
  if (!action) {
    return { action: null, rejected: false };
  }

  // Check queue capacity
  if (state.actionQueue.length >= INPUT_CONFIG.inputBufferSize) {
    return {
      action: null,
      rejected: true,
      rejectReason: "Action queue full",
    };
  }

  // Create queued action
  const queuedAction: QueuedAction = {
    type: action,
    timestamp: gesture.timestamp,
    chargeLevel: gesture.chargeLevel,
    expiresAt: now + INPUT_CONFIG.inputBufferWindow,
  };

  state.actionQueue.push(queuedAction);

  return {
    action,
    chargeLevel: gesture.chargeLevel,
    rejected: false,
  };
}

/**
 * Get the next action from the queue
 */
export function getNextAction(state: InputProcessorState): QueuedAction | null {
  const now = Date.now();

  // Clean up expired actions
  state.actionQueue = state.actionQueue.filter((a) => a.expiresAt > now);

  // Return and remove the first action
  const action = state.actionQueue.shift();
  return action ?? null;
}

/**
 * Peek at the next action without removing it
 */
export function peekNextAction(state: InputProcessorState): QueuedAction | null {
  const now = Date.now();

  // Find first non-expired action
  const action = state.actionQueue.find((a) => a.expiresAt > now);
  return action ?? null;
}

/**
 * Clear all queued actions
 */
export function clearActionQueue(state: InputProcessorState): void {
  state.actionQueue = [];
}

/**
 * Check if fighter can accept input based on current state
 */
function checkCanAcceptInput(fighterState: FighterRuntimeState): {
  allowed: boolean;
  reason?: string;
} {
  // Can't accept input when stunned
  if (fighterState.isStunned) {
    return { allowed: false, reason: "Stunned" };
  }

  // Can't accept input when knocked down
  if (fighterState.state === "knocked_down") {
    return { allowed: false, reason: "Knocked down" };
  }

  // Can't accept input during victory/defeat
  if (fighterState.state === "victory" || fighterState.state === "defeat") {
    return { allowed: false, reason: "Match ended" };
  }

  // Can accept input during recovery (will be queued)
  // Can accept input during attacking (will be queued for combo)
  // Can accept input during blocking/dodging (will cancel or queue)

  return { allowed: true };
}

/**
 * Check if an action can interrupt the current state
 */
export function canActionInterrupt(
  action: ActionType,
  fighterState: FighterRuntimeState
): boolean {
  const currentState = fighterState.state;

  // Defense actions can always interrupt idle
  if (currentState === "idle") {
    return true;
  }

  // Release defense can interrupt blocking
  if (action === "release_defense" && fighterState.isBlocking) {
    return true;
  }

  // Can't interrupt attack windup
  if (currentState === "attacking") {
    return false;
  }

  // Can't interrupt dodge
  if (currentState === "dodging") {
    return false;
  }

  // Can queue actions during recovery
  if (currentState === "recovering") {
    return false; // Will be queued instead
  }

  return true;
}

/**
 * Get action priority for queue ordering
 * Higher priority actions execute first if multiple are queued
 */
export function getActionPriority(action: ActionType): number {
  switch (action) {
    // Defense has highest priority
    case "turtle_defense":
      return 100;
    case "block":
      return 90;
    case "dodge_left":
    case "dodge_right":
      return 80;
    case "release_defense":
      return 75;

    // Special attacks
    case "power_punch":
      return 60;
    case "combo_punch":
      return 50;

    // Basic attacks
    case "jab_left":
    case "jab_right":
      return 40;

    default:
      return 0;
  }
}

/**
 * Validate action based on stamina/resources
 */
export function validateActionResources(
  action: ActionType,
  overheat: number,
  isOverheated: boolean
): { valid: boolean; reason?: string } {
  // Can always release defense
  if (action === "release_defense") {
    return { valid: true };
  }

  // Defense actions cost stamina but are always allowed
  if (action === "block" || action === "turtle_defense") {
    return { valid: true };
  }

  // Dodge has cooldown - checked elsewhere
  if (action === "dodge_left" || action === "dodge_right") {
    return { valid: true };
  }

  // Attack actions check overheat
  // Even when overheated, attacks are allowed but with penalties
  // The penalties are applied in the combat engine

  return { valid: true };
}

// -------------------- Debug Helpers --------------------

export function getInputDebugInfo(state: InputProcessorState): {
  queueSize: number;
  queuedActions: string[];
} {
  return {
    queueSize: state.actionQueue.length,
    queuedActions: state.actionQueue.map((a) => a.type),
  };
}
