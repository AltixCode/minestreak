import { dayIndex, type DateKey } from "./dateKey";
import { generateBoard, shapeForPhase, type GeneratedBoard } from "./generate";
import { seedFromKey } from "./rng";

function phaseOf(key: DateKey): number {
  return ((dayIndex(key) % 7) + 7) % 7;
}

/**
 * The day's board.
 *
 * A pure function of the date, so every device produces the identical board for
 * a given day with no backend and nothing to keep in sync.
 */
export function boardFor(key: DateKey): GeneratedBoard {
  return generateBoard(
    shapeForPhase(phaseOf(key)),
    seedFromKey(`minestreak:${key}`),
  );
}

/**
 * A fresh, non-daily board at the day's own difficulty.
 *
 * `boardFor` is deliberately the same board on every device, which is what
 * makes a streak meaningful -- but it also means replaying it after a loss
 * just replays a map the player has already partly memorized, which defeats
 * a Minesweeper. This is the practice board offered on every restart after a
 * finished game: same shape and mine count as today's puzzle, but a genuinely
 * new layout each call, so a restart is a new game rather than a rerun.
 *
 * `seed` is only a testing hook. Real callers never pass it, and each call
 * then draws its own seed so two consecutive restarts cannot collide onto the
 * same board.
 */
export function practiceBoardFor(
  key: DateKey,
  seed: number = randomSeed(),
): GeneratedBoard {
  return generateBoard(shapeForPhase(phaseOf(key)), seed);
}

/**
 * A non-deterministic 32-bit seed.
 *
 * `Math.random` is a plain JS built-in, not `react`/`react-native`/`expo-*`,
 * so this still satisfies src/logic's "no framework imports" rule.
 */
function randomSeed(): number {
  return Math.floor(Math.random() * 0x100000000) >>> 0;
}
