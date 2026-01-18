import { useState } from "react";
import { TrainerProvider, useTrainer } from "@/contexts/TrainerContext";
import { FusionCreature } from "@/data/battle/types";
import { TrainerCreation } from "./screens/TrainerCreation";
import { MainMenu } from "./screens/MainMenu";
import { FusionCreator } from "./screens/FusionCreator";
import { Collection } from "./screens/Collection";
import { Arena } from "./screens/Arena";
import { BattleScreen } from "./screens/BattleScreen";
import { PixelButton } from "./ui/PixelButton";

type Screen = "menu" | "fusion" | "collection" | "arena" | "battle";

function BattleGameInner({ onExit }: { onExit: () => void }) {
  const { trainer } = useTrainer();
  const [currentScreen, setCurrentScreen] = useState<Screen>("menu");
  const [battleData, setBattleData] = useState<{
    player: FusionCreature;
    opponent: FusionCreature;
  } | null>(null);

  // Show trainer creation if no trainer exists
  if (!trainer) {
    return <TrainerCreation onComplete={() => setCurrentScreen("menu")} />;
  }

  const handleStartBattle = (player: FusionCreature, opponent: FusionCreature) => {
    setBattleData({ player, opponent });
    setCurrentScreen("battle");
  };

  const handleBattleEnd = () => {
    setBattleData(null);
    setCurrentScreen("arena");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "menu":
        return <MainMenu onNavigate={setCurrentScreen} />;
      case "fusion":
        return <FusionCreator onBack={() => setCurrentScreen("menu")} />;
      case "collection":
        return <Collection onBack={() => setCurrentScreen("menu")} />;
      case "arena":
        return (
          <Arena
            onBack={() => setCurrentScreen("menu")}
            onStartBattle={handleStartBattle}
          />
        );
      case "battle":
        if (battleData) {
          return (
            <BattleScreen
              playerFusion={battleData.player}
              opponentFusion={battleData.opponent}
              onBattleEnd={handleBattleEnd}
            />
          );
        }
        return <MainMenu onNavigate={setCurrentScreen} />;
      default:
        return <MainMenu onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="relative">
      {renderScreen()}

      {/* Exit button - always visible */}
      <div className="fixed top-4 right-4 z-50">
        <PixelButton
          variant="secondary"
          size="sm"
          onClick={onExit}
        >
          ✕ Exit Game
        </PixelButton>
      </div>
    </div>
  );
}

interface BattleGameProps {
  onExit: () => void;
}

export function BattleGame({ onExit }: BattleGameProps) {
  return (
    <TrainerProvider>
      <BattleGameInner onExit={onExit} />
    </TrainerProvider>
  );
}
