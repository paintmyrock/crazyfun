// ============================================
// Crazy Fun Boxing - Game Loop Hook
// 60fps game loop with fixed timestep
// ============================================

import { useRef, useEffect, useCallback } from "react";

// -------------------- Types --------------------

interface GameLoopOptions {
  onUpdate: (deltaMs: number, totalMs: number) => void;
  onRender: (interpolation: number) => void;
  targetFps?: number;
  maxDeltaMs?: number;
  enabled?: boolean;
}

interface GameLoopState {
  lastTime: number;
  accumulator: number;
  totalTime: number;
  frameCount: number;
  fps: number;
  lastFpsUpdate: number;
}

// -------------------- Constants --------------------

const DEFAULT_TARGET_FPS = 60;
const DEFAULT_MAX_DELTA_MS = 250; // Prevent spiral of death after tab switch
const FPS_UPDATE_INTERVAL = 1000; // Update FPS counter every second

// -------------------- Hook --------------------

export function useGameLoop({
  onUpdate,
  onRender,
  targetFps = DEFAULT_TARGET_FPS,
  maxDeltaMs = DEFAULT_MAX_DELTA_MS,
  enabled = true,
}: GameLoopOptions) {
  const stateRef = useRef<GameLoopState>({
    lastTime: 0,
    accumulator: 0,
    totalTime: 0,
    frameCount: 0,
    fps: 0,
    lastFpsUpdate: 0,
  });

  const rafRef = useRef<number | null>(null);
  const fixedDeltaMs = 1000 / targetFps;

  const loop = useCallback(
    (currentTime: number) => {
      const state = stateRef.current;

      // Initialize on first frame
      if (state.lastTime === 0) {
        state.lastTime = currentTime;
        state.lastFpsUpdate = currentTime;
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // Calculate delta time
      let deltaMs = currentTime - state.lastTime;
      state.lastTime = currentTime;

      // Clamp delta to prevent spiral of death
      if (deltaMs > maxDeltaMs) {
        deltaMs = maxDeltaMs;
      }

      // Fixed timestep accumulator
      state.accumulator += deltaMs;

      // Run fixed updates
      while (state.accumulator >= fixedDeltaMs) {
        onUpdate(fixedDeltaMs, state.totalTime);
        state.totalTime += fixedDeltaMs;
        state.accumulator -= fixedDeltaMs;
      }

      // Calculate interpolation for smooth rendering
      const interpolation = state.accumulator / fixedDeltaMs;
      onRender(interpolation);

      // Update FPS counter
      state.frameCount++;
      if (currentTime - state.lastFpsUpdate >= FPS_UPDATE_INTERVAL) {
        state.fps = Math.round(
          (state.frameCount * 1000) / (currentTime - state.lastFpsUpdate)
        );
        state.frameCount = 0;
        state.lastFpsUpdate = currentTime;
      }

      // Schedule next frame
      rafRef.current = requestAnimationFrame(loop);
    },
    [onUpdate, onRender, fixedDeltaMs, maxDeltaMs]
  );

  useEffect(() => {
    if (enabled) {
      // Reset state when starting
      stateRef.current.lastTime = 0;
      stateRef.current.accumulator = 0;
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled, loop]);

  // Return current FPS for debugging
  return {
    fps: stateRef.current.fps,
    totalTime: stateRef.current.totalTime,
  };
}

// -------------------- Time Utilities --------------------

/**
 * Create a timer that can be paused
 */
export function createTimer() {
  let startTime = 0;
  let pausedTime = 0;
  let isPaused = false;

  return {
    start: () => {
      startTime = Date.now();
      pausedTime = 0;
      isPaused = false;
    },
    pause: () => {
      if (!isPaused) {
        pausedTime = Date.now();
        isPaused = true;
      }
    },
    resume: () => {
      if (isPaused) {
        startTime += Date.now() - pausedTime;
        isPaused = false;
      }
    },
    getElapsed: () => {
      if (isPaused) {
        return pausedTime - startTime;
      }
      return Date.now() - startTime;
    },
    isPaused: () => isPaused,
  };
}

/**
 * Ease in-out function for smooth animations
 */
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Ease out bounce for impact effects
 */
export function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
