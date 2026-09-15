import { fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';

import PlayRoute from '../play/[date]';
import { setRouteParams } from './testRouter';
import { renderWithProviders } from '@/components/__tests__/renderWithProviders';
import { t } from '@/i18n';
import { mineCount } from '@/logic/board';
import { boardFor } from '@/logic/daily';
import { solveNoGuess } from '@/logic/solve';
import { useAdsConsentStore } from '@/store/useAdsConsentStore';
import { usePremiumStore } from '@/store/usePremiumStore';
import { useResultsStore } from '@/store/useResultsStore';

// A fixed date keeps the board stable, so these assertions describe a real one.
const DATE = '2026-09-18';
const { board: BOARD, start: START } = boardFor(DATE);

beforeEach(() => {
  jest.clearAllMocks();
  usePremiumStore.setState({ isPremium: false, isReady: true });
  useAdsConsentStore.setState({ consent: { canServeAds: true, offerPrivacyOptions: false } });
  useResultsStore.setState({ results: {}, isHydrated: true });
  setRouteParams({ date: DATE });
});

describe('Play', () => {
  it('shows how many mines are left', async () => {
    const { getByText } = await renderWithProviders(<PlayRoute />);
    expect(getByText(t('minesLeft', { count: mineCount(BOARD) }))).toBeTruthy();
  });

  it('renders every cell', async () => {
    const { getAllByLabelText } = await renderWithProviders(<PlayRoute />);
    const cells = getAllByLabelText(/^(Row|Fila|Ligne|Zeile|Γραμμή)/);
    expect(cells).toHaveLength(BOARD.length * BOARD[0]!.length);
  });

  it('starts in dig mode and toggles to flagging', async () => {
    const { getByLabelText } = await renderWithProviders(<PlayRoute />);
    expect(getByLabelText(t('digMode')).props.accessibilityState).toMatchObject({ checked: false });
    await fireEvent.press(getByLabelText(t('digMode')));
    await waitFor(() =>
      expect(getByLabelText(t('flagMode')).props.accessibilityState).toMatchObject({ checked: true }),
    );
  });

  it('digging reveals a cell', async () => {
    const { getByLabelText, getAllByLabelText } = await renderWithProviders(<PlayRoute />);
    const before = getAllByLabelText(new RegExp(t('cellHidden'))).length;
    await fireEvent.press(
      getByLabelText(t('cellA11y', { row: START.r + 1, col: START.c + 1, state: t('cellHidden') })),
    );
    await waitFor(() =>
      expect(getAllByLabelText(new RegExp(t('cellHidden'))).length).toBeLessThan(before),
    );
  });

  it('flagging marks a cell instead of digging it', async () => {
    const { getByLabelText } = await renderWithProviders(<PlayRoute />);
    await fireEvent.press(getByLabelText(t('digMode')));
    const cell = t('cellA11y', { row: START.r + 1, col: START.c + 1, state: t('cellHidden') });
    await fireEvent.press(getByLabelText(cell));
    await waitFor(() =>
      expect(
        getByLabelText(t('cellA11y', { row: START.r + 1, col: START.c + 1, state: t('cellFlagged') })),
      ).toBeTruthy(),
    );
  });

  it('a hint opens a cell the deduction solver would open — never a guess', async () => {
    const { getByLabelText, getAllByLabelText } = await renderWithProviders(<PlayRoute />);
    const before = getAllByLabelText(new RegExp(t('cellHidden'))).length;
    await fireEvent.press(getByLabelText(t('hint')));
    await waitFor(() =>
      expect(getAllByLabelText(new RegExp(t('cellHidden'))).length).toBeLessThan(before),
    );
  });

  it('clears the board when every deduced cell is opened, and records the win', async () => {
    // Premium, because a free player gets exactly one hint.
    usePremiumStore.setState({ isPremium: true });
    const steps = solveNoGuess(BOARD, START).revealed.length + 4;
    const { getByLabelText, getByText, queryByLabelText } = await renderWithProviders(<PlayRoute />);
    for (let i = 0; i < steps; i += 1) {
      const hint = queryByLabelText(t('hint'));
      if (!hint) break;
      await fireEvent.press(hint);
    }
    await waitFor(() => expect(getByText(t('wonTitle'))).toBeTruthy());
    expect(useResultsStore.getState().results[DATE]?.won).toBe(true);
    expect(getByLabelText(t('restart'))).toBeTruthy();
  });

  it("the day's board really is clearable without a guess", () => {
    expect(solveNoGuess(BOARD, START).solved).toBe(true);
  });
});
