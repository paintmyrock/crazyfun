import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SILLY_SOUNDS, SillySound } from "@/data/gameData";
import { playSoundEffect } from "@/utils/audio";
import { GameCard } from "./GameCard";

interface SillySoundMachineProps {
  floating?: boolean;
}

export function SillySoundMachine({ floating = false }: SillySoundMachineProps) {
  const [currentSound, setCurrentSound] = useState<SillySound>(SILLY_SOUNDS[0]);

  const playSillySound = () => {
    const randomIndex = Math.floor(Math.random() * SILLY_SOUNDS.length);
    const randomSound = SILLY_SOUNDS[randomIndex];
    setCurrentSound(randomSound);

    playSoundEffect(randomIndex);

    toast(randomSound.name, {
      description: `You made a ${randomSound.name} sound! ${randomSound.emoji}`,
      duration: 2000,
    });
  };

  return (
    <GameCard floating={floating}>
      <div className="flex justify-center mb-6">
        <img
          src="/images/activity-1.png"
          alt="Sound Machine"
          className="w-32 h-32 animate-[breathe_2s_ease-in-out_infinite]"
        />
      </div>
      <h3 className="text-3xl font-bold text-center mb-4 text-card-foreground">
        Silly Sound Machine
      </h3>
      <p className="text-center text-lg mb-6 text-card-foreground">
        Make random silly sounds!
      </p>
      <div className="text-center mb-4">
        <span className="text-6xl">{currentSound.emoji}</span>
        <p className="text-2xl font-bold mt-2 text-primary">{currentSound.name}</p>
      </div>
      <Button
        onClick={playSillySound}
        className="w-full cartoon-border bg-primary text-primary-foreground hover:bg-primary/90 text-xl font-bold py-6"
        size="lg"
      >
        MAKE A SOUND!
      </Button>
    </GameCard>
  );
}
