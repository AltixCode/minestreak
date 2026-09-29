import { mineCount } from "../board";
import { boardFor, practiceBoardFor } from "../daily";
import { solveNoGuess } from "../solve";

describe("practiceBoardFor", () => {
  it("keeps the same difficulty shape as the day it practices", () => {
    const daily = boardFor("2026-09-18");
    const practice = practiceBoardFor("2026-09-18", 12345);
    expect(practice.board.length).toBe(daily.board.length);
    expect(practice.board[0]!.length).toBe(daily.board[0]!.length);
    expect(mineCount(practice.board)).toBe(mineCount(daily.board));
  });

  it("is deterministic for a given seed, so it is testable", () => {
    expect(practiceBoardFor("2026-09-18", 777)).toEqual(
      practiceBoardFor("2026-09-18", 777),
    );
  });

  it("a different seed produces a genuinely different mine layout", () => {
    // This is the whole point: restarting must not replay the memorized map.
    expect(practiceBoardFor("2026-09-18", 1)).not.toEqual(
      practiceBoardFor("2026-09-18", 2),
    );
  });

  it("still ships a board clearable without a guess", () => {
    const { board, start } = practiceBoardFor("2026-09-18", 42);
    expect(solveNoGuess(board, start).solved).toBe(true);
  });

  it("draws a fresh seed on its own when none is supplied", () => {
    // Two calls with no seed must not collide onto the exact same layout —
    // that would be the "restart replays the same board" bug all over again.
    const a = practiceBoardFor("2026-09-18");
    const b = practiceBoardFor("2026-09-18");
    expect(a).not.toEqual(b);
  });
});
