// ============================================
// Crazy Fun Boxing - Finisher Gesture Recognizer
// Pattern matching for finisher move gestures
// ============================================

import {
  FinisherGestureType,
  FinisherGesture,
  FinisherState,
  GesturePoint,
} from "@/data/boxing/types";
import { FINISHER_CONFIG, FINISHER_GESTURES } from "@/data/boxing/config";

// -------------------- Types --------------------

export interface RecognitionResult {
  success: boolean;
  progress: number; // 0-1
  feedback?: string;
}

interface CircleAnalysis {
  isCircular: boolean;
  completionPercent: number;
  centerX: number;
  centerY: number;
  radius: number;
}

// -------------------- State Management --------------------

export function createFinisherState(): FinisherState {
  return {
    isActive: false,
    gesture: null,
    startTime: 0,
    tracePoints: [],
    tapSequence: [],
    swipeSequence: [],
    progress: 0,
    result: "pending",
  };
}

export function startFinisher(
  state: FinisherState,
  gestureType: FinisherGestureType
): FinisherState {
  const gesture = FINISHER_GESTURES[gestureType];
  return {
    isActive: true,
    gesture,
    startTime: Date.now(),
    tracePoints: [],
    tapSequence: [],
    swipeSequence: [],
    progress: 0,
    result: "pending",
  };
}

export function resetFinisher(): FinisherState {
  return createFinisherState();
}

// -------------------- Point Recording --------------------

export function addTracePoint(
  state: FinisherState,
  x: number,
  y: number
): FinisherState {
  if (!state.isActive || state.result !== "pending") return state;

  const point: GesturePoint = {
    x,
    y,
    timestamp: Date.now(),
  };

  return {
    ...state,
    tracePoints: [...state.tracePoints, point],
  };
}

export function addTap(
  state: FinisherState,
  side: "left" | "right"
): FinisherState {
  if (!state.isActive || state.result !== "pending") return state;

  return {
    ...state,
    tapSequence: [...state.tapSequence, { side, time: Date.now() }],
  };
}

export function addSwipe(
  state: FinisherState,
  direction: string
): FinisherState {
  if (!state.isActive || state.result !== "pending") return state;

  return {
    ...state,
    swipeSequence: [...state.swipeSequence, { direction, time: Date.now() }],
  };
}

// -------------------- Recognition Functions --------------------

/**
 * Evaluate the current gesture progress
 */
export function evaluateGesture(state: FinisherState): RecognitionResult {
  if (!state.isActive || !state.gesture) {
    return { success: false, progress: 0 };
  }

  // Check timeout
  const elapsed = Date.now() - state.startTime;
  if (elapsed > state.gesture.timeLimit) {
    return { success: false, progress: state.progress, feedback: "Time's up!" };
  }

  switch (state.gesture.type) {
    case "lightning_bolt":
      return recognizeLightningBolt(state);
    case "circle":
      return recognizeCircle(state);
    case "rapid_alternating":
      return recognizeRapidAlternating(state);
    case "swipe_sequence":
      return recognizeSwipeSequence(state);
    default:
      return { success: false, progress: 0 };
  }
}

/**
 * Lightning bolt: zig-zag down pattern
 * Expected: down-right, down-left, down-right (or inverse)
 */
