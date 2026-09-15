import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { BannerAdSlot } from '@/components/BannerAdSlot';
import { Button, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { todayKey } from '@/logic/dateKey';
import { currentStreak, isDayWon } from '@/logic/progress';
import { useResultsStore } from '@/store/useResultsStore';
import { useTheme } from '@/theme';

export default function Home() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const today = todayKey();

  const results = useResultsStore((s) => s.results);
  const isHydrated = useResultsStore((s) => s.isHydrated);
  const hydrate = useResultsStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Only meaningful once saved results have been read: showing a zero first
  // would tell a player on a 40-day run that they had lost it.
  const streak = isHydrated ? currentStreak(results, today) : null;
  const done = isDayWon(results[today]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen scroll topInset>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginTop: spacing['2xl'],
          }}
        >
          <View style={{ flex: 1 }}>
            <Text variant="display">{t('todayTitle')}</Text>
            <Text variant="caption" tone="muted" style={{ marginTop: spacing.xs }}>
              {t('fairPromise')}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('statsTitle')}
            onPress={() => router.push('/stats')}
            style={{
              alignItems: 'center',
              minWidth: 64,
              minHeight: 44,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: radius.md,
              backgroundColor: colors.surface,
            }}
          >
            <Text variant="bodyStrong">{streak === null ? '—' : String(streak)}</Text>
            <Text variant="micro" tone="faint">
              {t('streakLabel')}
            </Text>
          </Pressable>
        </View>

        <Button
          label={done ? t('playAgain') : t('digMode')}
          size="lg"
          fullWidth
          onPress={() => router.push(`/play/${today}`)}
          style={{ marginTop: spacing.xl }}
        />

        {done ? (
          <View
            style={{
              marginTop: spacing.lg,
              padding: spacing.base,
              borderRadius: radius.lg,
              backgroundColor: colors.surface,
            }}
          >
            <Text variant="bodyStrong" tone="accent">
              {t('wonTitle')}
            </Text>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('archiveTitle')}
            onPress={() => router.push('/archive')}
            style={{
              flex: 1,
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.md,
              backgroundColor: colors.surfaceAlt,
            }}
          >
            <Text variant="callout">{t('archiveTitle')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settingsTitle')}
            onPress={() => router.push('/settings')}
            style={{
              flex: 1,
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.md,
              backgroundColor: colors.surfaceAlt,
            }}
          >
            <Text variant="callout">{t('settingsTitle')}</Text>
          </Pressable>
        </View>
      </Screen>
      <BannerAdSlot />
    </View>
  );
}
