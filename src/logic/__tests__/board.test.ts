import {
  boardFromMines,
  flagCount,
  isLost,
  isWon,
  mineCount,
  neighboursOf,
  reveal,
  toggleFlag,
} from '../board';

const at = (r: number, c: number) => ({ r, c });
const build = (w: number, h: number, mines: string[]) => boardFromMines(w, h, new Set(mines));

describe('boardFromMines', () => {
  it('places the mines it is given', () => {
    const board = build(3, 3, ['0,0', '2,2']);
    expect(board[0]![0]!.mine).toBe(true);
    expect(board[2]![2]!.mine).toBe(true);
    expect(mineCount(board)).toBe(2);
  });

  it('counts adjacent mines, diagonals included', () => {
    const board = build(3, 3, ['0,0']);
    expect(board[1]![1]!.adjacent).toBe(1);
    expect(board[0]![1]!.adjacent).toBe(1);
    expect(board[2]![2]!.adjacent).toBe(0);
  });

  it('counts a cell surrounded by mines', () => {
    const board = build(3, 3, ['0,0', '0,1', '0,2', '1,0', '1,2', '2,0', '2,1', '2,2']);
    expect(board[1]![1]!.adjacent).toBe(8);
  });
});

describe('neighboursOf', () => {
  it('gives eight neighbours in the middle and three in a corner', () => {
    const board = build(3, 3, []);
    expect(neighboursOf(board, at(1, 1))).toHaveLength(8);
    expect(neighboursOf(board, at(0, 0))).toHaveLength(3);
  });
});

describe('reveal', () => {
  it('reveals a numbered cell without flooding', () => {
    const board = reveal(build(3, 3, ['0,0']), at(1, 1));
    expect(board[1]![1]!.revealed).toBe(true);
    expect(board[2]![2]!.revealed).toBe(false);
  });

  it('floods through cells with no adjacent mines', () => {
    const board = reveal(build(3, 3, ['0,0']), at(2, 2));
    // (2,2) has no adjacent mine, so the flood reaches the whole safe area.
    expect(board[2]![1]!.revealed).toBe(true);
    expect(board[1]![1]!.revealed).toBe(true);
    expect(board[0]![0]!.revealed).toBe(false);
  });

  it('does not mutate the board it was given', () => {
    const before = build(3, 3, ['0,0']);
    reveal(before, at(2, 2));
    expect(before[2]![2]!.revealed).toBe(false);
  });

  it('refuses to reveal a flagged cell — a flag means "do not touch"', () => {
    const flagged = toggleFlag(build(3, 3, ['0,0']), at(1, 1));
    expect(reveal(flagged, at(1, 1))[1]![1]!.revealed).toBe(false);
  });

  it('ignores an out-of-range cell rather than throwing', () => {
    const board = build(3, 3, []);
    expect(reveal(board, at(9, 9))).toBe(board);
  });
});

describe('toggleFlag', () => {
  it('flags and unflags', () => {
    let board = toggleFlag(build(3, 3, []), at(0, 0));
    expect(board[0]![0]!.flagged).toBe(true);
    expect(flagCount(board)).toBe(1);
    board = toggleFlag(board, at(0, 0));
    expect(board[0]![0]!.flagged).toBe(false);
  });

  it('refuses to flag a revealed cell', () => {
    const board = reveal(build(3, 3, ['0,0']), at(2, 2));
    expect(toggleFlag(board, at(2, 2))).toBe(board);
  });
});

describe('isWon / isLost', () => {
  it('wins once every safe cell is revealed, flags or not', () => {
    let board = build(2, 2, ['0,0']);
    board = reveal(board, at(0, 1));
    board = reveal(board, at(1, 0));
    board = reveal(board, at(1, 1));
    expect(isWon(board)).toBe(true);
    expect(isLost(board)).toBe(false);
  });

  it('is not won while a safe cell is still hidden', () => {
    expect(isWon(reveal(build(2, 2, ['0,0']), at(0, 1)))).toBe(false);
  });

  it('loses the moment a mine is revealed', () => {
    const board = build(2, 2, ['0,0']);
    board[0]![0]!.revealed = true;
    expect(isLost(board)).toBe(true);
  });
});
