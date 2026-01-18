import { useState } from "react";
import { useTrainer } from "@/contexts/TrainerContext";
import { PixelButton } from "../ui/PixelButton";
import { PixelPanel } from "../ui/PixelPanel";
import { cn } from "@/lib/utils";

const AVATARS = ["😎", "🤠", "🥷", "🧙", "👽", "🤖", "🦸", "🧛", "🐱", "🐶", "🦊", "🐻"];

interface TrainerCreationProps {
  onComplete: () => void;
}

export function TrainerCreation({ onComplete }: TrainerCreationProps) {
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const { createTrainer } = useTrainer();

  const handleSubmit = () => {
    if (username.trim().length < 2) return;
    createTrainer(username.trim(), selectedAvatar);
    onComplete();
  };

  const isValid = username.trim().length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-teal-600 p-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎮 Welcome, Trainer! 🎮
          </h1>
          <p className="text-white/80">Create your trainer profile to start!</p>
        </div>

        {/* Avatar Selection */}
        <PixelPanel>
          <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">
            Choose Your Avatar
          </h2>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setSelectedAvatar(avatar)}
                className={cn(
                  "text-4xl p-2 rounded-lg transition-all",
                  selectedAvatar === avatar
                    ? "bg-yellow-300 scale-110 ring-4 ring-yellow-400"
                    : "bg-slate-100 hover:bg-slate-200"
                )}
              >
                {avatar}
              </button>
            ))}
          </div>
        </PixelPanel>

        {/* Username Input */}
        <PixelPanel>
          <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">
            Enter Your Name
          </h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your trainer name..."
            maxLength={15}
            className="w-full px-4 py-3 text-xl border-4 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-center"
          />
          <p className="text-sm text-slate-500 text-center mt-2">
            2-15 characters
          </p>
        </PixelPanel>

        {/* Preview */}
        <PixelPanel variant="dark">
          <div className="flex items-center justify-center gap-4">
            <div className="text-6xl">{selectedAvatar}</div>
            <div>
              <div className="text-2xl font-bold text-white">
                {username || "???"}
              </div>
              <div className="text-slate-400">Level 1 Trainer</div>
            </div>
          </div>
        </PixelPanel>

        {/* Submit Button */}
        <PixelButton
          className="w-full text-xl py-4"
          variant="success"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          🚀 Start Adventure!
        </PixelButton>
      </div>
    </div>
  );
}
