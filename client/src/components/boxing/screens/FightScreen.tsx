// ============================================
// Crazy Fun Boxing - Fight Screen
// ============================================

import { useRef, useCallback, useState, useEffect } from "react";
import { useBoxing } from "@/contexts/BoxingContext";
import { BoxingCanvas } from "../canvas/BoxingCanvas";
import { HealthBar } from "../components/HealthBar";
import { StaminaBar } from "../components/StaminaBar";
import { useTouchInput } from "@/hooks/boxing/useTouchInput";
import { useGameLoop } from "@/hooks/boxing/useGameLoop";
import {
  MatchState,
  FighterRuntimeState,
  DifficultyTier,
  TouchGesture,
} from "@/data/boxing/types";
import { processGesture, createInputProcessor, getNextAction } from "@/utils/boxing/inputProcessor";
import {
  resolveAttack,
  getPunchTypeFromAction,
  getActionTiming,
  updateOverheatRecovery,
  updateStunDecay,
  checkStunRecovery,
} from "@/utils/boxing/combatEngine";
import {
  makeDecision,
  createAIState,
  updateAIState,
  getBehavior,
  adaptBehavior,
  recordPlayerPunch,
} from "@/utils/boxing/aiController";
import { getFighterById, getEffectiveFighterStats } from "@/data/boxing/fighters";
import { MATCH_CONFIG } from "@/data/boxing/config";

interface FightScreenProps {
  difficulty: DifficultyTier;
  onEnd: (result: FightResult) => void;
  onPause: () => void;
}

export interface FightResult {
  won: boolean;
  knockdowns: number;
  maxCombo: number;
  damageDealt: number;
  damageReceived: number;
  usedFinisher: boolean;
  perfectWin: boolean;
  rounds: number;
}

// Create initial fighter runtime state
function createFighterState(
  fighterId: string,
  costumeId: string,
  facingRight: boolean,
  healthMultiplier: number = 1
): FighterRuntimeState {
  const fighter = getFighterById(fighterId as any);
  const maxHealth = Math.floor((fighter?.stats.maxHealth || 100) * healthMultiplier);

  return {
    fighterId: fighterId as any,
    costumeId: costumeId as any,
    x: 0,
    y: 0,
    facingRight,
    state: "idle",
    animationFrame: 0,
    stateStartTime: Date.now(),
    currentHealth: maxHealth,
    maxHealth,
    overheat: 0,
    isOverheated: false,
    stunMeter: 0,
    isStunned: false,
    stunEndTime: 0,
    specialMeter: 0,
    comboCount: 0,
    lastHitTime: 0,
    lastActionTime: 0,
    isBlocking: false,
    isTurtleDefense: false,
    isDodging: false,
    dodgeDirection: null,
    dodgeEndTime: 0,
    invincibleUntil: 0,
    currentAction: null,
    actionEndTime: 0,
    chargeLevel: 0,
  };
}

// Create initial match state
function createMatchState(
  player: ReturnType<typeof useBoxing>["player"],
  difficulty: DifficultyTier
): MatchState {
  const behavior = getBehavior(difficulty);

  return {
    phase: "countdown",
    round: 1,
    maxRounds: MATCH_CONFIG.maxRounds,
    roundTimeMs: 0,
    roundDurationMs: MATCH_CONFIG.roundDurationMs,
    player: createFighterState(
      player?.selectedFighter || "rocky",
      player?.selectedCostume || "default",
      true
    ),
    opponent: createFighterState(
      "rocky", // AI always uses rocky for now
      "default",
      false,
      behavior.healthMultiplier
    ),
    playerRoundWins: 0,
    opponentRoundWins: 0,
    difficulty,
    winner: null,
    hitEffects: [],
    damageNumbers: [],
    matchStartTime: Date.now(),
    lastUpdateTime: Date.now(),
    isFinisherWindow: false,
    finisherTimeRemaining: 0,
    finisherGesture: null,
  };
}

