# Crazy Fun Fusion Battler - Development Plan

## Overview
A deterministic fusion creature battler where players combine animals/objects to create unique creatures and battle them.

---

## Tech Stack (Leveraging Existing Setup)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React 19 + Vite (existing) | Already set up |
| Styling | Tailwind CSS (existing) | Pixel-art compatible |
| State | React Context + localStorage | Simple, no server needed for MVP |
| Backend | Supabase (future) | Can add later for multiplayer |
| Data | Static JSON files | Pre-generated fusions stored locally |

**MVP Approach**: Start with local-only gameplay, add Supabase later for trainer accounts and async PvP.

---

## Data Schema

### Base Entities (animals/objects)
```typescript
interface BaseEntity {
  id: string;
  name: string;
  type: "animal" | "object";
  elementalType: ElementType;
  imageUrl: string;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  move: Move;
}
```

### Fusion Creature
```typescript
interface FusionCreature {
  fusionKey: string;        // "entity1_entity2" (sorted alphabetically)
  name: string;             // e.g., "Rhinoboard"
  description: string;
  imageUrl: string;
  types: [ElementType, ElementType];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    specialPower: number;
  };
  moves: [Move, Move];      // One from each parent
}
```

### Move
```typescript
interface Move {
  id: string;
  name: string;
  type: ElementType;
  power: number;
  description: string;
}
```

### Elemental Types
```typescript
type ElementType =
  | "fire" | "water" | "earth" | "air"
  | "electric" | "nature" | "metal" | "cosmic";
```

### Type Effectiveness Chart
| Attacker → | Fire | Water | Earth | Air | Electric | Nature | Metal | Cosmic |
|------------|------|-------|-------|-----|----------|--------|-------|--------|
| Fire       | 1.0  | 0.75  | 1.0   | 1.5 | 1.0      | 1.5    | 0.75  | 1.0    |
| Water      | 1.5  | 1.0   | 0.75  | 1.0 | 0.75     | 1.5    | 1.0   | 1.0    |
| Earth      | 1.0  | 1.5   | 1.0   | 0.75| 1.5      | 0.75   | 1.5   | 1.0    |
| ... etc    |      |       |       |     |          |        |       |        |

---

## Screen Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Home      │────▶│  Trainer    │────▶│   Main      │
│   (Start)   │     │  Creation   │     │   Menu      │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
             ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
             │   Fusion    │           │ Collection  │           │   Arena     │
             │   Creator   │           │   (My Pets) │           │   (Battle)  │
             └─────────────┘           └─────────────┘           └─────────────┘
                    │                                                    │
                    ▼                                                    ▼
             ┌─────────────┐                                     ┌─────────────┐
             │   Fusion    │                                     │   Battle    │
             │   Result    │                                     │   Screen    │
             └─────────────┘                                     └─────────────┘
```

---

## Development Phases

### Phase 1: Core Data & Types (Day 1)
- [ ] Create TypeScript interfaces for all game entities
- [ ] Create base entity data (10 animals, 5 objects)
- [ ] Create fusion data for all combinations (15 entities = 105 fusions)
- [ ] Create move data
- [ ] Create type effectiveness chart

### Phase 2: Fusion Creator (Day 1-2)
- [ ] Entity selection grid (pick first entity)
- [ ] Entity selection grid (pick second entity)
- [ ] Fusion result display
- [ ] "Save to Collection" functionality
- [ ] Pixel-art style UI components

### Phase 3: Trainer & Collection (Day 2)
- [ ] Trainer creation screen (username + avatar picker)
- [ ] Trainer context (stored in localStorage)
- [ ] Collection screen showing saved fusions
- [ ] Trainer XP display

### Phase 4: Battle System (Day 2-3)
- [ ] Battle state machine
- [ ] Turn order calculation (speed-based)
- [ ] Damage calculation with type effectiveness
- [ ] Battle UI (health bars, move selection)
- [ ] Battle animations (simple CSS)
- [ ] Victory/defeat screens
- [ ] XP rewards

### Phase 5: Arena & AI Opponents (Day 3)
- [ ] Arena opponent selection
- [ ] Simple AI for opponent moves
- [ ] Match history

### Phase 6: Polish (Day 4)
- [ ] Sound effects
- [ ] Better animations
- [ ] Mobile responsiveness
- [ ] Tutorial/onboarding

---

## File Structure

```
client/src/
├── components/
│   ├── games/           # Existing games
│   └── battle/          # New battle game
│       ├── BattleGame.tsx       # Main game wrapper
│       ├── screens/
│       │   ├── MainMenu.tsx
│       │   ├── TrainerCreation.tsx
│       │   ├── FusionCreator.tsx
│       │   ├── FusionResult.tsx
│       │   ├── Collection.tsx
│       │   ├── Arena.tsx
│       │   └── BattleScreen.tsx
│       ├── components/
│       │   ├── EntityCard.tsx
│       │   ├── FusionCard.tsx
│       │   ├── HealthBar.tsx
│       │   ├── MoveButton.tsx
│       │   ├── TypeBadge.tsx
│       │   └── PixelSprite.tsx
│       └── ui/
│           ├── PixelButton.tsx
│           ├── PixelPanel.tsx
│           └── PixelText.tsx
├── data/
│   ├── gameData.ts      # Existing
│   └── battle/
│       ├── entities.ts  # Base animals/objects
│       ├── fusions.ts   # Pre-generated fusions
│       ├── moves.ts     # All moves
│       └── types.ts     # Type chart
├── contexts/
│   ├── ThemeContext.tsx # Existing
│   └── TrainerContext.tsx
├── hooks/
│   └── battle/
│       ├── useBattle.ts
│       └── useFusion.ts
└── utils/
    ├── audio.ts         # Existing
    └── battle/
        ├── battleEngine.ts
        ├── damageCalc.ts
        └── fusionKey.ts
```

---

## Starter Data (Phase 1)

### Animals (10)
1. **Rhino** - Earth - Charge attack
2. **Eagle** - Air - Dive attack
3. **Shark** - Water - Bite attack
4. **Dragon** - Fire - Flame attack
5. **Wolf** - Nature - Howl attack
6. **Tiger** - Nature - Pounce attack
7. **Octopus** - Water - Ink attack
8. **Phoenix** - Fire - Rebirth attack
9. **Turtle** - Earth - Shell attack
10. **Eel** - Electric - Shock attack

### Objects (5)
1. **Skateboard** - Air - Kickflip attack
2. **Robot** - Metal - Laser attack
3. **Crystal** - Cosmic - Beam attack
4. **Volcano** - Fire - Eruption attack
5. **Thunder Cloud** - Electric - Lightning attack

---

## Battle Formula

```typescript
damage = ((attack / defense) * movePower * typeMultiplier * 0.5) + randomVariance(0.9, 1.1)
```

- `typeMultiplier`: 1.5 (super effective), 1.0 (neutral), 0.75 (not effective)
- Typical HP: 80-120
- Typical Attack/Defense: 40-80
- Move Power: 30-60
- Expected turns to KO: 4-7

---

## Next Steps

1. **Start with Phase 1**: Create data files and TypeScript types
2. **Build Fusion Creator**: Most fun/visual feature first
3. **Add Battle System**: Core gameplay loop
4. **Polish and expand**: More entities, better art

Ready to begin?
