import { contrastRatio } from '../color';
import { NUMBER_TONES_DARK, NUMBER_TONES_LIGHT, numberTone } from '../numberTones';
import { darkPalette, lightPalette } from '../tokens';

describe('numberTone', () => {
  it('gives each adjacency count its own colour', () => {
    expect(numberTone(1, false)).toBe(NUMBER_TONES_LIGHT[0]);
    expect(numberTone(3, false)).toBe(NUMBER_TONES_LIGHT[2]);
  });

  it('uses a different set in dark mode', () => {
    expect(numberTone(1, true)).toBe(NUMBER_TONES_DARK[0]);
    expect(numberTone(1, true)).not.toBe(numberTone(1, false));
  });

  it('clamps rather than returning undefined for an impossible count', () => {
    expect(numberTone(0, false)).toBeDefined();
    expect(numberTone(99, false)).toBeDefined();
  });
});

describe('legibility', () => {
  it('keeps every light-mode number readable on the revealed surface', () => {
    // The digit IS the information. A tone that fails here makes one number on
    // the board unreadable, which is the worst possible place for it.
    for (let n = 1; n <= NUMBER_TONES_LIGHT.length; n += 1) {
      expect(contrastRatio(numberTone(n, false), lightPalette.surface)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps every dark-mode number readable on the revealed surface', () => {
    for (let n = 1; n <= NUMBER_TONES_DARK.length; n += 1) {
      expect(contrastRatio(numberTone(n, true), darkPalette.surface)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('has no duplicate tone within a set', () => {
    expect(new Set(NUMBER_TONES_LIGHT).size).toBe(NUMBER_TONES_LIGHT.length);
    expect(new Set(NUMBER_TONES_DARK).size).toBe(NUMBER_TONES_DARK.length);
  });
});
