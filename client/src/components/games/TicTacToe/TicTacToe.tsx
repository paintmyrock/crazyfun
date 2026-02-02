import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { GameCard } from "../GameCard";
import { Diglett, Magikarp } from "./characters";
import {
  GameState,
  GameMode,
  Player,
  CellValue,
} from "./types";
import {
  createEmptyBoard,
  checkWinner,
  isBoardFull,
  getCpuMove,
} from "./gameLogic";

interface TicTacToeProps {
  floating?: boolean;
}

const PLAYER_NAMES: Record<Player, string> = {
  diglett: "Diglett",
  magikarp: "Magikarp",
};

export function TicTacToe({ floating = false }: TicTacToeProps) {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPlayer: "diglett",
    winner: null,
    winningLine: null,
    status: "playing",
    moveLock: false,
  });
  const [recentMove, setRecentMove] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const celebrateWin = useCallback((winner: Player) => {
    const colors = winner === "diglett"
      ? ["#D2691E", "#8B4513", "#FFB6C1"]
      : ["#FF6B35", "#FFD700", "#4169E1"];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    toast(`${PLAYER_NAMES[winner]} wins!`, {
      description: winner === "diglett" ? "Dig dig dig!" : "Splash splash!",
      duration: 3000,
    });
  }, []);

  const makeMove = useCallback((index: number) => {
    if (gameState.board[index] !== null || gameState.status !== "playing" || gameState.moveLock) {
      return;
    }

    const newBoard = [...gameState.board];
    newBoard[index] = gameState.currentPlayer;

    const { winner, winningLine } = checkWinner(newBoard);
    const isDraw = !winner && isBoardFull(newBoard);

    setRecentMove(index);
    setTimeout(() => setRecentMove(null), 500);

    if (winner) {
      setGameState({
        board: newBoard,
        currentPlayer: gameState.currentPlayer,
        winner,
        winningLine,
        status: "won",
        moveLock: false,
      });
      celebrateWin(winner);
    } else if (isDraw) {
      setGameState({
        board: newBoard,
        currentPlayer: gameState.currentPlayer,
        winner: null,
        winningLine: null,
        status: "draw",
        moveLock: false,
      });
      toast("It's a draw!", {
        description: "Nobody wins this round!",
        duration: 2000,
      });
    } else {
      const nextPlayer: Player = gameState.currentPlayer === "diglett" ? "magikarp" : "diglett";
      setGameState({
        ...gameState,
        board: newBoard,
        currentPlayer: nextPlayer,
        moveLock: gameMode === "cpu" && nextPlayer === "magikarp",
      });
    }
  }, [gameState, gameMode, celebrateWin]);

  // CPU move effect
  useEffect(() => {
    if (
      gameMode === "cpu" &&
      gameState.currentPlayer === "magikarp" &&
      gameState.status === "playing" &&
      gameState.moveLock
    ) {
      const delay = 600 + Math.random() * 400;
      const timer = setTimeout(() => {
        const cpuMove = getCpuMove(gameState.board, "magikarp");
        if (cpuMove !== null) {
          makeMove(cpuMove);
        }
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [gameMode, gameState, makeMove]);

  const resetGame = () => {
    setGameState({
      board: createEmptyBoard(),
      currentPlayer: "diglett",
      winner: null,
      winningLine: null,
      status: "playing",
      moveLock: false,
    });
    setRecentMove(null);
  };

  const backToMenu = () => {
    setGameMode(null);
    resetGame();
  };

  // Mode selection screen
  if (gameMode === null) {
    return (
      <GameCard floating={floating}>
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-2 text-card-foreground">
            Tic-Tac-Toe
          </h3>
          <p className="text-lg mb-6 text-muted-foreground">
            Diglett vs Magikarp!
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <div className="w-20 h-20">
              <Diglett animate={false} reduced={reducedMotion} />
            </div>
            <span className="text-4xl font-bold self-center text-primary">VS</span>
            <div className="w-20 h-20">
              <Magikarp animate={false} reduced={reducedMotion} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              onClick={() => setGameMode("local")}
              className="w-full cartoon-border bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xl font-bold py-6"
              size="lg"
            >
              VS Friend
            </Button>
            <Button
              onClick={() => setGameMode("cpu")}
              className="w-full cartoon-border bg-accent text-accent-foreground hover:bg-accent/90 text-xl font-bold py-6"
              size="lg"
            >
              VS CPU
            </Button>
          </div>
        </div>
      </GameCard>
    );
  }

  // Game screen
  return (
    <GameCard floating={floating}>
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4 text-card-foreground">
          Tic-Tac-Toe
        </h3>

        {/* Status bar */}
        <div className="mb-4">
          {gameState.status === "playing" ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-semibold text-muted-foreground">
                {PLAYER_NAMES[gameState.currentPlayer]}'s turn
              </span>
              {gameState.moveLock && (
                <span className="text-sm text-muted-foreground animate-pulse">
                  (thinking...)
                </span>
              )}
            </div>
          ) : gameState.status === "won" ? (
            <span className="text-xl font-bold text-primary">
              {PLAYER_NAMES[gameState.winner!]} wins!
            </span>
          ) : (
            <span className="text-xl font-bold text-muted-foreground">
              It's a draw!
            </span>
          )}
        </div>

        {/* Game board */}
        <div className="grid grid-cols-3 gap-2 w-64 h-64 mx-auto mb-6">
          {gameState.board.map((cell, index) => (
            <Cell
              key={index}
              value={cell}
              onClick={() => makeMove(index)}
              isWinning={gameState.winningLine?.includes(index) ?? false}
              isRecent={recentMove === index}
              disabled={gameState.status !== "playing" || gameState.moveLock}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={resetGame}
            className="cartoon-border bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
          >
            Play Again
          </Button>
          <Button
            onClick={backToMenu}
            variant="outline"
            className="cartoon-border font-bold"
          >
            Menu
          </Button>
        </div>
      </div>
    </GameCard>
  );
}

interface CellProps {
  value: CellValue;
  onClick: () => void;
  isWinning: boolean;
  isRecent: boolean;
  disabled: boolean;
  reducedMotion: boolean;
}

function Cell({ value, onClick, isWinning, isRecent, disabled, reducedMotion }: CellProps) {
  const baseClasses = "w-full h-full rounded-xl cartoon-border transition-all duration-200";
  const interactiveClasses = !disabled && !value
    ? "hover:bg-muted cursor-pointer"
    : "";
  const winningClasses = isWinning
    ? "bg-yellow-200 animate-[bounceIn_0.3s_ease-out]"
    : "bg-card";

  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`${baseClasses} ${interactiveClasses} ${winningClasses}`}
      aria-label={value ? `${PLAYER_NAMES[value]}` : "Empty cell"}
    >
      {value === "diglett" && (
        <Diglett animate={isRecent} reduced={reducedMotion} />
      )}
      {value === "magikarp" && (
        <Magikarp animate={isRecent} reduced={reducedMotion} />
      )}
    </button>
  );
}
