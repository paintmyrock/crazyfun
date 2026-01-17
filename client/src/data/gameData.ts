export interface SillySound {
  name: string;
  emoji: string;
}

export const SILLY_SOUNDS: SillySound[] = [
  { name: "BOING!", emoji: "🎪" },
  { name: "SPLAT!", emoji: "💥" },
  { name: "HONK HONK!", emoji: "🚗" },
  { name: "WHEEE!", emoji: "🎢" },
  { name: "BLORP!", emoji: "💧" },
  { name: "ZOOM!", emoji: "🚀" },
  { name: "KABOOM!", emoji: "💣" },
  { name: "SQUISH!", emoji: "🧽" },
];

export const RANDOM_FACTS = [
  "Cows have best friends! 🐄",
  "Penguins propose with pebbles! 🐧",
  "Sea otters hold hands while sleeping! 🦦",
  "Wombat poop is cube-shaped! 🟫",
  "Dolphins have names for each other! 🐬",
  "Octopuses have three hearts! 🐙",
  "Sloths can hold their breath longer than dolphins! 🦥",
  "A group of flamingos is called a 'flamboyance'! 🦩",
];

export const SILLY_FACES = [
  "😜", "🤪", "😝", "🥴", "😵‍💫", "🤡",
  "👽", "🤖", "👻", "💩", "🦄", "🐸"
];

export type PokemonName = "jigglypuff" | "squirtle" | "charmander" | "pikachu";

export const POKEMON_NAMES: Record<PokemonName, string> = {
  jigglypuff: "Jigglypuff",
  squirtle: "Squirtle",
  charmander: "Charmander",
  pikachu: "Pikachu",
};
