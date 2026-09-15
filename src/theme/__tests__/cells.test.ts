import { contrastRatio } from '../color';
import { darkCells, lightCells, cellsFor } from '../cells';
import { darkPalette, lightPalette } from '../tokens';

/**
 * The separation a player needs between explored and unexplored ground.
 *
 * Not a WCAG text figure — this is surface against surface. The value it
 * replaced was 1.08:1, which is invisible; anything below this is a regression
 * of the defect found on a real device.
 */
const MIN_STATE_SEPARATION = 1.75;

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
    expect(contrastRatio(darkCells.hidden, darkCells.revealed)).toBeGreaterThan(1.5);
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
