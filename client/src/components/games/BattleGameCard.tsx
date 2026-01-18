import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GameCard } from "./GameCard";

interface BattleGameCardProps {
  floating?: boolean;
}

export function BattleGameCard({ floating = false }: BattleGameCardProps) {
  const [, setLocation] = useLocation();

  return (
    <GameCard floating={floating} delay="0.5s">
      <div className="text-center">
        <div className="text-6xl mb-4">
          <span className="inline-block animate-[wobble_1s_ease-in-out_infinite]">
            🐉
          </span>
          <span className="text-4xl mx-2">⚔️</span>
          <span
            className="inline-block animate-[wobble_1s_ease-in-out_infinite]"
            style={{ animationDelay: "0.5s" }}
          >
            🦈
          </span>
        </div>
        <h3 className="text-3xl font-black text-foreground mb-2">
          Crazy Fusion Battler!
        </h3>
        <p className="text-lg text-muted-foreground mb-4">
          Fuse creatures together and battle for glory!
        </p>
        <Button
          onClick={() => setLocation("/battle")}
          className="cartoon-border cartoon-shadow text-xl font-bold py-4 px-8 bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white"
        >
          PLAY NOW!
        </Button>
      </div>
    </GameCard>
  );
}
