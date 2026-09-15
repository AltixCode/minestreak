import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';

import { Text } from '@/components/ui';
import { t } from '@/i18n';
import type { Board, Point } from '@/logic/board';
import { numberTone } from '@/theme/numberTones';
import { useTheme } from '@/theme';

/**
 * The minefield.
 *
 * Numbers are drawn in distinct colours, as minesweeper always has, but the
 * DIGIT is the information — colour only makes scanning faster. A player who
 * cannot separate the hues loses nothing.
 *
 * Flagging is a mode toggle rather than a long-press. A long-press is the usual
 * choice and it is wrong on a small board: it fires while the finger is still
 * deciding, and an accidental dig on a mine ends the day.
 */
export function MineGrid({
  board,
  revealAll,
  onPress,
}: {
  board: Board;
  revealAll: boolean;
  onPress: (at: Point) => void;
}) {
  const { width, height } = useWindowDimensions();
  const { colors, spacing, radius, isDark } = useTheme();

  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const gap = 2;
  const available = Math.min(width - spacing.base * 2, height * 0.52, 460);
  const side = Math.floor((available - gap * (cols - 1)) / cols);

  return (
    <View style={{ alignSelf: 'center', gap, marginTop: spacing.lg }}>
      {Array.from({ length: rows }, (_, r) => (
        <View key={r} style={{ flexDirection: 'row', gap }}>
          {Array.from({ length: cols }, (_, c) => {
            const cell = board[r]![c]!;
            const shown = cell.revealed || (revealAll && cell.mine);
            const state = cell.flagged
              ? t('cellFlagged')
              : !shown
                ? t('cellHidden')
                : cell.mine
                  ? t('lostTitle')
                  : cell.adjacent === 0
                    ? t('cellEmptyState')
                    : t('cellNumber', { count: cell.adjacent });
            return (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityLabel={t('cellA11y', { row: r + 1, col: c + 1, state })}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onPress({ r, c });
                }}
                style={{
                  width: side,
                  height: side,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.xs,
                  backgroundColor: shown ? colors.surface : colors.surfaceAlt,
                  borderWidth: shown ? 0 : 1,
                  borderColor: colors.border,
                }}
              >
                {cell.flagged && !shown ? (
                  <Text variant="caption" tone="danger">
                    ⚑
                  </Text>
                ) : shown && cell.mine ? (
                  <Text variant="caption" tone="danger">
                    ✱
                  </Text>
                ) : shown && cell.adjacent > 0 ? (
                  <Text variant="caption" color={numberTone(cell.adjacent, isDark)}>
                    {String(cell.adjacent)}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
