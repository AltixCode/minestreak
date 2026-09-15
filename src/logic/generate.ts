import { makeRng, shuffled, type Rng } from './rng';
import { solveNoGuess } from './solve';
import { boardFromMines, type Board, type Point } from './board';

/**
 * Generates a board that is provably clearable without a single guess.
 *
 * Place mines, ask the deduction solver to play it, and throw the whole board
 * away if it gets stuck. That rejection loop is the product: an ordinary
 * minesweeper regularly ends on a 50/50 where the player can only flip a coin,
 * and "never a coin flip" is the reason to use this app rather than the one
 * already on the phone.
 *
 * The opening cell is fixed and always safe, with no mine in the eight cells
 * around it, so the first click always opens a real area rather than a lone 3.
 */

export interface GeneratedBoard {
  board: Board;
  /** The guaranteed-safe opening cell. */
  start: Point;
}

export interface BoardShape {
  width: number;
  height: number;
  mines: number;
}

/** Difficulty across a seven-day cycle, so a week has a shape. */
export function shapeForPhase(phase: number): BoardShape {
  if (phase < 2) return { width: 8, height: 8, mines: 8 };
  if (phase < 5) return { width: 9, height: 9, mines: 12 };
  return { width: 10, height: 10, mines: 18 };
}

function placeMines(shape: BoardShape, start: Point, rng: Rng): Set<string> {
  const forbidden = new Set<string>();
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) forbidden.add(`${start.r + dr},${start.c + dc}`);
  }
  const candidates: string[] = [];
  for (let r = 0; r < shape.height; r += 1) {
    for (let c = 0; c < shape.width; c += 1) {
      const k = `${r},${c}`;
      if (!forbidden.has(k)) candidates.push(k);
    }
  }
  return new Set(shuffled(candidates, rng).slice(0, shape.mines));
}

export function generateBoard(shape: BoardShape, seed: number): GeneratedBoard {
  const rng = makeRng(seed);
  const start: Point = { r: Math.floor(shape.height / 2), c: Math.floor(shape.width / 2) };

  // Bounded: a generator that cannot satisfy its own constraint must fail
  // loudly at build time rather than hang the app.
  for (let attempt = 0; attempt < 4000; attempt += 1) {
    const board = boardFromMines(shape.width, shape.height, placeMines(shape, start, rng));
    if (solveNoGuess(board, start).solved) return { board, start };
  }

  throw new Error(`MineStreak: no no-guess board for seed ${seed}`);
}
