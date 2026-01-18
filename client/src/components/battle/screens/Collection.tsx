import { useTrainer } from "@/contexts/TrainerContext";
import { FusionCard } from "../components/FusionCard";
import { PixelButton } from "../ui/PixelButton";
import { PixelPanel } from "../ui/PixelPanel";
import { toast } from "sonner";

interface CollectionProps {
  onBack: () => void;
}

export function Collection({ onBack }: CollectionProps) {
  const { collection, removeFromCollection } = useTrainer();

  const handleRelease = (fusionKey: string, name: string) => {
    if (confirm(`Are you sure you want to release ${name}?`)) {
      removeFromCollection(fusionKey);
      toast.success(`${name} was released!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-500 to-orange-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <PixelButton variant="secondary" onClick={onBack}>
            ← Back
          </PixelButton>
          <h1 className="text-3xl font-bold text-white text-center">
            📦 My Collection 📦
          </h1>
          <div className="w-20" />
        </div>

        {collection.length === 0 ? (
          <PixelPanel className="text-center py-12">
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              No Fusions Yet!
            </h2>
            <p className="text-slate-600">
              Visit the Fusion Lab to create your first creature!
            </p>
          </PixelPanel>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {collection.map((saved) => (
              <div key={saved.fusion.fusionKey} className="relative">
                <FusionCard fusion={saved.fusion} showStats compact />

                {/* Stats overlay */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    W: {saved.wins}
                  </span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    L: {saved.losses}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-end mt-2">
                  <PixelButton
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      handleRelease(saved.fusion.fusionKey, saved.fusion.name)
                    }
                  >
                    Release
                  </PixelButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Collection Stats */}
        {collection.length > 0 && (
          <PixelPanel variant="dark" className="mt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-yellow-400">
                  {collection.length}
                </div>
                <div className="text-sm text-slate-400">Total Fusions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">
                  {collection.reduce((sum, f) => sum + f.wins, 0)}
                </div>
                <div className="text-sm text-slate-400">Total Wins</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">
                  {Math.round(
                    (collection.reduce((sum, f) => sum + f.wins, 0) /
                      Math.max(
                        1,
                        collection.reduce((sum, f) => sum + f.wins + f.losses, 0)
                      )) *
                      100
                  )}
                  %
                </div>
                <div className="text-sm text-slate-400">Win Rate</div>
              </div>
            </div>
          </PixelPanel>
        )}
      </div>
    </div>
  );
}
