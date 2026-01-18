import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Trainer, SavedFusion, FusionCreature } from "@/data/battle/types";

interface TrainerContextType {
  trainer: Trainer | null;
  collection: SavedFusion[];
  createTrainer: (username: string, avatarEmoji: string) => void;
  addToCollection: (fusion: FusionCreature, nickname?: string) => void;
  removeFromCollection: (fusionKey: string) => void;
  updateFusionStats: (fusionKey: string, won: boolean) => void;
  addXp: (amount: number) => void;
  clearData: () => void;
}

const TrainerContext = createContext<TrainerContextType | undefined>(undefined);

const STORAGE_KEY_TRAINER = "crazyfun_trainer";
const STORAGE_KEY_COLLECTION = "crazyfun_collection";

export function TrainerProvider({ children }: { children: ReactNode }) {
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [collection, setCollection] = useState<SavedFusion[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTrainer = localStorage.getItem(STORAGE_KEY_TRAINER);
    const savedCollection = localStorage.getItem(STORAGE_KEY_COLLECTION);

    if (savedTrainer) {
      setTrainer(JSON.parse(savedTrainer));
    }
    if (savedCollection) {
      setCollection(JSON.parse(savedCollection));
    }
  }, []);

  // Save trainer to localStorage when it changes
  useEffect(() => {
    if (trainer) {
      localStorage.setItem(STORAGE_KEY_TRAINER, JSON.stringify(trainer));
    }
  }, [trainer]);

  // Save collection to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
  }, [collection]);

  const createTrainer = (username: string, avatarEmoji: string) => {
    const newTrainer: Trainer = {
      id: `trainer_${Date.now()}`,
      username,
      avatarEmoji,
      xp: 0,
      level: 1,
      createdAt: Date.now(),
    };
    setTrainer(newTrainer);
  };

  const addToCollection = (fusion: FusionCreature, nickname?: string) => {
    // Check if already in collection
    const exists = collection.some((s) => s.fusion.fusionKey === fusion.fusionKey);
    if (exists) return;

    const savedFusion: SavedFusion = {
      fusion,
      nickname,
      savedAt: Date.now(),
      wins: 0,
      losses: 0,
    };
    setCollection((prev) => [...prev, savedFusion]);
  };

  const removeFromCollection = (fusionKey: string) => {
    setCollection((prev) => prev.filter((s) => s.fusion.fusionKey !== fusionKey));
  };

  const updateFusionStats = (fusionKey: string, won: boolean) => {
    setCollection((prev) =>
      prev.map((s) =>
        s.fusion.fusionKey === fusionKey
          ? {
              ...s,
              wins: won ? s.wins + 1 : s.wins,
              losses: won ? s.losses : s.losses + 1,
            }
          : s
      )
    );
  };

  const addXp = (amount: number) => {
    if (!trainer) return;

    const newXp = trainer.xp + amount;
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    setTrainer({
      ...trainer,
      xp: newXp,
      level: newLevel,
    });
  };

  const clearData = () => {
    localStorage.removeItem(STORAGE_KEY_TRAINER);
    localStorage.removeItem(STORAGE_KEY_COLLECTION);
    setTrainer(null);
    setCollection([]);
  };

  return (
    <TrainerContext.Provider
      value={{
        trainer,
        collection,
        createTrainer,
        addToCollection,
        removeFromCollection,
        updateFusionStats,
        addXp,
        clearData,
      }}
    >
      {children}
    </TrainerContext.Provider>
  );
}

export function useTrainer() {
  const context = useContext(TrainerContext);
  if (!context) {
    throw new Error("useTrainer must be used within TrainerProvider");
  }
  return context;
}
