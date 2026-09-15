import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';

import Home from '../index';
import { testRouter } from './testRouter';
import { renderWithProviders } from '@/components/__tests__/renderWithProviders';
import { t } from '@/i18n';
import { todayKey } from '@/logic/dateKey';
import { useAdsConsentStore } from '@/store/useAdsConsentStore';
import { usePremiumStore } from '@/store/usePremiumStore';
import { useResultsStore } from '@/store/useResultsStore';

const TODAY = todayKey();
const realHydrate = useResultsStore.getState().hydrate;

const seed = (results: Record<string, { won: boolean; seconds: number }>) =>
  AsyncStorage.setItem('minestreak.results.v1', JSON.stringify(results));

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  usePremiumStore.setState({ isPremium: false, isReady: true });
  useAdsConsentStore.setState({ consent: { canServeAds: true, offerPrivacyOptions: false } });
  useResultsStore.setState({ results: {}, isHydrated: false, hydrate: realHydrate });
});

describe('Home', () => {
  it('leads with the promise the app is built on', async () => {
    const { getByText } = await renderWithProviders(<Home />);
    expect(getByText(t('todayTitle'))).toBeTruthy();
    expect(getByText(t('fairPromise'))).toBeTruthy();
  });

  it('opens today’s board', async () => {
    const { getByLabelText } = await renderWithProviders(<Home />);
    await fireEvent.press(getByLabelText(t('digMode')));
    expect(testRouter.push).toHaveBeenCalledWith(`/play/${TODAY}`);
  });

  it('shows a dash instead of a zero streak until results have loaded', async () => {
    const hydrate = jest.fn().mockImplementation(() => new Promise<void>(() => {}));
    useResultsStore.setState({ results: {}, isHydrated: false, hydrate });
    const { getByText } = await renderWithProviders(<Home />);
    expect(getByText('—')).toBeTruthy();
  });

  it('shows the streak once results have loaded', async () => {
    await seed({ [TODAY]: { won: true, seconds: 40 } });
    const { getByText } = await renderWithProviders(<Home />);
    await waitFor(() => expect(getByText('1')).toBeTruthy());
  });

  it('marks a day already cleared', async () => {
    await seed({ [TODAY]: { won: true, seconds: 40 } });
    const { getByText } = await renderWithProviders(<Home />);
    await waitFor(() => expect(getByText(t('wonTitle'))).toBeTruthy());
    expect(getByText(t('playAgain'))).toBeTruthy();
  });

  it('routes to the archive, stats and settings', async () => {
    const { getByLabelText } = await renderWithProviders(<Home />);
    await fireEvent.press(getByLabelText(t('archiveTitle')));
    await fireEvent.press(getByLabelText(t('statsTitle')));
    await fireEvent.press(getByLabelText(t('settingsTitle')));
    expect(testRouter.push).toHaveBeenCalledWith('/archive');
    expect(testRouter.push).toHaveBeenCalledWith('/stats');
    expect(testRouter.push).toHaveBeenCalledWith('/settings');
  });

  it('shows a banner to a free user and none to a premium one', async () => {
    const free = await renderWithProviders(<Home />);
    expect(free.queryByTestId('banner-ad')).not.toBeNull();
    usePremiumStore.setState({ isPremium: true });
    const paid = await renderWithProviders(<Home />);
    expect(paid.queryByTestId('banner-ad')).toBeNull();
  });
});
