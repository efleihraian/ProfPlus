// Cardul aplicației (P-200): alb, colțuri mari și umbră fină, fără chenar; în modul întunecat, gri cu un contur discret.
// `soft`: card verde deschis pentru informații evidențiate.
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cardSurface, Shape, Spacing } from '@/constants/theme';
import { useDark, useTheme } from '@/hooks/use-theme';

type Props = { title?: string; eyebrow?: string; soft?: boolean; style?: ViewStyle; children?: ReactNode };

export function Card({ title, eyebrow, soft, style, children }: Props) {
  const theme = useTheme();
  const dark = useDark();
  return (
    <View style={[styles.card, soft ? { backgroundColor: theme.soft } : [{ backgroundColor: theme.surface, borderColor: theme.border }, cardSurface(dark)], style]}>
      {eyebrow ? (
        <ThemedText type="smallBold" themeColor="softText" style={styles.eyebrow}>
          {eyebrow}
        </ThemedText>
      ) : null}
      {title ? <ThemedText type="subtitle">{title}</ThemedText> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Shape.card, padding: Spacing.three + 4, gap: Spacing.three - 4 },
  eyebrow: { textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12 },
});
