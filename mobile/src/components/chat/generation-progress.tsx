// P-199 — ce se întâmplă cu cererea, ca pe site (P-198): pașii raportați de server, nu etape simulate.
// P-227 — un rând care spune ce face Profi («Scriu testul și verific fiecare exercițiu · clasa a VI-a»), o bară subțire
// față de durata obișnuită a acelui fel de cerere, pasul curent și cât mai durează. Bara nu este un procent măsurat:
// se apropie de capăt la durata obișnuită și nu ajunge la 100% înaintea răspunsului.
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ProfiAvatar } from '@/components/profi';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { elapsed, planLabel, planSeconds, progressFraction, PROGRESS_STEPS, remainingText, type GenerationPlan, type ProgressStage } from '@/lib/api';

export function GenerationProgress({ stage, startedAt, plan = null }: { stage: ProgressStage; startedAt: number; plan?: GenerationPlan | null }) {
  const theme = useTheme();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);
  const step = PROGRESS_STEPS.find((s) => s.id === stage)?.label ?? 'Scriu răspunsul';
  const elapsedMs = Math.max(0, now - startedAt);
  const seconds = planSeconds(plan);
  const label = planLabel(plan);

  return (
    <View style={styles.box} accessibilityLiveRegion="polite" accessibilityLabel={`Profi lucrează: ${label}. ${step}`}>
      <ProfiAvatar size={36} swimming />
      <View style={styles.body}>
        <View style={styles.title}>
          <ThemedText type="smallBold" style={styles.label}>
            {label}
          </ThemedText>
          <ThemedText type="small" themeColor="subtle">
            {elapsed(elapsedMs)}
          </ThemedText>
        </View>
        <View style={[styles.track, { backgroundColor: theme.fillStrong }]}>
          <View style={[styles.fill, { backgroundColor: theme.accent, width: `${Math.round(progressFraction(elapsedMs, seconds) * 100)}%` }]} />
        </View>
        <ThemedText type="small" themeColor="muted">
          {step} · {remainingText(elapsedMs, seconds)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  body: { flex: 1, gap: 6 },
  title: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: Spacing.two },
  label: { flex: 1 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
});
