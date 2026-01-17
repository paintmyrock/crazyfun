import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PokemonName, POKEMON_NAMES } from "@/data/gameData";
import { GameCard } from "./GameCard";

interface DanceBattleArenaProps {
  floating?: boolean;
}

type Votes = Record<PokemonName, number>;

const POKEMON_CONFIG: { name: PokemonName; image: string; animationDuration: string }[] = [
  { name: "jigglypuff", image: "/images/jigglypuff-dance.png", animationDuration: "1s" },
  { name: "squirtle", image: "/images/squirtle-dance.png", animationDuration: "1.2s" },
  { name: "charmander", image: "/images/charmander-dance.png", animationDuration: "0.8s" },
  { name: "pikachu", image: "/images/pikachu-twerk.png", animationDuration: "0.3s" },
];

export function DanceBattleArena({ floating = false }: DanceBattleArenaProps) {
  const [battleActive, setBattleActive] = useState(false);
  const [votes, setVotes] = useState<Votes>({
    jigglypuff: 0,
    squirtle: 0,
    charmander: 0,
    pikachu: 0,
  });

  const startDanceBattle = () => {
    setBattleActive(true);
    setVotes({ jigglypuff: 0, squirtle: 0, charmander: 0, pikachu: 0 });
    toast.success("🎤 DANCE BATTLE STARTED! 🎤", {
      description: "Vote for your favorite dancer!",
      duration: 3000,
    });
  };

  const vote = (pokemon: PokemonName) => {
    setVotes((prev) => ({ ...prev, [pokemon]: prev[pokemon] + 1 }));
    toast(`Voted for ${POKEMON_NAMES[pokemon]}! 🗳️`, {
      description: `${POKEMON_NAMES[pokemon]} now has ${votes[pokemon] + 1} votes!`,
    });
  };

  const endBattle = () => {
    const winner = Object.entries(votes).reduce((a, b) => (a[1] > b[1] ? a : b));
    toast.success(`🏆 ${POKEMON_NAMES[winner[0] as PokemonName]} WINS! 🏆`, {
      description: `With ${winner[1]} votes!`,
      duration: 5000,
    });
    setBattleActive(false);
  };

  return (
    <GameCard floating={floating} delay="1.5s">
      <div className="flex justify-center mb-6">
        <span className="text-7xl animate-[breathe_2.2s_ease-in-out_infinite]">🎤</span>
      </div>
      <h3 className="text-3xl font-bold text-center mb-4 text-card-foreground">
        Dance Battle Arena!
      </h3>
      <p className="text-center text-lg mb-6 text-card-foreground">
        Watch Pokemon dance and vote!
      </p>

      {!battleActive ? (
        <Button
          onClick={startDanceBattle}
          className="w-full cartoon-border bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 text-xl font-bold py-6"
          size="lg"
        >
          START BATTLE!
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {POKEMON_CONFIG.map(({ name, image, animationDuration }) => (
              <div key={name} className="text-center">
                <img
                  src={image}
                  alt={POKEMON_NAMES[name]}
                  className={`w-20 h-20 mx-auto mb-2 ${
                    name === "pikachu"
                      ? "animate-[twerk_0.3s_ease-in-out_infinite]"
                      : `animate-[breathe_${animationDuration}_ease-in-out_infinite]`
                  }`}
                  style={{
                    animationDuration: name === "pikachu" ? "0.3s" : animationDuration,
                  }}
                />
                <p className="text-sm font-bold mb-1">{POKEMON_NAMES[name]}</p>
                <p className="text-xs mb-2">Votes: {votes[name]}</p>
                <Button onClick={() => vote(name)} size="sm" className="w-full text-xs">
                  VOTE
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={endBattle}
            className="w-full cartoon-border bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 text-lg font-bold py-4"
            size="lg"
          >
            END BATTLE & SEE WINNER!
          </Button>
        </div>
      )}
    </GameCard>
  );
}
