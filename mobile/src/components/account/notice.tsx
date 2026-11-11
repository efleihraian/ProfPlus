// Rezultatul unei acțiuni de cont: eroare pe roșu sau confirmare pe verde, anunțat și cititorului de ecran.
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { Outcome } from '@/lib/auth';

export function Notice({ outcome }: { outcome: Outcome | null }) {
  const theme = useTheme();
  if (!outcome) return null;
  const error = 'error' in outcome;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.box, error ? { backgroundColor: theme.dangerSoft } : { backgroundColor: theme.soft }]}>
      <ThemedText themeColor={error ? 'dangerText' : 'softText'}>{error ? outcome.error : outcome.message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 },
});
