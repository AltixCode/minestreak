import { cloneBoard, neighboursOf, reveal, type Board, type Point } from './board';

/**
 * The no-guess solver.
 *
 * This is what makes the app's promise true: it plays a board using only
 * deduction a person could follow, and reports whether the whole board comes
 * out. If it cannot finish, the board would have needed a coin flip somewhere,
 * and the generator throws it away.
 *
 * Two rules, applied until neither fires:
 *
 *  1. **Single point.** A revealed number whose hidden neighbours exactly equal
 *     its remaining count — all mines. One whose flags already equal its count —
 *     all remaining neighbours are safe.
 *  2. **Subset.** Where one number's hidden neighbours are a subset of
 *     another's, the difference resolves: if the counts differ by the size of
 *     the difference, every cell in it is a mine; if the counts are equal, every
 *     cell in it is safe. This is the rule that separates a solver a person can
 *     follow from one that needs a SAT engine, and it is what "no guessing"
 *     means in practice — the classic 1-2-1 and 1-2-2-1 patterns are exactly
 *     this.
 */

const key = (p: Point) => `${p.r},${p.c}`;

interface Knowledge {
  /** Cells deduced to be mines. */
  mines: Set<string>;
  /** Cells deduced to be safe and not yet revealed. */
  safe: Set<string>;
}

/** The constraints a board's revealed numbers impose. */
function constraintsOf(board: Board, known: Knowledge): { cells: string[]; count: number }[] {
  const out: { cells: string[]; count: number }[] = [];
  board.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (!cell.revealed || cell.mine) return;
      const hidden: string[] = [];
      let flagged = 0;
      for (const n of neighboursOf(board, { r, c })) {
        const k = key(n);
        if (board[n.r]![n.c]!.revealed) continue;
        if (known.mines.has(k)) flagged += 1;
        else hidden.push(k);
      }
      if (hidden.length > 0) out.push({ cells: hidden, count: cell.adjacent - flagged });
    }),
  );
  return out;
}

/** One pass of both rules. Returns true when anything new was deduced. */
function deduce(board: Board, known: Knowledge): boolean {
  const constraints = constraintsOf(board, known);
  let progress = false;

  // Rule 1: single point.
  for (const { cells, count } of constraints) {
    if (count === 0) {
      for (const c of cells) if (!known.safe.has(c)) { known.safe.add(c); progress = true; }
    } else if (count === cells.length) {
      for (const c of cells) if (!known.mines.has(c)) { known.mines.add(c); progress = true; }
    }
  }
  if (progress) return true;

  // Rule 2: subset.
  for (const a of constraints) {
    for (const b of constraints) {
      if (a === b) continue;
      if (a.cells.length >= b.cells.length) continue;
      const setA = new Set(a.cells);
      if (!a.cells.every((c) => b.cells.includes(c))) continue;

      const difference = b.cells.filter((c) => !setA.has(c));
      if (difference.length === 0) continue;
      const delta = b.count - a.count;

      if (delta === 0) {
        for (const c of difference) if (!known.safe.has(c)) { known.safe.add(c); progress = true; }
      } else if (delta === difference.length) {
        for (const c of difference) if (!known.mines.has(c)) { known.mines.add(c); progress = true; }
      }
    }
  }
  return progress;
}

export interface SolveResult {
  /** True when the whole board came out with no guess needed. */
  solved: boolean;
  /** Cells the solver had to reveal, in order — useful for a hint. */
  revealed: Point[];
}

/**
 * Plays the board from `start` using deduction only.
 *
 * `start` must be a safe opening cell; the generator guarantees one.
 */
export function solveNoGuess(original: Board, start: Point): SolveResult {
  let board = reveal(cloneBoard(original), start);
  const known: Knowledge = { mines: new Set(), safe: new Set() };
  const revealed: Point[] = [start];

  const total = board.length * (board[0]?.length ?? 0);
  const mines = board.flat().filter((cell) => cell.mine).length;

  for (let round = 0; round < total * 2; round += 1) {
    const hiddenLeft = board.flat().filter((cell) => !cell.revealed).length;
    if (hiddenLeft === mines) return { solved: true, revealed };

    if (!deduce(board, known)) return { solved: false, revealed };

    // Reveal everything now known safe; that is what feeds the next round.
    let openedAny = false;
    for (const k of [...known.safe]) {
      const [r, c] = k.split(',').map(Number);
      const at = { r: r!, c: c! };
      if (board[at.r]![at.c]!.revealed) continue;
      // The solver must never open a mine; if it would, the deduction was wrong.
      if (board[at.r]![at.c]!.mine) return { solved: false, revealed };
      board = reveal(board, at);
      revealed.push(at);
      openedAny = true;
    }
    if (!openedAny && known.mines.size === 0) return { solved: false, revealed };
  }
  return { solved: false, revealed };
}
