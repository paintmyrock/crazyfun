// ============================================
// Crazy Fun Boxing - Type Definitions
// ============================================

// -------------------- Fighter Types --------------------

export type FighterId = "rocky" | "flash" | "bruno" | "phoenix";

export interface FighterStats {
  maxHealth: number;
  power: number; // Damage multiplier (1.0 = baseline)
  speed: number; // Attack speed multiplier (1.0 = baseline)
  defense: number; // Damage reduction (1.0 = baseline)
  stamina: number; // Max stamina/overheat capacity
  staminaRegen: number; // Stamina regen per second
  critChance: number; // 0-1 probability
}

export interface FighterTrait {
  id: string;
  name: string;
  description: string;
  type:
    | "stat_bonus"
    | "combo_extender"
    | "critical_chance"
    | "fury_mode"
    | "regen";
  value: number;
  threshold?: number; // For fury mode
}

export interface Fighter {
  id: FighterId;
  name: string;
  nickname: string;
  description: string;
  emoji: string;
  stats: FighterStats;
  trait: FighterTrait;
  unlockCost: number; // 0 = free/starter
  unlockLevel: number; // Required player level
}

// -------------------- Costume Types --------------------

export type CostumeId =
  | "default"
  | "chicken"
  | "knight"
  | "banana"
  | "astronaut"
  | "disco"
  | "superhero";

export type CostumeRarity = "common" | "rare" | "epic" | "legendary";

export interface CostumeUnlockRequirement {
  type: "free" | "coins" | "gloves" | "wins" | "level" | "achievement" | "combined";
  amount?: number;
  achievementId?: string;
  requirements?: CostumeUnlockRequirement[];
}

export interface Costume {
  id: CostumeId;
  name: string;
  description: string;
  emoji: string;
  rarity: CostumeRarity;
  unlockRequirement: CostumeUnlockRequirement;
}

// -------------------- Input Types --------------------

export type GestureType =
  | "tap_left"
  | "tap_right"
  | "double_tap"
  | "hold_start"
  | "hold_release"
  | "swipe_left"
  | "swipe_right"
  | "swipe_down"
  | "two_finger_hold"
  | "two_finger_release";

export interface TouchGesture {
  type: GestureType;
  x: number;
  y: number;
  timestamp: number;
  duration?: number;
  chargeLevel?: number;
  velocity?: number;
}

export type ActionType =
  | "jab_left"
  | "jab_right"
  | "combo_punch"
  | "power_punch"
  | "dodge_left"
  | "dodge_right"
  | "block"
  | "turtle_defense"
  | "release_defense";

export interface QueuedAction {
  type: ActionType;
  timestamp: number;
  chargeLevel?: number;
  expiresAt: number;
}

// -------------------- Punch Types --------------------

export type PunchType = "jab" | "hook" | "uppercut" | "body" | "power" | "combo";

export interface PunchData {
  type: PunchType;
  baseDamage: number;
  staminaCost: number;
  stunDamage: number;
  windupMs: number;
  recoveryMs: number;
  canCombo: boolean;
}

// -------------------- Combat State Types --------------------

export type FighterStateType =
  | "idle"
  | "attacking"
  | "blocking"
  | "dodging"
  | "stunned"
  | "recovering"
  | "knocked_down"
  | "victory"
  | "defeat";

export interface FighterRuntimeState {
  fighterId: FighterId;
  costumeId: CostumeId;

  // Position and animation
  x: number;
  y: number;
  facingRight: boolean;
  state: FighterStateType;
  animationFrame: number;
  stateStartTime: number;

  // Health and resources
  currentHealth: number;
  maxHealth: number;
  overheat: number; // 0-100
  isOverheated: boolean;
  stunMeter: number; // 0-100
  isStunned: boolean;
  stunEndTime: number;
  specialMeter: number; // 0-100

  // Combat tracking
  comboCount: number;
  lastHitTime: number;
  lastActionTime: number;

  // Defense state
  isBlocking: boolean;
  isTurtleDefense: boolean;
  isDodging: boolean;
  dodgeDirection: "left" | "right" | null;
  dodgeEndTime: number;
  invincibleUntil: number;

  // Current action
  currentAction: ActionType | null;
  actionEndTime: number;
  chargeLevel: number;
}

// -------------------- Match Types --------------------

export type MatchPhase =
  | "countdown"
  | "fighting"
  | "finisher"
  | "ko"
  | "round_end"
  | "match_end"
  | "paused";

