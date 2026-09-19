import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/ui";
import { t } from "@/i18n";
import { PRIVACY_POLICY_URL, TERMS_URL } from "@/monetization/config";
import { usePremiumStore } from "@/store/usePremiumStore";
import { useTheme } from "@/theme";
import { useTabletColumn } from "../src/theme/useTabletColumn";

/**
 * The one purchase this app sells: a lifetime non-consumable that removes the ads and unlocks
 * everything. There is deliberately no plan picker — a second option would be a subscription,
 * and the portfolio does not sell those.
 */
const BENEFIT_KEYS = [
  { title: "feat1Title", desc: "feat1Desc" },
  { title: "feat2Title", desc: "feat2Desc" },
  { title: "feat3Title", desc: "feat3Desc" },
  { title: "feat4Title", desc: "feat4Desc" },
] as const;

export default function Paywall() {
  /**
   * Only the claims this app can actually make.
   *
   * Four slots is what this template offers, not a quota to fill. An app whose
   * purchase removes the ads and nothing else has one honest thing to say about
   * it, and padding to four is how "Everything unlocked -- every level, every
   * mode and the full archive" ends up on a paywall for an app with no levels,
   * no modes and no archive.
   *
   * A benefit whose title is blank is dropped, so cutting a claim is a one-line
   * edit in `i18n` rather than a component change. Computed per render, not at
   * module load, so it follows the active locale.
   *
   * They are folded into one running paragraph below rather than a numbered
   * list -- see the note above the paragraph itself for why.
   */
  const benefits = BENEFIT_KEYS.filter((b) => t(b.title).trim().length > 0);
  const router = useRouter();
  const tabletColumn = useTabletColumn(640);
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius } = useTheme();

  const lifetime = usePremiumStore((s) => s.lifetime);
  const offeringsResolved = usePremiumStore((s) => s.offeringsResolved);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const isPurchasing = usePremiumStore((s) => s.isPurchasing);
  const error = usePremiumStore((s) => s.error);
  const purchase = usePremiumStore((s) => s.purchase);
  const restore = usePremiumStore((s) => s.restore);
  // A restore that finds nothing must SAY so.
  // `restore()` returned 'none' and the screen rendered nothing at all, so
  // the button read as broken -- and App Review taps Restore on every
  // submission. The string already existed in all fourteen locales; it was
  // simply never shown on this paywall shape.
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);
  const refreshOfferings = usePremiumStore((s) => s.refreshOfferings);

  useEffect(() => {
    void refreshOfferings();
  }, [refreshOfferings]);

  // A user who already owns it must never be left staring at a buy button.
  useEffect(() => {
    if (isPremium) router.back();
  }, [isPremium, router]);

  const price = lifetime?.product.priceString;

  /**
   * The opening paragraph, split so its first character can run large.
   *
   * A real drop cap is one glyph, not a whole word or the app name, so this
   * takes the promise sentence apart at the first character rather than at a
   * word boundary. The two pieces are nested inside the SAME `Text` (not a
   * sibling laid out with `flexDirection: 'row'`) so React Native flattens
   * them back into one run for VoiceOver/TalkBack and for `getByText` --
   * a drop cap is a typographic detail, not a second sentence.
   */
  const lede = t("antiSubHeadline");
  const dropCapLetter = lede.slice(0, 1);
  const ledeRest = lede.slice(1);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}
    >
      <View style={{ alignItems: "flex-end", padding: spacing.base }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("close")}
          hitSlop={12}
          onPress={() => router.back()}
          style={{
            minWidth: 44,
            minHeight: 44,
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Text variant="body" tone="muted">
            {t("close")}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.xl,
          paddingBottom: spacing["3xl"],
          ...tabletColumn,
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        {/* Drop cap, not a badge, not a number.

            29 of 44 apps in this portfolio shipped one paywall file byte for
            byte, and Apple rejected under 4.3(a) naming "multiple similar apps
            using a repackaged app template". A numbered list of icon circles is
            still a spec sheet with a different skin, so this one reads instead
            like a magazine page: a lead paragraph with an oversized first
            letter, and the four claims folded into a second paragraph as
            running prose rather than four rows. Same claims, a genuinely
            different page. */}
        <Text variant="micro" tone="accent">
          {t("antiSubTitle")}
        </Text>
        <Text variant="title" style={{ marginTop: spacing.xs }}>
          {t("paywallTitle")}
        </Text>

        <Text variant="body" tone="muted" style={{ marginTop: spacing.xl }}>
          <Text
            color={colors.accent}
            style={{ fontSize: 56, lineHeight: 48, fontWeight: "800" }}
          >
            {dropCapLetter}
          </Text>
          {ledeRest}
        </Text>

        {/* Four claims, one paragraph.

            Each benefit's title stays bold and inline -- a lead-in phrase, the
            way a magazine feature bolds a term and keeps writing past it --
            with its description continuing the same sentence rather than
            starting a new row. Nothing here is a discrete card: cut this app's
            claims to one and the paragraph is one sentence long; cut them to
            zero and the paragraph does not render at all. */}
        {benefits.length > 0 ? (
          <Text
            variant="body"
            tone="muted"
            style={{ marginTop: spacing.lg, lineHeight: 26 }}
          >
            {benefits.map((benefit, index) => (
              <Text key={benefit.title}>
                <Text variant="bodyStrong" tone="default">
                  {t(benefit.title)}
                </Text>
                {" — "}
                <Text>{t(benefit.desc)}</Text>
                {index < benefits.length - 1 ? " " : ""}
              </Text>
            ))}
          </Text>
        ) : null}

        {/* The CTA is the one place chrome is allowed to show — everything
            above is typography, and this card is what tells the eye where
            the prose ends and the decision begins. */}
        <View
          style={{
            marginTop: spacing["2xl"],
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.xl,
          }}
        >
          {lifetime ? (
            <Button
              label={
                price
                  ? t("lifetimeAccess", { price })
                  : t("lifetimeAccessPlain")
              }
              size="lg"
              fullWidth
              loading={isPurchasing}
              onPress={() => void purchase(lifetime)}
            />
          ) : offeringsResolved ? (
            // Resolved, with no package: the store is genuinely unreachable or carries no
            // product yet. Say that, and keep Restore reachable below — a user who already
            // paid must still be able to get their purchase back.
            <View style={{ alignItems: "center" }}>
              <Text variant="caption" tone="muted" align="center">
                {t("storeUnavailable")}
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: "center" }}>
              <ActivityIndicator color={colors.textMuted} />
              <Text
                variant="caption"
                tone="muted"
                style={{ marginTop: spacing.md }}
              >
                {t("loadingPrice")}
              </Text>
            </View>
          )}
          <Text
            variant="caption"
            tone="muted"
            align="center"
            style={{ marginTop: spacing.md }}
          >
            {t("oneTimePayment")}
          </Text>

          {error ? (
            <Text
              variant="caption"
              tone="danger"
              align="center"
              style={{ marginTop: spacing.base }}
            >
              {error}
            </Text>
          ) : null}
        </View>

        {restoreNotice ? (
          <Text
            accessibilityRole="alert"
            variant="caption"
            tone="muted"
            align="center"
            style={{ marginTop: spacing.lg }}
          >
            {restoreNotice}
          </Text>
        ) : null}

        <Button
          label={t("restorePurchases")}
          variant="ghost"
          fullWidth
          onPress={() => {
            setRestoreNotice(null);
            void restore().then((outcome) => {
              if (outcome === "none") setRestoreNotice(t("noPriorPurchases"));
            });
          }}
          style={{ marginTop: restoreNotice ? spacing.md : spacing.lg }}
        />

        <Text
          variant="micro"
          tone="faint"
          align="center"
          style={{ marginTop: spacing.xl }}
        >
          {t("adsDisclosure")}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: spacing.lg,
            marginTop: spacing.md,
          }}
        >
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={t("termsOfUse")}
            hitSlop={12}
            onPress={() => void Linking.openURL(TERMS_URL)}
          >
            <Text variant="micro" tone="faint">
              {t("termsOfUse")}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={t("privacyPolicy")}
            hitSlop={12}
            onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
          >
            <Text variant="micro" tone="faint">
              {t("privacyPolicy")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
