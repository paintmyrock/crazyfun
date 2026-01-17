import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RANDOM_FACTS } from "@/data/gameData";
import { GameCard } from "./GameCard";

interface RandomFactCardProps {
  floating?: boolean;
}

export function RandomFactCard({ floating = false }: RandomFactCardProps) {
  const [randomFact, setRandomFact] = useState(RANDOM_FACTS[0]);

  const generateRandomFact = () => {
    const fact = RANDOM_FACTS[Math.floor(Math.random() * RANDOM_FACTS.length)];
    setRandomFact(fact);
  };

  useEffect(() => {
    generateRandomFact();
  }, []);

  return (
    <GameCard floating={floating} delay="2s">
      <div className="flex justify-center mb-6">
        <span className="text-7xl animate-[breathe_2.2s_ease-in-out_infinite]">🤯</span>
      </div>
      <h3 className="text-3xl font-bold text-center mb-4 text-card-foreground">
        Weird Fun Facts
      </h3>
      <p className="text-center text-lg mb-6 text-card-foreground">
        Learn something silly!
      </p>
      <div className="bg-muted p-6 rounded-2xl mb-6 min-h-[100px] flex items-center justify-center cartoon-border">
        <p className="text-xl font-bold text-center text-muted-foreground">{randomFact}</p>
      </div>
      <Button
        onClick={generateRandomFact}
        className="w-full cartoon-border bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xl font-bold py-6"
        size="lg"
      >
        ANOTHER FACT!
      </Button>
    </GameCard>
  );
}
