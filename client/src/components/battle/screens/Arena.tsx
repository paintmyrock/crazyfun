import { useState } from "react";
import { useTrainer } from "@/contexts/TrainerContext";
import { FusionCreature } from "@/data/battle/types";
import { ALL_ENTITIES } from "@/data/battle/entities";
import { createFusion } from "@/utils/battle/fusionKey";
import { FusionCard } from "../components/FusionCard";
import { PixelButton } from "../ui/PixelButton";
import { PixelPanel } from "../ui/PixelPanel";

interface ArenaProps {
  onBack: () => void;
  onStartBattle: (player: FusionCreature, opponent: FusionCreature) => void;
}

// Generate random opponent fusions
function generateOpponents(): FusionCreature[] {
  const opponents: FusionCreature[] = [];
  const usedKeys = new Set<string>();

  while (opponents.length < 3) {
    const idx1 = Math.floor(Math.random() * ALL_ENTITIES.length);
    let idx2 = Math.floor(Math.random() * ALL_ENTITIES.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * ALL_ENTITIES.length);
    }

    const fusion = createFusion(ALL_ENTITIES[idx1], ALL_ENTITIES[idx2]);
    if (!usedKeys.has(fusion.fusionKey)) {
      usedKeys.add(fusion.fusionKey);
      opponents.push(fusion);
    }
  }

  return opponents;
}

export function Arena({ onBack, onStartBattle }: ArenaProps) {
  const { collection } = useTrainer();
  const [selectedPlayer, setSelectedPlayer] = useState<FusionCreature | null>(null);
  const [opponents] = useState(() => generateOpponents());
  const [selectedOpponent, setSelectedOpponent] = useState<FusionCreature | null>(null);

  const canBattle = selectedPlayer && selectedOpponent;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-purple-700 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <PixelButton variant="secondary" onClick={onBack}>
            ← Back
          </PixelButton>
          <h1 className="text-3xl font-bold text-white text-center">
            ⚔️ Battle Arena ⚔️
          </h1>
          <div className="w-20" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Your Team */}
          <div>
            <PixelPanel variant="dark">
              <h2 className="text-xl font-bold text-white mb-4 text-center">
                🎮 Choose Your Fighter
              </h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {collection.map((saved) => (
                  <FusionCard
                    key={saved.fusion.fusionKey}
                    fusion={saved.fusion}
                    compact
                    onClick={() => setSelectedPlayer(saved.fusion)}
                    selected={selectedPlayer?.fusionKey === saved.fusion.fusionKey}
                  />
                ))}
              </div>
            </PixelPanel>
          </div>

          {/* Opponents */}
          <div>
            <PixelPanel variant="dark">
              <h2 className="text-xl font-bold text-white mb-4 text-center">
                👹 Choose Your Opponent
              </h2>
              <div className="space-y-3">
                {opponents.map((opponent) => (
                  <FusionCard
                    key={opponent.fusionKey}
                    fusion={opponent}
                    compact
                    onClick={() => setSelectedOpponent(opponent)}
                    selected={selectedOpponent?.fusionKey === opponent.fusionKey}
                  />
                ))}
              </div>
            </PixelPanel>
          </div>
        </div>

        {/* Battle Preview */}
        {(selectedPlayer || selectedOpponent) && (
          <PixelPanel className="mt-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                {selectedPlayer ? (
                  <>
                    <div className="text-6xl mb-2">{selectedPlayer.imageEmoji}</div>
                    <div className="font-bold text-lg">{selectedPlayer.name}</div>
                    <div className="text-sm text-slate-600">Your Fighter</div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-2 text-slate-300">❓</div>
                    <div className="font-bold text-slate-400">Select Fighter</div>
                  </>
                )}
              </div>

              <div className="text-5xl font-bold text-red-500">VS</div>

              <div className="text-center">
                {selectedOpponent ? (
                  <>
                    <div className="text-6xl mb-2">{selectedOpponent.imageEmoji}</div>
                    <div className="font-bold text-lg">{selectedOpponent.name}</div>
                    <div className="text-sm text-slate-600">Opponent</div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-2 text-slate-300">❓</div>
                    <div className="font-bold text-slate-400">Select Opponent</div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <PixelButton
                variant="danger"
                size="lg"
                disabled={!canBattle}
                onClick={() =>
                  canBattle && onStartBattle(selectedPlayer, selectedOpponent)
                }
              >
                ⚔️ START BATTLE! ⚔️
              </PixelButton>
            </div>
          </PixelPanel>
        )}
      </div>
    </div>
  );
}
