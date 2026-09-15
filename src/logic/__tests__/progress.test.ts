import { FREE_ARCHIVE_DAYS, bestStreak, canPlay, currentStreak, statsFrom, type ResultMap } from '../progress';

const win = (seconds = 60) => ({ won: true, seconds });
const loss = { won: false, seconds: 12 };

describe('currentStreak', () => {
  it('is zero with no history', () => {
    expect(currentStreak({}, '2026-09-15')).toBe(0);
  });

  it('counts consecutive wins ending today', () => {
    const results: ResultMap = {
      '2026-09-13': win(),
      '2026-09-14': win(),
      '2026-09-15': win(),
    };
    expect(currentStreak(results, '2026-09-15')).toBe(3);
  });

  it('does NOT break because today is unplayed — the day is still running', () => {
    const results: ResultMap = { '2026-09-13': win(), '2026-09-14': win() };
    expect(currentStreak(results, '2026-09-15')).toBe(2);
  });

  it('breaks on a loss', () => {
    const results: ResultMap = { '2026-09-13': win(), '2026-09-14': loss, '2026-09-15': win() };
    expect(currentStreak(results, '2026-09-15')).toBe(1);
  });

  it('breaks on a gap', () => {
    const results: ResultMap = { '2026-09-12': win(), '2026-09-15': win() };
    expect(currentStreak(results, '2026-09-15')).toBe(1);
  });

  it('counts across a DST boundary', () => {
    const results: ResultMap = {
      '2026-10-24': win(),
      '2026-10-25': win(),
      '2026-10-26': win(),
    };
    expect(currentStreak(results, '2026-10-26')).toBe(3);
  });
});

describe('bestStreak', () => {
  it('finds the longest run, not the most recent', () => {
    const results: ResultMap = {
      '2026-09-01': win(), '2026-09-02': win(), '2026-09-03': win(),
      '2026-09-08': win(),
    };
    expect(bestStreak(results)).toBe(3);
  });

  it('is zero with nothing won', () => {
    expect(bestStreak({ '2026-09-01': loss })).toBe(0);
  });
});

describe('statsFrom', () => {
  it('summarises an empty history', () => {
    expect(statsFrom({}, '2026-09-15')).toEqual({
      played: 0, won: 0, currentStreak: 0, bestStreak: 0, bestTime: null,
    });
  });

  it('counts plays, wins and the fastest clear', () => {
    const results: ResultMap = {
      '2026-09-14': win(90),
      '2026-09-15': win(45),
      '2026-09-13': loss,
    };
    const stats = statsFrom(results, '2026-09-15');
    expect(stats.played).toBe(3);
    expect(stats.won).toBe(2);
    expect(stats.bestTime).toBe(45);
  });
});

describe('canPlay', () => {
  it('always allows today', () => {
    expect(canPlay('2026-09-15', '2026-09-15', false)).toBe(true);
  });

  it('never allows a future day, even for Pro', () => {
    expect(canPlay('2026-09-16', '2026-09-15', true)).toBe(false);
  });

  it('gives a free player the last week', () => {
    expect(canPlay('2026-09-09', '2026-09-15', false)).toBe(true);
    expect(canPlay('2026-09-08', '2026-09-15', false)).toBe(false);
    expect(FREE_ARCHIVE_DAYS).toBe(7);
  });

  it('lets Pro reach back indefinitely', () => {
    expect(canPlay('2025-01-01', '2026-09-15', true)).toBe(true);
  });
});
