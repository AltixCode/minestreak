import { boardFromMines, reveal } from '../board';
import { solveNoGuess } from '../solve';
import { generateBoard, shapeForPhase } from '../generate';

const at = (r: number, c: number) => ({ r, c });

describe('solveNoGuess', () => {
  it('clears a board with no mines at all', () => {
    const board = boardFromMines(4, 4, new Set());
    expect(solveNoGuess(board, at(0, 0)).solved).toBe(true);
  });

  it('clears a board deducible by single-point alone', () => {
    // One mine in a corner: opening the far corner floods, and the remaining
    // cells fall to counting.
    const board = boardFromMines(4, 4, new Set(['0,0']));
    expect(solveNoGuess(board, at(3, 3)).solved).toBe(true);
  });

  it('refuses a board that needs a guess', () => {
    // A classic unresolvable corner: two hidden cells, one mine, no number can
    // tell them apart.
    const board = boardFromMines(2, 3, new Set(['0,0']));
    const opened = reveal(board, at(0, 2));
    expect(solveNoGuess(opened, at(0, 2)).solved).toBe(false);
  });

  it('never opens a mine while deducing', () => {
    const { board, start } = generateBoard(shapeForPhase(0), 12345);
    const result = solveNoGuess(board, start);
    expect(result.solved).toBe(true);
    for (const cell of result.revealed) {
      expect(board[cell.r]![cell.c]!.mine).toBe(false);
    }
  });

  it('reports the cells it opened, starting from the opening cell', () => {
    const { board, start } = generateBoard(shapeForPhase(0), 777);
    const result = solveNoGuess(board, start);
    expect(result.revealed[0]).toEqual(start);
  });
});
