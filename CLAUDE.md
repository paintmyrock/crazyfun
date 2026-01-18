# CLAUDE.md - Crazy Fun Project Context

This file provides Claude with essential project context for longitudinal development sessions.

## Project Overview

**Crazy Random Fun Zone** is a playful, interactive website designed for kids (~10 years old). It features silly sounds, dancing Pokemon, emoji face generators, and random fun facts.

### Target Audience
- Children around 10 years old
- Designed to be silly, fun, and engaging
- Safe, family-friendly content

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vite 7 |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | Custom + Radix UI primitives |
| Routing | wouter |
| Notifications | sonner |
| Effects | canvas-confetti |
| Audio | Web Audio API |

---

## Project Structure

```
crazyfun/
├── client/
│   ├── public/
│   │   └── images/          # Pokemon and activity images
│   ├── src/
│   │   ├── components/
│   │   │   ├── battle/      # Crazy Fusion Battler game
│   │   │   │   ├── components/  # Shared battle components
│   │   │   │   │   ├── EntityCard.tsx
│   │   │   │   │   ├── FusionCard.tsx
│   │   │   │   │   └── HealthBar.tsx
│   │   │   │   ├── screens/     # Battle game screens
│   │   │   │   │   ├── Arena.tsx
│   │   │   │   │   ├── BattleScreen.tsx
│   │   │   │   │   ├── Collection.tsx
│   │   │   │   │   ├── FusionCreator.tsx
│   │   │   │   │   ├── MainMenu.tsx
│   │   │   │   │   └── TrainerCreation.tsx
│   │   │   │   ├── ui/          # Battle-specific UI
│   │   │   │   │   ├── PixelButton.tsx
│   │   │   │   │   └── PixelPanel.tsx
│   │   │   │   └── BattleGame.tsx
│   │   │   ├── games/       # Mini-game components
│   │   │   │   ├── BattleGameCard.tsx
│   │   │   │   ├── DanceBattleArena.tsx
│   │   │   │   ├── GameCard.tsx
│   │   │   │   ├── PikachuDanceParty.tsx
│   │   │   │   ├── RandomFactCard.tsx
│   │   │   │   ├── SillyFaceMaker.tsx
│   │   │   │   ├── SillySoundMachine.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ui/          # Base UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   └── tooltip.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── contexts/
│   │   │   ├── ThemeContext.tsx
│   │   │   └── TrainerContext.tsx  # Battle game state
│   │   ├── data/
│   │   │   ├── battle/      # Battle game data
│   │   │   │   ├── entities.ts   # Base animals & objects
│   │   │   │   └── types.ts      # TypeScript interfaces
│   │   │   └── gameData.ts  # Constants (sounds, facts, faces)
│   │   ├── lib/
│   │   │   └── utils.ts     # Tailwind utilities
│   │   ├── pages/
│   │   │   ├── BattlePage.tsx
│   │   │   ├── Home.tsx     # Main page
│   │   │   └── NotFound.tsx
│   │   ├── utils/
│   │   │   ├── audio.ts     # Web Audio API utilities
│   │   │   └── battle/      # Battle game utilities
│   │   │       ├── battleEngine.ts
│   │   │       └── fusionKey.ts
│   │   ├── App.tsx
│   │   ├── index.css        # Tailwind + custom styles
│   │   └── main.tsx         # Entry point
│   └── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Design Philosophy

**Cartoon Explosion Lab** - Nickelodeon-inspired aesthetic:
- Thick black outlines (3-5px) on containers
- Bright saturated colors (hot pink, lime green, electric blue, sunny yellow)
- Bouncy, elastic animations with squash-and-stretch
- Cartoon-style shadows (offset solid shadows, not gradients)
- Wobbly, organic shapes

### Brand Colors (in oklch)
- **Primary**: Hot pink `oklch(0.65 0.25 330)`
- **Secondary**: Lime green `oklch(0.75 0.20 130)`
- **Accent**: Electric blue `oklch(0.70 0.22 250)`
- **Destructive**: Sunny yellow `oklch(0.72 0.24 30)`

### Typography
- Headings: Fredoka (Google Fonts)
- Subheadings: Baloo 2 (Google Fonts)
- Body: Nunito (Google Fonts)

---

## Features / Mini-Games

1. **Silly Sound Machine** - Makes random sounds using Web Audio API
2. **Silly Face Maker** - Generates random emoji face combinations
3. **Pikachu Twerk Party** - Animated dancing Pikachu
4. **Dance Battle Arena** - Vote for your favorite dancing Pokemon
5. **Random Fun Facts** - Displays silly animal facts
6. **Crazy Fusion Battler** - Full-featured creature battler game (see below)

### Crazy Mode
Activating "Crazy Mode" triggers:
- Confetti explosion
- Screen shake animation
- Floating/flying elements

---

## Crazy Fusion Battler

A deterministic fusion creature battler designed for kids ages 7-12. Accessible at `/battle`.

### Game Flow
1. **Trainer Creation** - Username + avatar selection
2. **Main Menu** - Hub to access Fusion Lab, Collection, Arena
3. **Fusion Creator** - Combine 2 entities (animals/objects) to create fusions
4. **Collection** - View saved fusions with win/loss stats
5. **Arena** - Select fighter and opponent, then battle
6. **Battle Screen** - Turn-based combat with move selection

### Core Mechanics

**Entity Types**: Fire, Water, Electric, Earth, Air, Cosmic, Mechanical, Toxic
- 10 base animals (Rhino, Eagle, Shark, Dragon, Wolf, Tiger, Octopus, Phoenix, Turtle, Eel)
- 5 base objects (Skateboard, Robot, Crystal, Volcano, Thunder Cloud)

**Fusion System**:
- Deterministic: Same pair always produces same fusion
- Stats calculated as weighted average with bonus
- Types combined from both parent entities
- Moves inherited (2 from each parent)

**Battle System**:
- Turn-based with type effectiveness (1.5x super effective, 0.67x not very effective)
- Speed stat determines first turn
- AI opponent with move selection logic
- XP rewards and win/loss tracking

### Key Files

| File | Purpose |
|------|---------|
| `data/battle/types.ts` | TypeScript interfaces, type chart, colors |
| `data/battle/entities.ts` | Base animals and objects with stats/moves |
| `utils/battle/fusionKey.ts` | Fusion creation logic |
| `utils/battle/battleEngine.ts` | Battle mechanics (damage, turns, AI) |
| `contexts/TrainerContext.tsx` | Trainer state with localStorage persistence |

### Design Notes
- Pixel-art aesthetic with custom PixelButton/PixelPanel components
- Emoji-based creature representation
- All state persisted to localStorage

---

## Key Files

| File | Purpose |
|------|---------|
| `client/src/pages/Home.tsx` | Main page with all mini-games |
| `client/src/components/games/` | Individual game components |
| `client/src/data/gameData.ts` | Game data (sounds, facts, emojis) |
| `client/src/utils/audio.ts` | Web Audio API with error handling |
| `client/src/index.css` | Tailwind config + custom animations |

---

## Animations (defined in index.css)

- `breathe` - Subtle scale pulse for idle elements
- `wobble` - Side-to-side rotation
- `bounceIn` - Elastic entrance animation
- `twerk` - Pikachu dance animation
- `shake` - Screen shake for crazy mode
- `float` - Flying elements for crazy mode

---

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Type check
pnpm check

# Build for production
pnpm build

# Preview production build
pnpm preview
```

---

## Conventions

### Component Patterns
- Game components receive `floating?: boolean` prop for crazy mode
- Use `GameCard` wrapper for consistent styling
- Keep game logic self-contained in each component

### Styling Patterns
- Use `cartoon-border` class for thick outlines
- Use `cartoon-shadow` class for offset shadows
- Animations use Tailwind arbitrary values: `animate-[name_duration_timing_iteration]`

### File Naming
- Components: PascalCase.tsx
- Utilities: camelCase.ts
- Data: camelCase.ts

---

## Future Ideas

- More mini-games
- Sound effects library expansion
- High score tracking
- More Pokemon characters
- Achievements/badges system

---

*Last updated: January 18, 2026*
