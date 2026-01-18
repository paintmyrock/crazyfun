import { BaseEntity, FusionCreature, ElementType } from "@/data/battle/types";

/**
 * Generate a deterministic fusion key from two entity IDs
 * Always sorted alphabetically so A+B == B+A
 */
export function generateFusionKey(idA: string, idB: string): string {
  const sorted = [idA, idB].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

/**
 * Generate a fusion name from two entity names
 */
export function generateFusionName(nameA: string, nameB: string): string {
  // Take first half of first name and second half of second name
  const halfA = nameA.slice(0, Math.ceil(nameA.length / 2));
  const halfB = nameB.slice(Math.floor(nameB.length / 2));
  return halfA + halfB.toLowerCase();
}

/**
 * Generate combined emoji for fusion
 */
export function generateFusionEmoji(emojiA: string, emojiB: string): string {
  return `${emojiA}${emojiB}`;
}

/**
 * Calculate fusion stats from two parents
 */
export function calculateFusionStats(
  entityA: BaseEntity,
  entityB: BaseEntity
): FusionCreature["stats"] {
  const statsA = entityA.baseStats;
  const statsB = entityB.baseStats;

  // Average the stats with a small bonus
  const fusionBonus = 1.1;

  return {
    hp: Math.round(((statsA.hp + statsB.hp) / 2) * fusionBonus),
    attack: Math.round(((statsA.attack + statsB.attack) / 2) * fusionBonus),
    defense: Math.round(((statsA.defense + statsB.defense) / 2) * fusionBonus),
    speed: Math.round(((statsA.speed + statsB.speed) / 2) * fusionBonus),
    specialPower: Math.round(
      ((statsA.attack + statsB.attack + statsA.defense + statsB.defense) / 4) *
        fusionBonus
    ),
  };
}

/**
 * Generate a fusion description
 */
export function generateFusionDescription(
  entityA: BaseEntity,
  entityB: BaseEntity
): string {
  const templates = [
    `A powerful fusion of ${entityA.name} and ${entityB.name}!`,
    `When ${entityA.name} meets ${entityB.name}, amazing things happen!`,
    `The legendary combination of ${entityA.name} and ${entityB.name}!`,
    `Born from the union of ${entityA.name} and ${entityB.name}!`,
    `${entityA.name} + ${entityB.name} = AWESOME!`,
  ];

  // Use fusion key to deterministically pick a template
  const key = generateFusionKey(entityA.id, entityB.id);
  const index = key.charCodeAt(0) % templates.length;
  return templates[index];
}

/**
 * Create a full fusion creature from two base entities
 */
export function createFusion(
  entityA: BaseEntity,
  entityB: BaseEntity
): FusionCreature {
  // Sort by ID to ensure deterministic order
  const [first, second] =
    entityA.id < entityB.id ? [entityA, entityB] : [entityB, entityA];

  return {
    fusionKey: generateFusionKey(first.id, second.id),
    name: generateFusionName(first.name, second.name),
    description: generateFusionDescription(first, second),
    imageEmoji: generateFusionEmoji(first.imageEmoji, second.imageEmoji),
    types: [first.elementalType, second.elementalType] as [
      ElementType,
      ElementType
    ],
    stats: calculateFusionStats(first, second),
    moves: [first.move, second.move],
    parentIds: [first.id, second.id],
  };
}
