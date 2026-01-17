import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SILLY_FACES } from "@/data/gameData";
import { GameCard } from "./GameCard";

interface SillyFaceMakerProps {
  floating?: boolean;
}

export function SillyFaceMaker({ floating = false }: SillyFaceMakerProps) {
  const [faceCombo, setFaceCombo] = useState(["😊", "😊", "😊"]);

  const generateSillyFace = () => {
    const newFaces = [
      SILLY_FACES[Math.floor(Math.random() * SILLY_FACES.length)],
      SILLY_FACES[Math.floor(Math.random() * SILLY_FACES.length)],
      SILLY_FACES[Math.floor(Math.random() * SILLY_FACES.length)],
    ];
    setFaceCombo(newFaces);
  };

  return (
    <GameCard floating={floating} delay="0.5s">
      <div className="flex justify-center mb-6">
        <img
          src="/images/activity-2.png"
          alt="Silly Faces"
          className="w-32 h-32 animate-[breathe_2.5s_ease-in-out_infinite]"
        />
      </div>
      <h3 className="text-3xl font-bold text-center mb-4 text-card-foreground">
        Silly Face Maker
      </h3>
      <p className="text-center text-lg mb-6 text-card-foreground">
        Generate wacky face combos!
      </p>
      <div className="flex justify-center gap-4 mb-6">
        {faceCombo.map((face, idx) => (
          <span key={idx} className="text-6xl animate-[bounceIn_0.5s_ease-out]">
            {face}
          </span>
        ))}
      </div>
      <Button
        onClick={generateSillyFace}
        className="w-full cartoon-border bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xl font-bold py-6"
        size="lg"
      >
        NEW FACES!
      </Button>
    </GameCard>
  );
}
