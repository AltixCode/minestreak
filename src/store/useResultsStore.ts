import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { todayKey, type DateKey } from '@/logic/dateKey';
import { statsFrom, type ResultMap, type Stats } from '@/logic/progress';

const STORAGE_KEY = 'minestreak.results.v1';

interface ResultsState {
  results: ResultMap;
  /** False until saved results have been read; gates rendering a streak. */
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  record: (key: DateKey, won: boolean, seconds: number) => void;
  stats: (today?: DateKey) => Stats;
  resetForTests: () => void;
}

async function persist(results: ResultMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch {
    // A failed write costs this session's record, not the app.
  }
}

export const useResultsStore = create<ResultsState>((set, get) => ({
  results: {},
  isHydrated: false,

  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : {};
      const results =
        parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as ResultMap) : {};
      set({ results, isHydrated: true });
    } catch {
      set({ results: {}, isHydrated: true });
    }
  },

  record(key, won, seconds) {
    const current = get().results;
    const previous = current[key];
    // A win is never downgraded by a later loss, and a slower win never
    // replaces a faster one — replaying a day must not make the record worse.
    if (previous?.won && (!won || previous.seconds <= seconds)) return;
    const next: ResultMap = { ...current, [key]: { won, seconds } };
    set({ results: next });
    void persist(next);
  },

  stats(today = todayKey()) {
    return statsFrom(get().results, today);
  },

  resetForTests() {
    set({ results: {}, isHydrated: false });
  },
}));