export function FightScreen({ difficulty, onEnd, onPause }: FightScreenProps) {
  const { player } = useBoxing();
  const containerRef = useRef<HTMLDivElement>(null);

  // Game state
  const [matchState, setMatchState] = useState<MatchState>(() =>
    createMatchState(player, difficulty)
  );
  const [screenShake, setScreenShake] = useState(0);

  // Refs for game state that updates frequently
  const inputProcessorRef = useRef(createInputProcessor());
  const aiStateRef = useRef(createAIState());
  const statsRef = useRef({
    knockdowns: 0,
    maxCombo: 0,
    damageDealt: 0,
    damageReceived: 0,
    usedFinisher: false,
  });

  // Handle gesture input
  const handleGesture = useCallback(
    (gesture: TouchGesture) => {
      if (matchState.phase !== "fighting") return;

      const result = processGesture(gesture, inputProcessorRef.current, matchState.player);
      if (result.rejected) {
        console.log("Input rejected:", result.rejectReason);
      }
    },
    [matchState.phase, matchState.player]
  );

  // Touch input
  useTouchInput({
    onGesture: handleGesture,
    enabled: matchState.phase === "fighting",
    containerRef,
  });

  // Game update function
  const update = useCallback(
    (deltaMs: number) => {
      setMatchState((prev) => {
        const now = Date.now();
        let newState = { ...prev };

        // Phase-specific updates
        switch (prev.phase) {
          case "countdown": {
            const elapsed = now - prev.matchStartTime;
            if (elapsed >= MATCH_CONFIG.countdownDurationMs) {
              newState.phase = "fighting";
              newState.roundTimeMs = 0;
            }
            break;
          }

          case "fighting": {
            // Update round time
            newState.roundTimeMs += deltaMs;

            // Update player state
            newState.player = updateFighterState(prev.player, deltaMs);

            // Update opponent state
            newState.opponent = updateFighterState(prev.opponent, deltaMs);

            // Process player input
            const playerAction = getNextAction(inputProcessorRef.current);
            if (playerAction && prev.player.state === "idle") {
              newState = executePlayerAction(newState, playerAction.type, playerAction.chargeLevel);
            }

            // AI decision making
            const behavior = adaptBehavior(
              getBehavior(prev.difficulty),
              prev.opponent,
              prev.player
            );
            const aiDecision = makeDecision(aiStateRef.current, prev.opponent, prev.player, behavior);

            if (aiDecision.action && prev.opponent.state === "idle") {
              newState = executeAIAction(newState, aiDecision.action);
            }

            // Clean up expired effects
            newState.hitEffects = prev.hitEffects.filter(
              (e) => now - e.startTime < e.durationMs
            );
            newState.damageNumbers = prev.damageNumbers.filter(
              (d) => now - d.startTime < 1000
            );

            // Check win conditions
            if (prev.player.currentHealth <= 0) {
              newState.phase = "ko";
              newState.opponent.state = "victory";
              newState.player.state = "defeat";
            } else if (prev.opponent.currentHealth <= 0) {
              newState.phase = "ko";
              newState.player.state = "victory";
              newState.opponent.state = "defeat";
            } else if (prev.roundTimeMs >= MATCH_CONFIG.roundDurationMs) {
              // Time's up - whoever has more health wins
              if (prev.player.currentHealth > prev.opponent.currentHealth) {
                newState.playerRoundWins++;
              } else {
                newState.opponentRoundWins++;
              }
              newState.phase = "round_end";
            }

            break;
          }

          case "ko": {
            // Wait for KO animation
            const koElapsed = now - prev.lastUpdateTime;
            if (koElapsed >= MATCH_CONFIG.koAnimationDurationMs) {
              // Determine round winner
              if (prev.player.currentHealth <= 0) {
                newState.opponentRoundWins++;
                statsRef.current.knockdowns++;
              } else {
                newState.playerRoundWins++;
              }
              newState.phase = "round_end";
            }
            break;
          }

          case "round_end": {
            // Check match winner
            const roundsToWin = Math.ceil(MATCH_CONFIG.maxRounds / 2);

            if (prev.playerRoundWins >= roundsToWin) {
              newState.winner = "player";
              newState.phase = "match_end";
            } else if (prev.opponentRoundWins >= roundsToWin) {
              newState.winner = "opponent";
              newState.phase = "match_end";
            } else if (prev.round < MATCH_CONFIG.maxRounds) {
              // Next round
              newState.round++;
              newState.roundTimeMs = 0;
              newState.phase = "countdown";
              newState.matchStartTime = now;

              // Restore some health
              newState.player.currentHealth = Math.min(
                newState.player.maxHealth,
                newState.player.currentHealth +
                  newState.player.maxHealth * MATCH_CONFIG.healthRegenBetweenRounds
              );
              newState.opponent.currentHealth = Math.min(
                newState.opponent.maxHealth,
                newState.opponent.currentHealth +
                  newState.opponent.maxHealth * MATCH_CONFIG.healthRegenBetweenRounds
              );

              // Reset states
              newState.player.state = "idle";
              newState.opponent.state = "idle";
              newState.player.overheat = 0;
              newState.opponent.overheat = 0;
            }
            break;
          }

          case "match_end": {
            // End the match
            const won = prev.winner === "player";
            const perfectWin =
              won &&
              prev.player.currentHealth === prev.player.maxHealth &&
              statsRef.current.damageReceived === 0;

            onEnd({
              won,
              knockdowns: statsRef.current.knockdowns,
              maxCombo: statsRef.current.maxCombo,
              damageDealt: statsRef.current.damageDealt,
              damageReceived: statsRef.current.damageReceived,
              usedFinisher: statsRef.current.usedFinisher,
              perfectWin,
              rounds: prev.round,
            });
            break;
          }
        }

        newState.lastUpdateTime = now;
        return newState;
      });
    },
    [onEnd]
  );

  // Render function
  const render = useCallback(() => {
    // Update animation frames
    setMatchState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        animationFrame: prev.player.animationFrame + 1,
      },
      opponent: {
        ...prev.opponent,
        animationFrame: prev.opponent.animationFrame + 1,
      },
    }));
  }, []);

  // Game loop
  useGameLoop({
    onUpdate: update,
    onRender: render,
    enabled: matchState.phase !== "match_end" && matchState.phase !== "paused",
  });

  // Screen shake decay
  useEffect(() => {
    if (screenShake > 0) {
      const timer = setTimeout(() => {
        setScreenShake((s) => Math.max(0, s - 0.2));
      }, 16);
      return () => clearTimeout(timer);
    }
  }, [screenShake]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden touch-none"
    >
      {/* Canvas */}
      <BoxingCanvas
        matchState={matchState}
        width={window.innerWidth}
        height={window.innerHeight}
        screenShake={screenShake}
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Opponent Health (Top) */}
        <div className="absolute top-4 left-4 right-4">
          <HealthBar
            current={matchState.opponent.currentHealth}
            max={matchState.opponent.maxHealth}
            isPlayer={false}
          />
        </div>

        {/* Player Health & Stamina (Bottom) */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <StaminaBar
            overheat={matchState.player.overheat}
            isOverheated={matchState.player.isOverheated}
          />
          <HealthBar
            current={matchState.player.currentHealth}
            max={matchState.player.maxHealth}
            isPlayer={true}
          />
        </div>

        {/* Round Info */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 text-white text-center">
          <div className="text-sm font-bold">Round {matchState.round}</div>
          <div className="text-xs">
            {Math.max(0, Math.floor((MATCH_CONFIG.roundDurationMs - matchState.roundTimeMs) / 1000))}s
          </div>
        </div>

        {/* Pause Button */}
        <button
          onClick={onPause}
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full pointer-events-auto"
        >
          <span className="text-white text-xl">⏸</span>
        </button>
      </div>
    </div>
  );
}

