import { useLocation } from "wouter";
import { BattleGame } from "@/components/battle/BattleGame";

export default function BattlePage() {
  const [, setLocation] = useLocation();

  const handleExit = () => {
    setLocation("/");
  };

  return <BattleGame onExit={handleExit} />;
}