export type DifficultyTier = "rookie" | "amateur" | "pro" | "champion" | "legend";

export interface MatchState {
  phase: MatchPhase;
  round: number;
  maxRounds: number;
  roundTimeMs: number;
  roundDurationMs: number;

  player: FighterRuntimeState;
  opponent: FighterRuntimeState;

  playerRoundWins: number;
  opponentRoundWins: number;

  difficulty: DifficultyTier;
  winner: "player" | "opponent" | null;

  // Effects
  hitEffects: HitEffect[];
  damageNumbers: DamageNumber[];

  // Timing
  matchStartTime: number;
  lastUpdateTime: number;

  // Finisher
  isFinisherWindow: boolean;
  finisherTimeRemaining: number;
  finisherGesture: FinisherGestureType | null;
}

export interface HitEffect {
  id: string;
  x: number;
  y: number;
  type: "impact" | "block" | "crit" | "miss" | "stun";
  startTime: number;
  durationMs: number;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  value: number;
  isCrit: boolean;
  startTime: number;
}

// -------------------- Finisher Types --------------------

export type FinisherGestureType =
  | "lightning_bolt"
  | "circle"
  | "rapid_alternating"
  | "swipe_sequence";

export interface FinisherGesture {
  type: FinisherGestureType;
  name: string;
  description: string;
  emoji: string;
  baseDamage: number;
  timeLimit: number;
}

export interface GesturePoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface FinisherState {
  isActive: boolean;
  gesture: FinisherGesture | null;
  startTime: number;
  tracePoints: GesturePoint[];
  tapSequence: Array<{ side: "left" | "right"; time: number }>;
  swipeSequence: Array<{ direction: string; time: number }>;
  progress: number;
  result: "pending" | "success" | "failure";
}

// -------------------- Progression Types --------------------

export interface Currencies {
  coins: number;
  gloves: number;
}

export interface FighterUpgrades {
  punchSpeed: number; // 0-10
  staminaCapacity: number; // 0-10
  overheatRecovery: number; // 0-10
  comboWindow: number; // 0-10
  specialChargeRate: number; // 0-10
}

export interface PlayerStatistics {
  totalFights: number;
  wins: number;
  losses: number;
  knockouts: number;
  perfectWins: number;
  totalDamageDealt: number;
  totalDamageReceived: number;
  longestWinStreak: number;
  currentWinStreak: number;
  highestCombo: number;
  finishersLanded: number;
}

export interface PlayerProgress {
  id: string;
  username: string;
  avatarEmoji: string;
  createdAt: number;

  xp: number;
  level: number;
  currencies: Currencies;

  selectedFighter: FighterId;
  selectedCostume: CostumeId;

  unlockedFighters: FighterId[];
  unlockedCostumes: CostumeId[];
  fighterUpgrades: Record<FighterId, FighterUpgrades>;

  achievements: string[];
  statistics: PlayerStatistics;
}

// -------------------- Reward Types --------------------

export interface FightReward {
  baseXp: number;
  bonusXp: number;
  coins: number;
  gloves: number;
  bonuses: RewardBonus[];
}

export interface RewardBonus {
  type: string;
  description: string;
  xpBonus?: number;
  coinBonus?: number;
  gloveBonus?: number;
}

// -------------------- AI Types --------------------

export type AIState =
  | "idle"
  | "attacking"
  | "blocking"
  | "dodging"
  | "stunned"
  | "recovering";

export interface AIBehavior {
  tier: DifficultyTier;
  reactionTimeMin: number;
  reactionTimeMax: number;
  blockProbability: number;
  dodgeProbability: number;
  attackFrequency: number;
  comboChance: number;
  heavyPunchChance: number;
  damageMultiplier: number;
  healthMultiplier: number;
  adaptationRate: number;
}

export interface AIRuntimeState {
  currentState: AIState;
  stateEnterTime: number;
  lastAttackTime: number;
  lastBlockTime: number;
  queuedAttack: PunchType | null;
  playerPatternHistory: PunchType[];
  predictedNextPunch: PunchType | null;
}

// -------------------- Upgrade Definition Types --------------------

export interface UpgradeDefinition {
  id: keyof FighterUpgrades;
  name: string;
  description: string;
  maxLevel: number;
  baseEffect: number;
  effectPerLevel: number;
  baseCost: number;
  costMultiplier: number;
  currencyType: "coins" | "gloves";
}