// Helper function to update fighter state
function updateFighterState(fighter: FighterRuntimeState, deltaMs: number): FighterRuntimeState {
  const now = Date.now();
  let updated = { ...fighter };

  // Update overheat recovery
  const overheatResult = updateOverheatRecovery(
    fighter.overheat,
    fighter.lastActionTime,
    deltaMs
  );
  updated.overheat = overheatResult.overheat;
  updated.isOverheated = overheatResult.isOverheated;

  // Update stun decay
  updated.stunMeter = updateStunDecay(fighter.stunMeter, fighter.lastHitTime, deltaMs);

  // Check stun recovery
  const stunResult = checkStunRecovery(fighter.isStunned, fighter.stunEndTime);
  updated.isStunned = stunResult.isStunned;
  if (!stunResult.isStunned && fighter.isStunned) {
    updated.state = "idle";
  }

  // Update action state
  if (fighter.actionEndTime > 0 && now >= fighter.actionEndTime) {
    updated.state = "idle";
    updated.currentAction = null;
    updated.actionEndTime = 0;
  }

  // Update dodge state
  if (fighter.isDodging && now >= fighter.dodgeEndTime) {
    updated.isDodging = false;
    updated.dodgeDirection = null;
    updated.state = "idle";
  }

  return updated;
}

