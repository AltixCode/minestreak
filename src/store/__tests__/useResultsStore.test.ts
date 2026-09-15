import AsyncStorage from '@react-native-async-storage/async-storage';

import { useResultsStore } from '../useResultsStore';

const KEY = 'minestreak.results.v1';

beforeEach(async () => {
  await AsyncStorage.clear();
  useResultsStore.getState().resetForTests();
  jest.restoreAllMocks();
});

describe('hydrate', () => {
  it('starts empty', async () => {
    await useResultsStore.getState().hydrate();
    expect(useResultsStore.getState()).toMatchObject({ results: {}, isHydrated: true });
  });

  it('restores saved results', async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify({ '2026-09-15': { won: true, seconds: 40 } }));
    await useResultsStore.getState().hydrate();
    expect(useResultsStore.getState().results['2026-09-15']?.won).toBe(true);
  });

  it('survives a corrupt blob', async () => {
    await AsyncStorage.setItem(KEY, 'nonsense');
    await useResultsStore.getState().hydrate();
    expect(useResultsStore.getState()).toMatchObject({ results: {}, isHydrated: true });
  });

  it('becomes hydrated even when the store cannot be read', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('locked'));
    await useResultsStore.getState().hydrate();
    expect(useResultsStore.getState().isHydrated).toBe(true);
  });
});

describe('record', () => {
  it('records a win and persists it', async () => {
    useResultsStore.getState().record('2026-09-15', true, 50);
    expect(useResultsStore.getState().results['2026-09-15']).toEqual({ won: true, seconds: 50 });
    const raw = await AsyncStorage.getItem(KEY);
    expect(JSON.parse(raw!)['2026-09-15'].won).toBe(true);
  });

  it('records a loss', () => {
    useResultsStore.getState().record('2026-09-15', false, 9);
    expect(useResultsStore.getState().results['2026-09-15']?.won).toBe(false);
  });

  it('never downgrades a win to a later loss', () => {
    const { record } = useResultsStore.getState();
    record('2026-09-15', true, 50);
    record('2026-09-15', false, 5);
    expect(useResultsStore.getState().results['2026-09-15']).toEqual({ won: true, seconds: 50 });
  });

  it('keeps the faster win when a day is replayed slower', () => {
    const { record } = useResultsStore.getState();
    record('2026-09-15', true, 50);
    record('2026-09-15', true, 90);
    expect(useResultsStore.getState().results['2026-09-15']?.seconds).toBe(50);
  });

  it('improves the time when the replay is faster', () => {
    const { record } = useResultsStore.getState();
    record('2026-09-15', true, 90);
    record('2026-09-15', true, 50);
    expect(useResultsStore.getState().results['2026-09-15']?.seconds).toBe(50);
  });

  it('upgrades a loss to a win', () => {
    const { record } = useResultsStore.getState();
    record('2026-09-15', false, 9);
    record('2026-09-15', true, 70);
    expect(useResultsStore.getState().results['2026-09-15']?.won).toBe(true);
  });

  it('does not throw when persistence fails', () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('full'));
    expect(() => useResultsStore.getState().record('2026-09-15', true, 10)).not.toThrow();
  });
});
