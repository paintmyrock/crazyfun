import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GameCard } from "./GameCard";

interface BoxingGameCardProps {
  floating?: boolean;
}

export function BoxingGameCard({ floating = false }: BoxingGameCardProps) {
  const [, setLocation] = useLocation();

  return (
    <GameCard floating={floating} delay="0.3s">
      <div className="text-center">
        <div className="text-6xl mb-4">
          <span className="inline-block animate-[wobble_0.5s_ease-in-out_infinite]">
            🥊
          </span>
          <span className="text-4xl mx-2">💥</span>
          <span
            className="inline-block animate-[wobble_0.5s_ease-in-out_infinite]"
            style={{ animationDelay: "0.25s" }}
          >
            🥊
          </span>
        </div>
        <h3 className="text-3xl font-black text-foreground mb-2">
          Crazy Fun Boxing!
        </h3>
        <p className="text-lg text-muted-foreground mb-4">
          Touch-based boxing action! Punch, dodge, and KO!
        </p>
        <Button
          onClick={() => setLocation("/boxing")}
          className="cartoon-border cartoon-shadow text-xl font-bold py-4 px-8 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
        >
          FIGHT!
        </Button>
      </div>
    </GameCard>
  );
}
