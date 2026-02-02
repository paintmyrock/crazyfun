// ============================================
// Crazy Fun Boxing - Main Game Component
// ============================================

import { useState } from "react";
import { useBoxing } from "@/contexts/BoxingContext";
import { DifficultyTier } from "@/data/boxing/types";
import { MainMenu } from "./screens/MainMenu";
import { FighterSelect } from "./screens/FighterSelect";
import { UpgradeScreen } from "./screens/UpgradeScreen";
import { FightScreen, FightResult } from "./screens/FightScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { Button } from "@/components/ui/button";

type Screen =
  | "create"
  | "menu"
  | "fighters"
  | "upgrades"
  | "difficulty"
  | "fight"
  | "results";

const DIFFICULTY_OPTIONS: { tier: DifficultyTier; label: string; description: string }[] = [
  { tier: "rookie", label: "Rookie", description: "Easy - Learning the ropes" },
  { tier: "amateur", label: "Amateur", description: "Normal - A fair challenge" },
  { tier: "pro", label: "Pro", description: "Hard - Skilled opponents" },
  { tier: "champion", label: "Champion", description: "Very Hard - Elite fighters" },
  { tier: "legend", label: "Legend", description: "Extreme - Only the best" },
];

const AVATAR_OPTIONS = ["🥊", "👊", "💪", "🔥", "⚡", "🌟", "🎯", "🏆"];

export function BoxingGame() {
  const { player, isLoaded, createPlayer } = useBoxing();

  const [currentScreen, setCurrentScreen] = useState<Screen>(
    player ? "menu" : "create"
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyTier>("rookie");
  const [lastResult, setLastResult] = useState<FightResult | null>(null);

  // Form state for player creation
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);

  // Wait for data to load
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  // Player creation screen
  if (!player || currentScreen === "create") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-4">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Crazy Fun Boxing
        </h1>

        <div className="w-full max-w-sm bg-black/30 rounded-2xl p-6 cartoon-border">
          <h2 className="text-xl font-bold text-white mb-4 text-center">
            Create Your Fighter
          </h2>

          {/* Avatar selection */}
          <div className="mb-4">
            <label className="text-gray-300 text-sm mb-2 block">Choose Avatar</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`w-12 h-12 rounded-xl text-2xl cartoon-border transition-all ${
                    avatar === emoji
                      ? "bg-blue-500 ring-2 ring-yellow-400"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Username input */}
          <div className="mb-6">
            <label className="text-gray-300 text-sm mb-2 block">Fighter Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              maxLength={15}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border-2 border-gray-600 focus:border-blue-500 outline-none cartoon-border"
            />
          </div>

          {/* Create button */}
          <Button
            onClick={() => {
              if (username.trim()) {
                createPlayer(username.trim(), avatar);
                setCurrentScreen("menu");
              }
            }}
            disabled={!username.trim()}
            className="w-full h-14 text-xl font-bold bg-green-500 hover:bg-green-600 cartoon-border disabled:opacity-50"
          >
            Start Fighting!
          </Button>
        </div>
      </div>
    );
  }

  // Screen rendering
  switch (currentScreen) {
    case "menu":
      return (
        <MainMenu
          onFight={() => setCurrentScreen("difficulty")}
          onFighters={() => setCurrentScreen("fighters")}
          onUpgrades={() => setCurrentScreen("upgrades")}
        />
      );

    case "fighters":
      return <FighterSelect onBack={() => setCurrentScreen("menu")} />;

    case "upgrades":
      return <UpgradeScreen onBack={() => setCurrentScreen("menu")} />;

    case "difficulty":
      return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => setCurrentScreen("menu")}
              variant="outline"
              className="cartoon-border"
            >
              Back
            </Button>
            <h1 className="text-2xl font-bold text-white">Select Difficulty</h1>
            <div className="w-16" />
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.tier}
                onClick={() => {
                  setSelectedDifficulty(option.tier);
                  setCurrentScreen("fight");
                }}
                className={`p-4 rounded-xl cartoon-border text-left transition-all ${
                  getDifficultyColor(option.tier)
                } hover:scale-[1.02]`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold text-lg">{option.label}</h3>
                    <p className="text-gray-300 text-sm">{option.description}</p>
                  </div>
                  <span className="text-2xl">{getDifficultyEmoji(option.tier)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      );

    case "fight":
      return (
        <FightScreen
          difficulty={selectedDifficulty}
          onEnd={(result) => {
            setLastResult(result);
            setCurrentScreen("results");
          }}
          onPause={() => {
            // Could show pause menu
          }}
        />
      );

    case "results":
      return lastResult ? (
        <ResultsScreen
          result={lastResult}
          difficulty={selectedDifficulty}
          onContinue={() => setCurrentScreen("menu")}
          onRematch={() => setCurrentScreen("fight")}
        />
      ) : null;

    default:
      return null;
  }
}

function getDifficultyColor(tier: DifficultyTier): string {
  switch (tier) {
    case "rookie":
      return "bg-green-600/50";
    case "amateur":
      return "bg-blue-600/50";
    case "pro":
      return "bg-yellow-600/50";
    case "champion":
      return "bg-orange-600/50";
    case "legend":
      return "bg-red-600/50";
  }
}

function getDifficultyEmoji(tier: DifficultyTier): string {
  switch (tier) {
    case "rookie":
      return "🌱";
    case "amateur":
      return "🥉";
    case "pro":
      return "🥈";
    case "champion":
      return "🥇";
    case "legend":
      return "👑";
  }
}

export default BoxingGame;
