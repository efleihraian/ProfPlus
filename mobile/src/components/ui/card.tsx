// Card alb cu chenar crem, ca secțiunile de pe site (în modul întunecat: verde închis).
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = { title?: string; eyebrow?: string; soft?: boolean; style?: ViewStyle; children?: ReactNode };

export function Card({ title, eyebrow, soft, style, children }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: soft ? theme.soft : theme.surface, borderColor: soft ? theme.softBorder : theme.border },
        style,
      ]}>
      {eyebrow ? (
        <ThemedText type="smallBold" themeColor="softText">
          {eyebrow}
        </ThemedText>
      ) : null}
      {title ? <ThemedText type="subtitle">{title}</ThemedText> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.xl, padding: Spacing.three, gap: Spacing.two },
});
