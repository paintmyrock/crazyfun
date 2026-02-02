import { Board, Player, CellValue, WINNING_LINES } from "./types";

/**
 * Check if there's a winner and return the player and winning line
 */
export function checkWinner(board: Board): {
  winner: Player | null;
  winningLine: number[] | null;
} {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, winningLine: line };
    }
  }
  return { winner: null, winningLine: null };
}

/**
 * Check if the board is full (draw condition)
 */
export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

/**
 * Get all empty cell indices
 */
export function getEmptyCells(board: Board): number[] {
  return board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);
}

/**
 * Find a winning move for the given player
 */
function findWinningMove(board: Board, player: Player): number | null {
  for (const line of WINNING_LINES) {
    const values = line.map((i) => board[i]);
    const playerCount = values.filter((v) => v === player).length;
    const emptyCount = values.filter((v) => v === null).length;

    if (playerCount === 2 && emptyCount === 1) {
      const emptyIndex = line.find((i) => board[i] === null);
      if (emptyIndex !== undefined) return emptyIndex;
    }
  }
  return null;
}

/**
 * CPU move logic with medium difficulty
 * Strategy priority: win > block > center > corner > random
 */
export function getCpuMove(board: Board, cpuPlayer: Player): number | null {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return null;

  const opponent: Player = cpuPlayer === "diglett" ? "magikarp" : "diglett";

  // 1. Try to win
  const winMove = findWinningMove(board, cpuPlayer);
  if (winMove !== null) return winMove;

  // 2. Block opponent's winning move
  const blockMove = findWinningMove(board, opponent);
  if (blockMove !== null) return blockMove;

  // 3. Take center if available
  if (board[4] === null) return 4;

  // 4. Take a corner if available
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Take any available edge
  const edges = [1, 3, 5, 7].filter((i) => board[i] === null);
  if (edges.length > 0) {
    return edges[Math.floor(Math.random() * edges.length)];
  }

  // Fallback: random empty cell
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

/**
 * Create initial empty board
 */
export function createEmptyBoard(): Board {
  return Array(9).fill(null);
}
