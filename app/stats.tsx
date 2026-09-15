import React from 'react';
import { View } from 'react-native';

import { BannerAdSlot } from '@/components/BannerAdSlot';
import { Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { todayKey } from '@/logic/dateKey';
import { useResultsStore } from '@/store/useResultsStore';
import { useTheme } from '@/theme';

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function Figure({ label, value }: { label: string; value: string }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        minWidth: 140,
        padding: spacing.base,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
      }}
    >
      <Text variant="numeric">{value}</Text>
      <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

export default function StatsScreen() {
  const { colors, spacing } = useTheme();
  const stats = useResultsStore((s) => s.stats)(todayKey());

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen scroll>
        {stats.played === 0 ? (
          <Text variant="body" tone="muted" style={{ marginTop: spacing['2xl'] }}>
            {t('noStatsYet')}
          </Text>
        ) : (
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.base }}
          >
            <Figure label={t('streakLabel')} value={String(stats.currentStreak)} />
            <Figure label={t('bestLabel')} value={String(stats.bestStreak)} />
            <Figure label={t('playedLabel')} value={String(stats.played)} />
            <Figure label={t('wonLabel')} value={String(stats.won)} />
            <Figure
              label={t('bestTimeLabel')}
              value={stats.bestTime === null ? '—' : formatSeconds(stats.bestTime)}
            />
          </View>
        )}
      </Screen>
      <BannerAdSlot />
    </View>
  );
}
