// Bara de progres a site-ului: pistă gri, umplere verde.
import { StyleSheet, View } from 'react-native';

import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ProgressBar({ done, total, label }: { done: number; total: number; label: string }) {
  const theme = useTheme();
  const pct = total ? Math.round((done * 100) / total) : 0;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: total, now: done, text: `${done} din ${total}` }}
      style={[styles.track, { backgroundColor: theme.track }]}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: theme.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