// Helper to execute player action
function executePlayerAction(
  state: MatchState,
  action: string,
  chargeLevel?: number
): MatchState {
  const punchType = getPunchTypeFromAction(action as any);
  if (!punchType) {
    // Handle non-attack actions
    if (action === "block") {
      return {
        ...state,
        player: { ...state.player, isBlocking: true, state: "blocking" },
      };
    }
    if (action === "turtle_defense") {
      return {
        ...state,
        player: { ...state.player, isTurtleDefense: true, isBlocking: true, state: "blocking" },
      };
    }
    if (action.includes("dodge")) {
      const direction = action.includes("left") ? "left" : "right";
      const now = Date.now();
      return {
        ...state,
        player: {
          ...state.player,
          isDodging: true,
          dodgeDirection: direction as any,
          state: "dodging",
          dodgeEndTime: now + 350,
          invincibleUntil: now + 200,
        },
      };
    }
    if (action === "release_defense") {
      return {
        ...state,
        player: { ...state.player, isBlocking: false, isTurtleDefense: false, state: "idle" },
      };
    }
    return state;
  }

  // Execute attack
  const fighter = getFighterById(state.player.fighterId);
  const playerStats = getEffectiveFighterStats(fighter!, state.player.currentHealth, state.round);
  const opponentFighter = getFighterById(state.opponent.fighterId);
  const opponentStats = opponentFighter!.stats;

  const combatResult = resolveAttack(
    state.player,
    state.opponent,
    playerStats,
    opponentStats,
    punchType,
    { chargeLevel }
  );

  const timing = getActionTiming(action as any, playerStats.speed, state.player.isOverheated);

  return {
    ...state,
    player: {
      ...state.player,
      ...combatResult.attackerState,
      state: "attacking",
      currentAction: action as any,
      actionEndTime: Date.now() + timing.totalMs,
    },
    opponent: {
      ...state.opponent,
      ...combatResult.defenderState,
    },
    hitEffects: [...state.hitEffects, ...combatResult.effects],
    damageNumbers: [...state.damageNumbers, ...combatResult.damageNumbers],
  };
}

// Helper to execute AI action
function executeAIAction(state: MatchState, action: string): MatchState {
  // Similar to player action but for AI
  const punchType = getPunchTypeFromAction(action as any);
  if (!punchType) {
    if (action === "block") {
      return {
        ...state,
        opponent: { ...state.opponent, isBlocking: true, state: "blocking" },
      };
    }
    if (action.includes("dodge")) {
      const direction = action.includes("left") ? "left" : "right";
      const now = Date.now();
      return {
        ...state,
        opponent: {
          ...state.opponent,
          isDodging: true,
          dodgeDirection: direction as any,
          state: "dodging",
          dodgeEndTime: now + 350,
          invincibleUntil: now + 200,
        },
      };
    }
    if (action === "release_defense") {
      return {
        ...state,
        opponent: { ...state.opponent, isBlocking: false, state: "idle" },
      };
    }
    return state;
  }

  const behavior = getBehavior(state.difficulty);
  const opponentFighter = getFighterById(state.opponent.fighterId);
  const opponentStats = {
    ...opponentFighter!.stats,
    power: opponentFighter!.stats.power * behavior.damageMultiplier,
  };
  const playerFighter = getFighterById(state.player.fighterId);
  const playerStats = playerFighter!.stats;

  const combatResult = resolveAttack(
    state.opponent,
    state.player,
    opponentStats,
    playerStats,
    punchType,
    {}
  );

  const timing = getActionTiming(action as any, opponentStats.speed, state.opponent.isOverheated);

  return {
    ...state,
    opponent: {
      ...state.opponent,
      ...combatResult.attackerState,
      state: "attacking",
      currentAction: action as any,
      actionEndTime: Date.now() + timing.totalMs,
    },
    player: {
      ...state.player,
      ...combatResult.defenderState,
    },
    hitEffects: [...state.hitEffects, ...combatResult.effects],
    damageNumbers: [...state.damageNumbers, ...combatResult.damageNumbers],
  };
}

export default FightScreen;
