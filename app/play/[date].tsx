import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { BannerAdSlot } from '@/components/BannerAdSlot';
import { MineGrid } from '@/components/game/MineGrid';
import { Button, Screen, Text } from '@/components/ui';
import { useDailyBoard } from '@/hooks/useDailyBoard';
import { t } from '@/i18n';
import {
  flagCount,
  isLost,
  isWon,
  mineCount,
  reveal,
  toggleFlag,
  type Board,
  type Point,
} from '@/logic/board';
import { todayKey } from '@/logic/dateKey';
import { solveNoGuess } from '@/logic/solve';
import { shouldShowInterstitial } from '@/monetization/adPolicy';
import { showInterstitial } from '@/monetization/interstitial';
import { isRewardedReady, showRewarded } from '@/monetization/rewarded';
import { useResultsStore } from '@/store/useResultsStore';
import { usePremiumStore } from '@/store/usePremiumStore';
import { useTheme } from '@/theme';

const FREE_HINTS = 1;

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function PlayRoute() {
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date ?? todayKey();
  // Keyed so changing day REMOUNTS: resetting from an effect would leave one
  // frame of yesterday's board.
  return <Session key={date} date={date} />;
}

function Session({ date }: { date: string }) {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { board: initial, start } = useDailyBoard(date);

  const [board, setBoard] = useState<Board>(initial);
  const [flagging, setFlagging] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  // The elapsed time is captured into STATE when the board finishes, never read
  // from the ref during render: a ref read in a render body is not reactive, and
  // the value would be whatever the last incidental re-render happened to see.
  const [finishedSeconds, setFinishedSeconds] = useState<number | null>(null);
  const startedAt = useRef(0);
  const recorded = useRef(false);

  const won = isWon(board);
  const lost = isLost(board);
  const finished = won || lost;
  const remaining = mineCount(board) - flagCount(board);

  const record = useResultsStore((s) => s.record);
  const isPremium = usePremiumStore((s) => s.isPremium);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!finished || recorded.current) return;
    recorded.current = true;
    const seconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    setFinishedSeconds(seconds);
    void Haptics.notificationAsync(
      won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    );
    record(date, won, seconds);

    // After the result is on screen, behind its own pacing — never mid-board.
    if (
      shouldShowInterstitial({
        gamesPlayed: useResultsStore.getState().stats(date).played,
        lastInterstitialAt: 0,
        now: Date.now(),
        adsRemoved: isPremium,
      })
    ) {
      showInterstitial();
    }
  }, [finished, won, date, record, isPremium]);

  const press = useCallback(
    (at: Point) => {
      if (finished) return;
      setBoard((current) => (flagging ? toggleFlag(current, at) : reveal(current, at)));
    },
    [flagging, finished],
  );

  const restart = useCallback(() => {
    recorded.current = false;
    startedAt.current = Date.now();
    setFinishedSeconds(null);
    setBoard(initial);
  }, [initial]);

  const applyHint = useCallback(() => {
    // Open the next cell the deduction solver would open — never a guess.
    const result = solveNoGuess(board, start);
    const next = result.revealed.find((at) => !board[at.r]![at.c]!.revealed);
    if (!next) return false;
    setBoard((current) => reveal(current, next));
    return true;
  }, [board, start]);

  const onHint = useCallback(() => {
    const allowance = isPremium ? Number.POSITIVE_INFINITY : FREE_HINTS;
    if (hintsUsed < allowance) {
      if (applyHint()) setHintsUsed((n) => n + 1);
      return;
    }
    if (!isRewardedReady()) {
      Alert.alert(t('noHintsLeft'), t('adNotReady'));
      return;
    }
    void showRewarded().then((earned) => {
      if (earned && applyHint()) setHintsUsed((n) => n + 1);
    });
  }, [applyHint, hintsUsed, isPremium]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen scroll>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing.base,
          }}
        >
          <Text variant="bodyStrong">{t('minesLeft', { count: Math.max(0, remaining) })}</Text>
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel={flagging ? t('flagMode') : t('digMode')}
            accessibilityState={{ checked: flagging }}
            onPress={() => setFlagging((f) => !f)}
            style={{
              minHeight: 44,
              minWidth: 96,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: spacing.base,
              borderRadius: radius.md,
              backgroundColor: flagging ? colors.accent : colors.surfaceAlt,
            }}
          >
            <Text variant="callout" color={flagging ? colors.onAccent : colors.text}>
              {flagging ? t('flagMode') : t('digMode')}
            </Text>
          </Pressable>
        </View>

        <MineGrid board={board} revealAll={lost} onPress={press} />

        {finished ? (
          <View style={{ alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm }}>
            <Text variant="heading" tone={won ? 'accent' : 'danger'}>
              {won ? t('wonTitle') : t('lostTitle')}
            </Text>
            <Text variant="caption" tone="muted" align="center">
              {won && finishedSeconds !== null
                ? t('solvedIn', { time: formatSeconds(finishedSeconds) })
                : t('lostBody')}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
              <Button label={t('restart')} onPress={restart} />
              <Button label={t('archiveTitle')} variant="ghost" onPress={() => router.replace('/')} />
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
            <Button label={t('hint')} variant="secondary" onPress={onHint} style={{ flex: 1 }} />
            <Button label={t('restart')} variant="ghost" onPress={restart} style={{ flex: 1 }} />
          </View>
        )}
      </Screen>
      <BannerAdSlot />
    </View>
  );
}
