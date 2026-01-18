import { FusionCreature, Move, BattleState, getTypeMultiplier } from "@/data/battle/types";

/**
 * Calculate damage for a move
 */
export function calculateDamage(
  attacker: FusionCreature,
  defender: FusionCreature,
  move: Move
): { damage: number; effectiveness: "super" | "normal" | "weak" } {
  const attack = attacker.stats.attack;
  const defense = defender.stats.defense;
  const power = move.power;

  // Get type effectiveness
  const typeMultiplier = getTypeMultiplier(move.type, defender.types);

  // Calculate base damage
  const baseDamage = ((attack / defense) * power * typeMultiplier * 0.5);

  // Add random variance (0.9 to 1.1)
  const variance = 0.9 + Math.random() * 0.2;
  const finalDamage = Math.round(baseDamage * variance);

  // Determine effectiveness message
  let effectiveness: "super" | "normal" | "weak" = "normal";
  if (typeMultiplier > 1.2) effectiveness = "super";
  else if (typeMultiplier < 0.9) effectiveness = "weak";

  return {
    damage: Math.max(1, finalDamage), // Minimum 1 damage
    effectiveness,
  };
}

/**
 * Determine who goes first based on speed
 */
export function determineFirstTurn(
  playerFusion: FusionCreature,
  opponentFusion: FusionCreature
): boolean {
  if (playerFusion.stats.speed === opponentFusion.stats.speed) {
    // Random tiebreaker
    return Math.random() > 0.5;
  }
  return playerFusion.stats.speed > opponentFusion.stats.speed;
}

/**
 * Initialize a new battle
 */
export function initializeBattle(
  playerFusion: FusionCreature,
  opponentFusion: FusionCreature
): BattleState {
  const isPlayerFirst = determineFirstTurn(playerFusion, opponentFusion);

  return {
    playerFusion,
    opponentFusion,
    playerHp: playerFusion.stats.hp,
    opponentHp: opponentFusion.stats.hp,
    turn: 1,
    isPlayerTurn: isPlayerFirst,
    battleLog: [
      `Battle Start! ${playerFusion.name} vs ${opponentFusion.name}!`,
      isPlayerFirst
        ? `${playerFusion.name} is faster and goes first!`
        : `${opponentFusion.name} is faster and goes first!`,
    ],
    status: "battling",
  };
}

/**
 * Execute a turn in battle
 */
export function executeTurn(
  state: BattleState,
  move: Move,
  isPlayer: boolean
): BattleState {
  const attacker = isPlayer ? state.playerFusion : state.opponentFusion;
  const defender = isPlayer ? state.opponentFusion : state.playerFusion;

  const { damage, effectiveness } = calculateDamage(attacker, defender, move);

  // Create log message
  let logMessage = `${attacker.name} used ${move.name}!`;
  if (effectiveness === "super") {
    logMessage += " It's super effective! 💥";
  } else if (effectiveness === "weak") {
    logMessage += " It's not very effective... 😕";
  }
  logMessage += ` ${damage} damage!`;

  // Calculate new HP
  const newPlayerHp = isPlayer
    ? state.playerHp
    : Math.max(0, state.playerHp - damage);
  const newOpponentHp = isPlayer
    ? Math.max(0, state.opponentHp - damage)
    : state.opponentHp;

  // Check for battle end
  let status: BattleState["status"] = "battling";
  const newLog = [...state.battleLog, logMessage];

  if (newOpponentHp <= 0) {
    status = "victory";
    newLog.push(`${state.opponentFusion.name} fainted! You win! 🎉`);
  } else if (newPlayerHp <= 0) {
    status = "defeat";
    newLog.push(`${state.playerFusion.name} fainted! You lose... 😢`);
  }

  return {
    ...state,
    playerHp: newPlayerHp,
    opponentHp: newOpponentHp,
    turn: state.turn + 1,
    isPlayerTurn: !state.isPlayerTurn,
    battleLog: newLog,
    status,
  };
}

/**
 * AI move selection (simple random for now)
 */
export function selectAIMove(fusion: FusionCreature): Move {
  const randomIndex = Math.floor(Math.random() * fusion.moves.length);
  return fusion.moves[randomIndex];
}

/**
 * Calculate XP reward from battle
 */
export function calculateXpReward(
  won: boolean,
  opponentLevel: number = 1
): number {
  const baseXp = won ? 50 : 10;
  return baseXp + opponentLevel * 5;
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
  // Simple formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Get XP needed for next level
 */
export function getXpForNextLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 100;
}
