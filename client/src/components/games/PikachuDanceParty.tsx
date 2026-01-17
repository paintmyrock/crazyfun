import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GameCard } from "./GameCard";

interface PikachuDancePartyProps {
  floating?: boolean;
}

export function PikachuDanceParty({ floating = false }: PikachuDancePartyProps) {
  const [isDancing, setIsDancing] = useState(false);

  const startDanceParty = () => {
    setIsDancing(true);
    toast.success("PIKACHU TWERK!", {
      description: "Pikachu is getting down! ⚡🕺",
      duration: 3000,
    });
    setTimeout(() => setIsDancing(false), 3000);
  };

  return (
    <GameCard floating={floating} delay="1s">
      <div className="flex justify-center mb-6">
        <img
          src="/images/pikachu-twerk.png"
          alt="Pikachu Dance"
          className={`w-32 h-32 ${
            isDancing
              ? "animate-[twerk_0.3s_ease-in-out_infinite]"
              : "animate-[breathe_2s_ease-in-out_infinite]"
          }`}
        />
      </div>
      <h3 className="text-3xl font-bold text-center mb-4 text-card-foreground">
        Pikachu Twerk Party!
      </h3>
      <p className="text-center text-lg mb-6 text-card-foreground">
        Make Pikachu dance!
      </p>
      {isDancing && (
        <div className="text-center mb-4">
          <p className="text-2xl font-bold text-accent animate-[bounceIn_0.5s_ease-out]">
            ⚡ PIKACHU TWERK! ⚡
          </p>
        </div>
      )}
      <Button
        onClick={startDanceParty}
        className="w-full cartoon-border bg-accent text-accent-foreground hover:bg-accent/90 text-xl font-bold py-6"
        size="lg"
        disabled={isDancing}
      >
        {isDancing ? "TWERKING! ⚡" : "MAKE PIKACHU TWERK!"}
      </Button>
    </GameCard>
  );
}
