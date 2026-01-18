// Elemental Types
export type ElementType =
  | "fire"
  | "water"
  | "earth"
  | "air"
  | "electric"
  | "nature"
  | "metal"
  | "cosmic";

// Type effectiveness chart: attackType -> defenseType -> multiplier
export const TYPE_CHART: Record<ElementType, Record<ElementType, number>> = {
  fire: {
    fire: 1.0,
    water: 0.75,
    earth: 1.0,
    air: 1.5,
    electric: 1.0,
    nature: 1.5,
    metal: 1.5,
    cosmic: 1.0,
  },
  water: {
    fire: 1.5,
    water: 1.0,
    earth: 0.75,
    air: 1.0,
    electric: 0.75,
    nature: 1.0,
    metal: 1.0,
    cosmic: 1.0,
  },
  earth: {
    fire: 1.0,
    water: 1.5,
    earth: 1.0,
    air: 0.75,
    electric: 1.5,
    nature: 0.75,
    metal: 1.5,
    cosmic: 1.0,
  },
  air: {
    fire: 0.75,
    water: 1.0,
    earth: 1.5,
    air: 1.0,
    electric: 0.75,
    nature: 1.0,
    metal: 1.0,
    cosmic: 1.5,
  },
  electric: {
    fire: 1.0,
    water: 1.5,
    earth: 0.75,
    air: 1.5,
    electric: 1.0,
    nature: 1.0,
    metal: 1.5,
    cosmic: 0.75,
  },
  nature: {
    fire: 0.75,
    water: 1.5,
    earth: 1.5,
    air: 1.0,
    electric: 1.0,
    nature: 1.0,
    metal: 0.75,
    cosmic: 1.0,
  },
  metal: {
    fire: 0.75,
    water: 1.0,
    earth: 0.75,
    air: 1.0,
    electric: 0.75,
    nature: 1.5,
    metal: 1.0,
    cosmic: 1.5,
  },
  cosmic: {
    fire: 1.0,
    water: 1.0,
    earth: 1.0,
    air: 0.75,
    electric: 1.5,
    nature: 1.0,
    metal: 0.75,
    cosmic: 1.5,
  },
};

// Get type effectiveness multiplier
export function getTypeMultiplier(
  attackType: ElementType,
  defenseTypes: ElementType[]
): number {
  let multiplier = 1.0;
  for (const defType of defenseTypes) {
    multiplier *= TYPE_CHART[attackType][defType];
  }
  return multiplier;
}

// Type colors for UI
export const TYPE_COLORS: Record<ElementType, { bg: string; text: string }> = {
  fire: { bg: "bg-orange-500", text: "text-white" },
  water: { bg: "bg-blue-500", text: "text-white" },
  earth: { bg: "bg-amber-700", text: "text-white" },
  air: { bg: "bg-sky-300", text: "text-gray-800" },
  electric: { bg: "bg-yellow-400", text: "text-gray-800" },
  nature: { bg: "bg-green-500", text: "text-white" },
  metal: { bg: "bg-gray-400", text: "text-gray-800" },
  cosmic: { bg: "bg-purple-600", text: "text-white" },
};

// Type emoji for fun display
export const TYPE_EMOJI: Record<ElementType, string> = {
  fire: "🔥",
  water: "💧",
  earth: "🪨",
  air: "💨",
  electric: "⚡",
  nature: "🌿",
  metal: "⚙️",
  cosmic: "✨",
};

// Move interface
export interface Move {
  id: string;
  name: string;
  type: ElementType;
  power: number;
  description: string;
}

// Base entity (animal or object)
export interface BaseEntity {
  id: string;
  name: string;
  category: "animal" | "object";
  elementalType: ElementType;
  imageEmoji: string; // Using emoji for MVP, replace with pixel art later
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  move: Move;
}

// Fusion creature (result of combining two entities)
export interface FusionCreature {
  fusionKey: string;
  name: string;
  description: string;
  imageEmoji: string; // Combined emoji for MVP
  types: [ElementType, ElementType];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    specialPower: number;
  };
  moves: [Move, Move];
  parentIds: [string, string];
}

// Trainer profile
export interface Trainer {
  id: string;
  username: string;
  avatarEmoji: string;
  xp: number;
  level: number;
  createdAt: number;
}

// Saved fusion in collection
export interface SavedFusion {
  fusion: FusionCreature;
  nickname?: string;
  savedAt: number;
  wins: number;
  losses: number;
}

// Battle state
export interface BattleState {
  playerFusion: FusionCreature;
  opponentFusion: FusionCreature;
  playerHp: number;
  opponentHp: number;
  turn: number;
  isPlayerTurn: boolean;
  battleLog: string[];
  status: "selecting" | "battling" | "victory" | "defeat";
}
