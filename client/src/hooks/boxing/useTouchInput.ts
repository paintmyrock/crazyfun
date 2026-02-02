// ============================================
// Crazy Fun Boxing - Touch Input Hook
// Detects gestures from touch/pointer events
// ============================================

import { useCallback, useRef, useEffect } from "react";
import { TouchGesture, GestureType } from "@/data/boxing/types";
import { INPUT_CONFIG } from "@/data/boxing/config";

// -------------------- Types --------------------

interface TouchPoint {
  id: number;
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  lastMoveTime: number;
}

interface GestureState {
  activePointers: Map<number, TouchPoint>;
  lastTapTime: number;
  lastTapSide: "left" | "right" | null;
  isHolding: boolean;
  holdStartTime: number;
  holdPointerId: number | null;
  isTwoFingerHold: boolean;
  twoFingerStartTime: number;
}

interface UseTouchInputOptions {
  onGesture: (gesture: TouchGesture) => void;
  enabled?: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
}

// -------------------- Hook --------------------

export function useTouchInput({
  onGesture,
  enabled = true,
  containerRef,
}: UseTouchInputOptions) {
  const stateRef = useRef<GestureState>({
    activePointers: new Map(),
    lastTapTime: 0,
    lastTapSide: null,
    isHolding: false,
    holdStartTime: 0,
    holdPointerId: null,
    isTwoFingerHold: false,
    twoFingerStartTime: 0,
  });

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chargeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get screen side based on x position
  const getScreenSide = useCallback((x: number): "left" | "right" => {
    const container = containerRef.current;
    if (!container) return x < window.innerWidth / 2 ? "left" : "right";

    const rect = container.getBoundingClientRect();
    const relativeX = x - rect.left;
    const centerX = rect.width * INPUT_CONFIG.screenCenterX;

    return relativeX < centerX ? "left" : "right";
  }, [containerRef]);

  // Calculate charge level from hold duration
  const calculateChargeLevel = useCallback((holdDuration: number): number => {
    const { minChargeTime, maxChargeTime } = INPUT_CONFIG;

    if (holdDuration < minChargeTime) return 0;
    if (holdDuration >= maxChargeTime) return 1;

    return (holdDuration - minChargeTime) / (maxChargeTime - minChargeTime);
  }, []);

  // Emit a gesture event
  const emitGesture = useCallback(
    (type: GestureType, x: number, y: number, extra?: Partial<TouchGesture>) => {
      const gesture: TouchGesture = {
        type,
        x,
        y,
        timestamp: Date.now(),
        ...extra,
      };
      onGesture(gesture);
    },
    [onGesture]
  );

  // Clear hold timer
  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (chargeIntervalRef.current) {
      clearInterval(chargeIntervalRef.current);
      chargeIntervalRef.current = null;
    }
  }, []);

  // Handle pointer down
  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (!enabled) return;

      const state = stateRef.current;
      const point: TouchPoint = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startTime: Date.now(),
        currentX: e.clientX,
        currentY: e.clientY,
        lastMoveTime: Date.now(),
      };

      state.activePointers.set(e.pointerId, point);

      // Check for two-finger hold
      if (state.activePointers.size === 2) {
        state.isTwoFingerHold = true;
        state.twoFingerStartTime = Date.now();
        clearHoldTimer();

        // Wait for minimum duration before emitting
        holdTimerRef.current = setTimeout(() => {
          if (state.isTwoFingerHold && state.activePointers.size >= 2) {
            emitGesture("two_finger_hold", e.clientX, e.clientY);
          }
        }, INPUT_CONFIG.twoFingerHoldMinDuration);

        return;
      }

      // Single pointer - start hold detection
      if (state.activePointers.size === 1) {
        state.isHolding = false;
        state.holdPointerId = e.pointerId;
        state.holdStartTime = Date.now();

        // Timer to detect hold
        holdTimerRef.current = setTimeout(() => {
          if (state.activePointers.has(e.pointerId)) {
            state.isHolding = true;
            const side = getScreenSide(e.clientX);
            emitGesture("hold_start", e.clientX, e.clientY);

            // Start charge level updates
            chargeIntervalRef.current = setInterval(() => {
              if (state.isHolding) {
                const holdDuration = Date.now() - state.holdStartTime;
                const chargeLevel = calculateChargeLevel(holdDuration);
                // Could emit charge update events here if needed
              }
            }, 50);
          }
        }, INPUT_CONFIG.holdMinDuration);
      }
    },
    [enabled, emitGesture, clearHoldTimer, getScreenSide, calculateChargeLevel]
  );

  // Handle pointer move
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!enabled) return;

      const state = stateRef.current;
      const point = state.activePointers.get(e.pointerId);
      if (!point) return;

      point.currentX = e.clientX;
      point.currentY = e.clientY;
      point.lastMoveTime = Date.now();

      // Check if movement exceeds tap threshold (might be a swipe)
      const dx = e.clientX - point.startX;
      const dy = e.clientY - point.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If moving significantly during potential hold, cancel hold detection
      if (distance > INPUT_CONFIG.swipeMinDistance / 2 && !state.isHolding) {
        clearHoldTimer();
      }
    },
    [enabled, clearHoldTimer]
  );

  // Handle pointer up
  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!enabled) return;

      const state = stateRef.current;
      const point = state.activePointers.get(e.pointerId);

      // Handle two-finger release
      if (state.isTwoFingerHold && state.activePointers.size <= 2) {
        const holdDuration = Date.now() - state.twoFingerStartTime;
        if (holdDuration >= INPUT_CONFIG.twoFingerHoldMinDuration) {
          emitGesture("two_finger_release", e.clientX, e.clientY, {
            duration: holdDuration,
          });
        }
        state.isTwoFingerHold = false;
        clearHoldTimer();
      }

      if (!point) {
        state.activePointers.delete(e.pointerId);
        return;
      }

      const duration = Date.now() - point.startTime;
      const dx = e.clientX - point.startX;
      const dy = e.clientY - point.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const velocity = distance / duration;

      clearHoldTimer();

      // Check for hold release (power punch)
      if (state.isHolding && state.holdPointerId === e.pointerId) {
        const holdDuration = Date.now() - state.holdStartTime;
        const chargeLevel = calculateChargeLevel(holdDuration);

        emitGesture("hold_release", e.clientX, e.clientY, {
          duration: holdDuration,
          chargeLevel,
        });

        state.isHolding = false;
        state.holdPointerId = null;
        state.activePointers.delete(e.pointerId);
        return;
      }

      // Check for swipe
      if (
        distance >= INPUT_CONFIG.swipeMinDistance &&
        duration <= INPUT_CONFIG.swipeMaxDuration &&
        velocity >= INPUT_CONFIG.swipeMinVelocity
      ) {
        // Determine swipe direction from angle
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        let swipeType: GestureType | null = null;
        if (angle >= -45 && angle < 45) {
          swipeType = "swipe_right";
        } else if (angle >= 45 && angle < 135) {
          swipeType = "swipe_down";
        } else if (angle >= -135 && angle < -45) {
          // Swipe up - could be used for special moves
        } else {
          swipeType = "swipe_left";
        }

        if (swipeType) {
          emitGesture(swipeType, e.clientX, e.clientY, {
            velocity,
            duration,
          });
        }

        state.activePointers.delete(e.pointerId);
        return;
      }

      // Check for tap
      if (duration <= INPUT_CONFIG.tapMaxDuration && distance < INPUT_CONFIG.swipeMinDistance) {
        const side = getScreenSide(e.clientX);
        const now = Date.now();

        // Check for double tap
        if (
          state.lastTapSide === side &&
          now - state.lastTapTime <= INPUT_CONFIG.doubleTapWindow
        ) {
          emitGesture("double_tap", e.clientX, e.clientY);
          state.lastTapTime = 0;
          state.lastTapSide = null;
        } else {
          // Single tap
          const tapType: GestureType = side === "left" ? "tap_left" : "tap_right";
          emitGesture(tapType, e.clientX, e.clientY);

          state.lastTapTime = now;
          state.lastTapSide = side;
        }
      }

      state.activePointers.delete(e.pointerId);
    },
    [enabled, emitGesture, clearHoldTimer, getScreenSide, calculateChargeLevel]
  );

  // Handle pointer cancel
  const handlePointerCancel = useCallback(
    (e: PointerEvent) => {
      const state = stateRef.current;
      state.activePointers.delete(e.pointerId);

      if (state.activePointers.size === 0) {
        state.isHolding = false;
        state.isTwoFingerHold = false;
        clearHoldTimer();
      }
    },
    [clearHoldTimer]
  );

  // Attach event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerCancel);

    // Prevent default touch behaviors
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault(); // Prevent pinch zoom
      }
    };
    container.addEventListener("touchstart", preventDefault, { passive: false });
    container.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerCancel);
      container.removeEventListener("touchstart", preventDefault);
      container.removeEventListener("touchmove", preventDefault);
      clearHoldTimer();
    };
  }, [
    containerRef,
    enabled,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    clearHoldTimer,
  ]);

  // Return current state for debugging
  return {
    activePointers: stateRef.current.activePointers.size,
    isHolding: stateRef.current.isHolding,
    isTwoFingerHold: stateRef.current.isTwoFingerHold,
  };
}
