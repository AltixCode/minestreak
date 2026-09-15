/**
 * MineStreak — one fair minesweeper board a day.
 *
 * "Fair" is the whole product: every board is provably clearable by deduction
 * alone, with no 50/50 guess anywhere. That property is produced by the
 * generator and enforced by the solver in `solve.ts`; this file is only the
 * rules of the board itself.
 *
 * Pure: no React, no React Native, no Expo.
 */

export interface Cell {
  mine: boolean;
  /** Mines in the eight surrounding cells. */
  adjacent: number;
  revealed: boolean;
  flagged: boolean;
}

export type Board = Cell[][];

export interface Point {
  r: number;
  c: number;
}

export const NEIGHBOURS: Point[] = [
  { r: -1, c: -1 }, { r: -1, c: 0 }, { r: -1, c: 1 },
  { r: 0, c: -1 }, { r: 0, c: 1 },
  { r: 1, c: -1 }, { r: 1, c: 0 }, { r: 1, c: 1 },
];

export const inBounds = (board: Board, at: Point): boolean =>
  at.r >= 0 && at.r < board.length && at.c >= 0 && at.c < (board[0]?.length ?? 0);

export function neighboursOf(board: Board, at: Point): Point[] {
  return NEIGHBOURS.map((d) => ({ r: at.r + d.r, c: at.c + d.c })).filter((p) => inBounds(board, p));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

/** Builds a board from mine positions, filling in every adjacency count. */
export function boardFromMines(width: number, height: number, mines: Set<string>): Board {
  const board: Board = Array.from({ length: height }, (_, r) =>
    Array.from({ length: width }, (_, c) => ({
      mine: mines.has(`${r},${c}`),
      adjacent: 0,
      revealed: false,
      flagged: false,
    })),
  );
  for (let r = 0; r < height; r += 1) {
    for (let c = 0; c < width; c += 1) {
      board[r]![c]!.adjacent = neighboursOf(board, { r, c }).filter(
        (n) => board[n.r]![n.c]!.mine,
      ).length;
    }
  }
  return board;
}

/**
 * Reveals a cell, flooding outwards through cells with no adjacent mines.
 *
 * Returns a new board. Revealing a flagged cell does nothing: a flag is the
 * player saying "do not touch this", and honouring it prevents the most
 * annoying way to lose a board by accident.
 */
export function reveal(board: Board, at: Point): Board {
  if (!inBounds(board, at)) return board;
  const start = board[at.r]![at.c]!;
  if (start.revealed || start.flagged) return board;

  const next = cloneBoard(board);
  const queue: Point[] = [at];
  const seen = new Set<string>([`${at.r},${at.c}`]);

  while (queue.length > 0) {
    const cell = queue.shift()!;
    const target = next[cell.r]![cell.c]!;
    if (target.revealed || target.flagged) continue;
    target.revealed = true;
    if (target.mine) continue;
    if (target.adjacent !== 0) continue;
    for (const n of neighboursOf(next, cell)) {
      const key = `${n.r},${n.c}`;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push(n);
    }
  }
  return next;
}

/** Toggles a flag. A revealed cell cannot be flagged. */
export function toggleFlag(board: Board, at: Point): Board {
  if (!inBounds(board, at)) return board;
  const cell = board[at.r]![at.c]!;
  if (cell.revealed) return board;
  const next = cloneBoard(board);
  next[at.r]![at.c]!.flagged = !cell.flagged;
  return next;
}

/** True once every cell that is not a mine has been revealed. */
export function isWon(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell.mine || cell.revealed));
}

/** True as soon as any mine has been revealed. */
export function isLost(board: Board): boolean {
  return board.some((row) => row.some((cell) => cell.mine && cell.revealed));
}

export function flagCount(board: Board): number {
  return board.flat().filter((cell) => cell.flagged).length;
}

export function mineCount(board: Board): number {
  return board.flat().filter((cell) => cell.mine).length;
}
