import { useState } from "react";
import { ALL_ENTITIES } from "@/data/battle/entities";
import { BaseEntity } from "@/data/battle/types";
import { createFusion } from "@/utils/battle/fusionKey";
import { EntityCard } from "../components/EntityCard";
import { FusionCard } from "../components/FusionCard";
import { PixelButton } from "../ui/PixelButton";
import { PixelPanel } from "../ui/PixelPanel";
import { useTrainer } from "@/contexts/TrainerContext";
import { toast } from "sonner";

interface FusionCreatorProps {
  onBack: () => void;
}

export function FusionCreator({ onBack }: FusionCreatorProps) {
  const [selectedFirst, setSelectedFirst] = useState<BaseEntity | null>(null);
  const [selectedSecond, setSelectedSecond] = useState<BaseEntity | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { addToCollection, collection } = useTrainer();

  const fusion =
    selectedFirst && selectedSecond
      ? createFusion(selectedFirst, selectedSecond)
      : null;

  const isInCollection = fusion
    ? collection.some((s) => s.fusion.fusionKey === fusion.fusionKey)
    : false;

  const handleSelectEntity = (entity: BaseEntity) => {
    if (!selectedFirst) {
      setSelectedFirst(entity);
    } else if (!selectedSecond) {
      if (entity.id === selectedFirst.id) {
        toast.error("Pick a different creature!");
        return;
      }
      setSelectedSecond(entity);
    }
  };

  const handleReset = () => {
    setSelectedFirst(null);
    setSelectedSecond(null);
    setShowResult(false);
  };

  const handleFuse = () => {
    if (fusion) {
      setShowResult(true);
    }
  };

  const handleSave = () => {
    if (fusion && !isInCollection) {
      addToCollection(fusion);
      toast.success(`${fusion.name} added to your collection!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <PixelButton variant="secondary" onClick={onBack}>
            ← Back
          </PixelButton>
          <h1 className="text-3xl font-bold text-white text-center">
            ⚗️ Fusion Lab ⚗️
          </h1>
          <div className="w-20" /> {/* Spacer */}
        </div>

        {!showResult ? (
          <>
            {/* Selection Display */}
            <PixelPanel className="mb-6">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  {selectedFirst ? (
                    <div>
                      <div className="text-5xl mb-2">{selectedFirst.imageEmoji}</div>
                      <div className="font-bold">{selectedFirst.name}</div>
                    </div>
                  ) : (
                    <div className="text-5xl text-slate-400">❓</div>
                  )}
                </div>

                <div className="text-4xl font-bold text-purple-600">+</div>

                <div className="text-center">
                  {selectedSecond ? (
                    <div>
                      <div className="text-5xl mb-2">{selectedSecond.imageEmoji}</div>
                      <div className="font-bold">{selectedSecond.name}</div>
                    </div>
                  ) : (
                    <div className="text-5xl text-slate-400">❓</div>
                  )}
                </div>

                <div className="text-4xl font-bold text-purple-600">=</div>

                <div className="text-center">
                  {fusion ? (
                    <div>
                      <div className="text-5xl mb-2">{fusion.imageEmoji}</div>
                      <div className="font-bold text-purple-600">???</div>
                    </div>
                  ) : (
                    <div className="text-5xl text-slate-400">🔮</div>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-4">
                <PixelButton
                  variant="danger"
                  onClick={handleReset}
                  disabled={!selectedFirst}
                >
                  Reset
                </PixelButton>
                <PixelButton
                  variant="success"
                  onClick={handleFuse}
                  disabled={!fusion}
                  size="lg"
                >
                  ✨ FUSE! ✨
                </PixelButton>
              </div>
            </PixelPanel>

            {/* Entity Grid */}
            <PixelPanel variant="dark">
              <h2 className="text-xl font-bold mb-4 text-center">
                {!selectedFirst
                  ? "Pick your first creature!"
                  : !selectedSecond
                  ? "Pick your second creature!"
                  : "Ready to fuse!"}
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {ALL_ENTITIES.map((entity) => (
                  <EntityCard
                    key={entity.id}
                    entity={entity}
                    selected={
                      entity.id === selectedFirst?.id ||
                      entity.id === selectedSecond?.id
                    }
                    onClick={() => handleSelectEntity(entity)}
                    disabled={
                      selectedFirst !== null &&
                      selectedSecond !== null
                    }
                    size="sm"
                  />
                ))}
              </div>
            </PixelPanel>
          </>
        ) : (
          /* Fusion Result */
          fusion && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-2">
                  ✨ FUSION COMPLETE! ✨
                </h2>
                <p className="text-xl text-white/80">
                  You created a new creature!
                </p>
              </div>

              <FusionCard fusion={fusion} showStats showMoves />

              <div className="flex justify-center gap-4">
                <PixelButton variant="secondary" onClick={handleReset}>
                  Create Another
                </PixelButton>
                <PixelButton
                  variant="success"
                  onClick={handleSave}
                  disabled={isInCollection}
                >
                  {isInCollection ? "✓ In Collection" : "💾 Save to Collection"}
                </PixelButton>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