function recognizeLightningBolt(state: FinisherState): RecognitionResult {
  const points = state.tracePoints;
  const tolerance = FINISHER_CONFIG.toleranceMultiplier;

  if (points.length < 4) {
    return { success: false, progress: 0, feedback: "Draw a zig-zag down" };
  }

  // Simplify points to key vertices
  const vertices = simplifyPath(points, 30); // 30px threshold

  if (vertices.length < 4) {
    return {
      success: false,
      progress: vertices.length / 4,
      feedback: "Keep going...",
    };
  }

  // Analyze segments
  let validSegments = 0;
  let lastDirection: "left" | "right" | null = null;

  for (let i = 1; i < Math.min(vertices.length, 4); i++) {
    const prev = vertices[i - 1];
    const curr = vertices[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;

    // Must be going down
    if (dy <= 0) continue;

    // Must alternate left/right
    const direction = dx > 0 ? "right" : "left";
    if (lastDirection === null || direction !== lastDirection) {
      validSegments++;
      lastDirection = direction;
    }
  }

  const progress = Math.min(1, validSegments / 3);

  if (validSegments >= 3) {
    return { success: true, progress: 1, feedback: "Thunder Strike!" };
  }

  return {
    success: false,
    progress,
    feedback: progress > 0.5 ? "Almost there!" : "Zig-zag down",
  };
}

/**
 * Circle: draw a complete circle
 */
function recognizeCircle(state: FinisherState): RecognitionResult {
  const points = state.tracePoints;
  const tolerance = FINISHER_CONFIG.toleranceMultiplier;

  if (points.length < 10) {
    return { success: false, progress: 0, feedback: "Draw a circle" };
  }

  const analysis = analyzeCircle(points);

  if (!analysis.isCircular) {
    return {
      success: false,
      progress: analysis.completionPercent * 0.5,
      feedback: "Make it rounder",
    };
  }

  const progress = analysis.completionPercent;

  // Require 80% completion with tolerance
  const threshold = 0.8 / tolerance;

  if (progress >= threshold) {
    return { success: true, progress: 1, feedback: "Cyclone Punch!" };
  }

  return {
    success: false,
    progress,
    feedback: progress > 0.5 ? "Keep going around!" : "Draw a circle",
  };
}

/**
 * Rapid alternating: 8 quick taps, alternating left/right
 */
function recognizeRapidAlternating(state: FinisherState): RecognitionResult {
  const taps = state.tapSequence;
  const requiredTaps = 8;
  const maxGap = 400; // Max ms between taps

  if (taps.length === 0) {
    return { success: false, progress: 0, feedback: "Tap left-right rapidly!" };
  }

  // Count valid alternating taps
  let validTaps = 1;
  let lastSide = taps[0].side;

  for (let i = 1; i < taps.length; i++) {
    const tap = taps[i];
    const prevTap = taps[i - 1];

    // Check timing
    if (tap.time - prevTap.time > maxGap) {
      // Reset count if too slow
      validTaps = 1;
      lastSide = tap.side;
      continue;
    }

    // Check alternation
    if (tap.side !== lastSide) {
      validTaps++;
      lastSide = tap.side;
    }
  }

  const progress = validTaps / requiredTaps;

  if (validTaps >= requiredTaps) {
    return { success: true, progress: 1, feedback: "Fury Combo!" };
  }

  return {
    success: false,
    progress,
    feedback: `${validTaps}/${requiredTaps} - Keep tapping!`,
  };
}

/**
 * Swipe sequence: left-right-up in order
 */
function recognizeSwipeSequence(state: FinisherState): RecognitionResult {
  const swipes = state.swipeSequence;
  const expected = ["left", "right", "up"];
  const maxGap = 500; // Max ms between swipes

  if (swipes.length === 0) {
    return { success: false, progress: 0, feedback: "Swipe left, right, up!" };
  }

  // Check sequence
  let matched = 0;

  for (let i = 0; i < Math.min(swipes.length, expected.length); i++) {
    const swipe = swipes[i];

    // Check timing (except first)
    if (i > 0) {
      const prevSwipe = swipes[i - 1];
      if (swipe.time - prevSwipe.time > maxGap) {
        // Too slow, reset
        break;
      }
    }

    // Check direction
    if (swipe.direction === expected[i]) {
      matched++;
    } else {
      // Wrong direction
      break;
    }
  }

  const progress = matched / expected.length;

  if (matched >= expected.length) {
    return { success: true, progress: 1, feedback: "Hurricane Hook!" };
  }

  const nextDirection = expected[matched] || "done";
  return {
    success: false,
    progress,
    feedback:
      matched > 0 ? `Now swipe ${nextDirection}!` : "Swipe left, right, up!",
  };
}

// -------------------- Helper Functions --------------------

/**
 * Simplify a path by removing points that don't change direction significantly
 */
function simplifyPath(points: GesturePoint[], threshold: number): GesturePoint[] {
  if (points.length < 3) return points;

  const result: GesturePoint[] = [points[0]];
  let lastVertex = points[0];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = lastVertex;
    const curr = points[i];
    const next = points[i + 1];

    // Calculate direction change
    const dir1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const dir2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    const angleDiff = Math.abs(dir2 - dir1);

    // Calculate distance from last vertex
    const distance = Math.sqrt(
      Math.pow(curr.x - lastVertex.x, 2) + Math.pow(curr.y - lastVertex.y, 2)
    );

    // Keep point if direction change is significant or distance is large
    if (angleDiff > 0.5 || distance > threshold * 2) {
      result.push(curr);
      lastVertex = curr;
    }
  }

  result.push(points[points.length - 1]);
  return result;
}

