// Rând de meniu din fila Cont (P-195): pictogramă, titlu, rând secundar opțional și săgeată, pe toată lățimea, min. 56 px.
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ChevronRightIcon } from '@/components/ui/icons';
import { radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = { icon: (color: string) => ReactNode; label: string; detail?: string; detailAccent?: boolean; danger?: boolean; busy?: boolean; onPress: () => void };

export function MenuRow({ icon, label, detail, detailAccent, danger, busy, onPress }: Props) {
  const theme = useTheme();
  const color = danger ? theme.dangerText : theme.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? theme.hover : theme.surface, borderColor: theme.border }]}>
      <View style={styles.icon}>{icon(color)}</View>
      <View style={styles.text}>
        <ThemedText style={{ color }}>{label}</ThemedText>
        {detail ? (
          <ThemedText type="small" themeColor={detailAccent ? 'accentText' : 'muted'}>
            {detail}
          </ThemedText>
        ) : null}
      </View>
      <ChevronRightIcon color={theme.subtle} />
    </Pressable>
  );
}

/** Un grup de rânduri, cu titlu de secțiune deasupra. */
export function MenuGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      {title ? (
        <ThemedText type="smallBold" themeColor="muted" accessibilityRole="header" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 60, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: Spacing.three, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  icon: { width: 24, alignItems: 'center' },
  text: { flex: 1, gap: 2 },
  group: { gap: Spacing.two },
  title: { paddingHorizontal: 4 },
});
