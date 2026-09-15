import { contrastRatio } from '../color';
import { darkCells, lightCells, cellsFor } from '../cells';
import { NUMBER_TONES_DARK, NUMBER_TONES_LIGHT } from '../numberTones';
import { darkPalette, lightPalette } from '../tokens';

/**
 * The separation a player needs between explored and unexplored ground.
 *
 * 3:1 is the WCAG threshold for a non-text UI component, which is what this is:
 * a state read at a glance across a whole board rather than a piece of text.
 * The value it replaced was 1.08:1 — invisible — and an intermediate fix stopped
 * at 1.90:1, which was better and still under the bar.
 */
const MIN_STATE_SEPARATION = 3;

describe('cell surfaces', () => {
  it('makes a revealed cell clearly distinguishable from a hidden one', () => {
    expect(contrastRatio(darkCells.hidden, darkCells.revealed)).toBeGreaterThan(
      MIN_STATE_SEPARATION,
    );
    expect(contrastRatio(lightCells.hidden, lightCells.revealed)).toBeGreaterThan(
      MIN_STATE_SEPARATION,
    );
  });

  // The regression this file exists to prevent, stated as a number.
  it('is nowhere near the 1.08:1 it replaced', () => {
    expect(contrastRatio(darkCells.hidden, darkCells.revealed)).toBeGreaterThan(3);
  });

  // The dark theme's revealed cell is nearly black, so every adjacency number
  // has room to spare. This is the constraint that would bind first if anyone
  // lightened it.
  it('keeps every adjacency number legible on the revealed cell', () => {
    for (const tone of NUMBER_TONES_DARK) {
      expect(contrastRatio(tone, darkCells.revealed)).toBeGreaterThan(4.5);
    }
    for (const tone of NUMBER_TONES_LIGHT) {
      expect(contrastRatio(tone, lightCells.revealed)).toBeGreaterThan(4.5);
    }
  });

  it('keeps the number on a revealed cell comfortably legible', () => {
    expect(contrastRatio(darkPalette.text, darkCells.revealed)).toBeGreaterThan(4.5);
    expect(contrastRatio(lightPalette.text, lightCells.revealed)).toBeGreaterThan(4.5);
  });

  // The flag has its own colour precisely so this can pass at the same time as
  // the separation test above. Using the shared `danger` token failed one or
  // the other in both themes.
  it('keeps a flag clearly visible on the hidden cell it sits on', () => {
    expect(contrastRatio(darkCells.flag, darkCells.hidden)).toBeGreaterThan(4.5);
    expect(contrastRatio(lightCells.flag, lightCells.hidden)).toBeGreaterThan(4.5);
  });

  it('separates a hidden cell from the page behind the grid', () => {
    expect(contrastRatio(darkCells.hidden, darkPalette.background)).toBeGreaterThan(1.5);
    expect(contrastRatio(lightCells.hidden, lightPalette.background)).toBeGreaterThan(1.1);
  });

  it('picks the right set for the theme', () => {
    expect(cellsFor(true)).toBe(darkCells);
    expect(cellsFor(false)).toBe(lightCells);
  });
});