/**
 * Analyze if points form a circle
 */
function analyzeCircle(points: GesturePoint[]): CircleAnalysis {
  if (points.length < 10) {
    return {
      isCircular: false,
      completionPercent: 0,
      centerX: 0,
      centerY: 0,
      radius: 0,
    };
  }

  // Calculate centroid
  let sumX = 0;
  let sumY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  const centerX = sumX / points.length;
  const centerY = sumY / points.length;

  // Calculate average radius and variance
  let sumRadius = 0;
  const radii: number[] = [];

  for (const p of points) {
    const r = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
    radii.push(r);
    sumRadius += r;
  }

  const avgRadius = sumRadius / points.length;

  // Calculate radius variance
  let variance = 0;
  for (const r of radii) {
    variance += Math.pow(r - avgRadius, 2);
  }
  variance /= radii.length;

  // Check circularity (low variance = more circular)
  const coeffOfVariation = Math.sqrt(variance) / avgRadius;
  const isCircular = coeffOfVariation < 0.3; // 30% tolerance

  // Calculate arc completion
  // Sample angles around the center
  const angles: number[] = [];
  for (const p of points) {
    const angle = Math.atan2(p.y - centerY, p.x - centerX);
    angles.push(angle);
  }

  // Sort and find arc coverage
  angles.sort((a, b) => a - b);

  // Find largest gap (indicates incomplete circle)
  let maxGap = 0;
  for (let i = 1; i < angles.length; i++) {
    const gap = angles[i] - angles[i - 1];
    maxGap = Math.max(maxGap, gap);
  }
  // Check wrap-around gap
  const wrapGap = 2 * Math.PI + angles[0] - angles[angles.length - 1];
  maxGap = Math.max(maxGap, wrapGap);

  // Coverage is the percentage of the circle that's covered
  const completionPercent = 1 - maxGap / (2 * Math.PI);

  return {
    isCircular,
    completionPercent: Math.max(0, Math.min(1, completionPercent)),
    centerX,
    centerY,
    radius: avgRadius,
  };
}

// -------------------- Finisher Damage --------------------

/**
 * Calculate finisher damage based on success
 */
export function calculateFinisherDamage(
  gesture: FinisherGesture,
  success: boolean,
  attackerPower: number
): number {
  if (!success) return 0;

  const baseDamage = gesture.baseDamage;
  const powerMultiplier = attackerPower;
  const successBonus = FINISHER_CONFIG.successDamageBonus;

  return Math.floor(baseDamage * powerMultiplier * successBonus);
}

/**
 * Calculate opponent recovery on finisher failure
 */
export function calculateFailureRecovery(maxHealth: number): number {
  return Math.floor(maxHealth * FINISHER_CONFIG.failureRecovery);
}

// -------------------- Finisher Window --------------------

/**
 * Check if finisher window should open
 */
export function shouldOpenFinisherWindow(
  defenderHealth: number,
  defenderMaxHealth: number,
  defenderIsStunned: boolean
): boolean {
  const healthPercent = defenderHealth / defenderMaxHealth;

  // Open on low health
  if (healthPercent <= FINISHER_CONFIG.hpThreshold) {
    return true;
  }

  // Open on stun (if enabled)
  if (FINISHER_CONFIG.stunTrigger && defenderIsStunned) {
    return true;
  }

  return false;
}

/**
 * Get a random finisher gesture
 */
export function getRandomFinisherGesture(): FinisherGestureType {
  const types: FinisherGestureType[] = [
    "lightning_bolt",
    "circle",
    "rapid_alternating",
    "swipe_sequence",
  ];
  return types[Math.floor(Math.random() * types.length)];
}
