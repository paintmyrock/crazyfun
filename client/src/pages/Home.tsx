/**
 * Crazy Random Fun Zone - Home Page
 *
 * Design Philosophy: Cartoon Explosion Lab
 * - Inspired by Nickelodeon cartoons with thick outlines and wobbly shapes
 * - Bright saturated colors (electric yellow, hot pink, lime green)
 * - Bouncy, squishy animations that feel alive
 * - Squash-and-stretch interactions
 * - Playful and silly, perfect for 10-year-olds
 */

import { useState } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import {
  SillySoundMachine,
  SillyFaceMaker,
  PikachuDanceParty,
  DanceBattleArena,
  RandomFactCard,
  BattleGameCard,
} from "@/components/games";

type ColorMode = "normal" | "crazy";

export default function Home() {
  const [colorMode, setColorMode] = useState<ColorMode>("normal");
  const [isShaking, setIsShaking] = useState(false);
  const [flyingElements, setFlyingElements] = useState(false);

  const toggleCrazyMode = () => {
    const newMode = colorMode === "normal" ? "crazy" : "normal";
    setColorMode(newMode);

    if (newMode === "crazy") {
      triggerCrazyModeEffects();
    }
  };

  const triggerCrazyModeEffects = () => {
    // Confetti explosion
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#FFD700", "#FF69B4", "#00FF00", "#FF4500", "#9370DB"],
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#FFD700", "#FF69B4", "#00FF00", "#FF4500", "#9370DB"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Screen shake
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 3000);

    // Flying elements
    setFlyingElements(true);
    setTimeout(() => setFlyingElements(false), 3000);

    toast("🌈 CRAZY MODE ACTIVATED! 🌈", {
      description: "Everything is EXTRA silly now!",
    });
  };

  return (
    <div
      className={`min-h-screen ${isShaking ? "animate-[shake_0.5s_ease-in-out_infinite]" : ""} ${
        colorMode === "crazy" ? "animate-pulse" : ""
      }`}
    >
      {/* Hero Section */}
      <HeroSection colorMode={colorMode} onToggleCrazyMode={toggleCrazyMode} />

      {/* Activities Section */}
      <section className="container py-16">
        <h2 className="text-5xl font-bold text-center mb-12 text-foreground">
          Pick Your Silly Adventure!
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <BattleGameCard floating={flyingElements} />
          <SillySoundMachine floating={flyingElements} />
          <SillyFaceMaker floating={flyingElements} />
          <PikachuDanceParty floating={flyingElements} />
          <DanceBattleArena floating={flyingElements} />
          <RandomFactCard floating={flyingElements} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 mt-16">
        <div className="container text-center">
          <p className="text-xl font-bold text-muted-foreground">
            Keep being SILLY! 🎉🤪🎈
          </p>
        </div>
      </footer>
    </div>
  );
}

interface HeroSectionProps {
  colorMode: ColorMode;
  onToggleCrazyMode: () => void;
}

function HeroSection({ colorMode, onToggleCrazyMode }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url('/images/pokemon-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 text-center px-4">
        <div className="flex justify-center mb-6">
          <img
            src="/images/pokeball-icon.png"
            alt="Pokeball"
            className="w-24 h-24 animate-[breathe_2s_ease-in-out_infinite]"
          />
        </div>
        <h1
          className="text-7xl md:text-8xl font-black mb-4 text-white"
          style={{
            textShadow:
              "4px 4px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black",
          }}
        >
          CRAZY RANDOM FUN ZONE!
        </h1>
        <p
          className="text-3xl font-bold mb-8 text-white"
          style={{
            textShadow:
              "2px 2px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black",
          }}
        >
          Where silly things happen! ⚡🎉
        </p>
        <Button
          onClick={onToggleCrazyMode}
          size="lg"
          className="cartoon-border cartoon-shadow text-2xl font-black py-8 px-12 bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white"
        >
          {colorMode === "normal" ? "🌈 ACTIVATE CRAZY MODE!" : "😎 NORMAL MODE"}
        </Button>
      </div>
    </section>
  );
}
