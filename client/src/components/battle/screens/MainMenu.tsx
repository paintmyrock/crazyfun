import { useTrainer } from "@/contexts/TrainerContext";
import { PixelButton } from "../ui/PixelButton";
import { PixelPanel } from "../ui/PixelPanel";
import { calculateLevel, getXpForNextLevel } from "@/utils/battle/battleEngine";

type Screen = "menu" | "fusion" | "collection" | "arena" | "battle";

interface MainMenuProps {
  onNavigate: (screen: Screen) => void;
}

export function MainMenu({ onNavigate }: MainMenuProps) {
  const { trainer, collection } = useTrainer();

  if (!trainer) return null;

  const xpForNext = getXpForNextLevel(trainer.level);
  const xpProgress = Math.min(100, (trainer.xp / xpForNext) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Trainer Card */}
        <PixelPanel>
          <div className="flex items-center gap-4">
            <div className="text-6xl">{trainer.avatarEmoji}</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800">
                {trainer.username}
              </h2>
              <div className="text-sm text-slate-600">
                Level {trainer.level} Trainer
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>XP</span>
                  <span>
                    {trainer.xp} / {xpForNext}
                  </span>
                </div>
                <div className="w-full bg-slate-300 rounded-full h-3">
                  <div
                    className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </PixelPanel>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎮 Crazy Fusion 🎮
          </h1>
          <p className="text-white/80">
            Fuse creatures and battle!
          </p>
        </div>

        {/* Menu Buttons */}
        <div className="space-y-4">
          <PixelButton
            className="w-full text-xl py-4"
            variant="primary"
            onClick={() => onNavigate("fusion")}
          >
            ⚗️ Fusion Lab
          </PixelButton>

          <PixelButton
            className="w-full text-xl py-4"
            variant="secondary"
            onClick={() => onNavigate("collection")}
          >
            📦 Collection ({collection.length})
          </PixelButton>

          <PixelButton
            className="w-full text-xl py-4"
            variant="danger"
            onClick={() => onNavigate("arena")}
            disabled={collection.length === 0}
          >
            ⚔️ Battle Arena
          </PixelButton>
        </div>

        {collection.length === 0 && (
          <PixelPanel variant="light" className="text-center">
            <p className="text-slate-600">
              💡 Create your first fusion to start battling!
            </p>
          </PixelPanel>
        )}

        {/* Stats */}
        <PixelPanel variant="dark">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-400">
                {collection.length}
              </div>
              <div className="text-sm text-slate-400">Fusions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">
                {collection.reduce((sum, f) => sum + f.wins, 0)}
              </div>
              <div className="text-sm text-slate-400">Wins</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-400">
                {collection.reduce((sum, f) => sum + f.losses, 0)}
              </div>
              <div className="text-sm text-slate-400">Losses</div>
            </div>
          </div>
        </PixelPanel>
      </div>
    </div>
  );
}
