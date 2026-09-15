import { mineCount, neighboursOf } from '../board';
import { boardFor } from '../daily';
import { generateBoard, shapeForPhase } from '../generate';
import { solveNoGuess } from '../solve';

describe('shapeForPhase', () => {
  it('varies across a week rather than being one difficulty forever', () => {
    const week = Array.from({ length: 7 }, (_, i) => JSON.stringify(shapeForPhase(i)));
    expect(new Set(week).size).toBeGreaterThan(1);
  });

  it('never packs more mines than the board can hold around a safe opening', () => {
    for (let phase = 0; phase < 7; phase += 1) {
      const shape = shapeForPhase(phase);
      expect(shape.mines).toBeLessThan(shape.width * shape.height - 9);
    }
  });
});

describe('generateBoard', () => {
  it('is deterministic for a seed', () => {
    expect(generateBoard(shapeForPhase(0), 99)).toEqual(generateBoard(shapeForPhase(0), 99));
  });

  it.each([0, 3, 6])('produces a phase-%i board clearable with no guess', (phase) => {
    // This is the whole product promise: an ordinary minesweeper regularly ends
    // on a 50/50 where the player can only flip a coin.
    const { board, start } = generateBoard(shapeForPhase(phase), phase * 101 + 7);
    expect(solveNoGuess(board, start).solved).toBe(true);
  });

  it('places exactly the number of mines asked for', () => {
    const shape = shapeForPhase(2);
    expect(mineCount(generateBoard(shape, 5).board)).toBe(shape.mines);
  });

  it('keeps the opening cell and everything touching it clear of mines', () => {
    // Otherwise the first click can open a lone number, or end the board.
    const { board, start } = generateBoard(shapeForPhase(1), 31);
    expect(board[start.r]![start.c]!.mine).toBe(false);
    for (const n of neighboursOf(board, start)) {
      expect(board[n.r]![n.c]!.mine).toBe(false);
    }
  });

  it('holds up across many seeds', () => {
    for (let seed = 0; seed < 6; seed += 1) {
      const { board, start } = generateBoard(shapeForPhase(0), seed);
      expect(solveNoGuess(board, start).solved).toBe(true);
    }
  });
});

describe('boardFor', () => {
  it('is deterministic — every device must get the same day', () => {
    expect(boardFor('2026-09-15')).toEqual(boardFor('2026-09-15'));
  });

  it('gives different boards on different days', () => {
    expect(boardFor('2026-09-15')).not.toEqual(boardFor('2026-09-16'));
  });

  it.each(['2026-09-15', '2026-09-18', '2026-09-21'])('ships a no-guess board on %s', (key) => {
    const { board, start } = boardFor(key);
    expect(solveNoGuess(board, start).solved).toBe(true);
  });
});
