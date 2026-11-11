// Meniul din fila Cont (P-195, P-200): rânduri grupate într-un singur card, despărțite de linii fine, cu pictograma
// într-un cerc colorat și săgeată, ca în aplicațiile de cont moderne. Fiecare rând are minim 60 px.
import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ChevronRightIcon } from '@/components/ui/icons';
import { cardSurface, Shape, Spacing } from '@/constants/theme';
import { useDark, useTheme } from '@/hooks/use-theme';

type Props = { icon: (color: string) => ReactNode; label: string; detail?: string; detailAccent?: boolean; danger?: boolean; busy?: boolean; onPress: () => void };

export function MenuRow({ icon, label, detail, detailAccent, danger, busy, onPress }: Props) {
  const theme = useTheme();
  const color = danger ? theme.dangerText : theme.softText;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? theme.fill : 'transparent' }, busy && styles.dim]}>
      <View style={[styles.icon, { backgroundColor: danger ? theme.dangerSoft : theme.soft }]}>{icon(color)}</View>
      <View style={styles.text}>
        <ThemedText style={[styles.label, danger && { color: theme.dangerText }]}>{label}</ThemedText>
        {detail ? (
          <ThemedText type="small" themeColor={detailAccent ? 'accentText' : 'muted'}>
            {detail}
          </ThemedText>
        ) : null}
      </View>
      <ChevronRightIcon size={18} color={theme.subtle} />
    </Pressable>
  );
}

// Rândurile pot veni și din fragmente (<>…</>), în funcție de cont; le aplatizăm ca să punem linia între ele.
const flatten = (children: ReactNode): ReactElement[] =>
  Children.toArray(children).flatMap((child) =>
    isValidElement(child) && child.type === Fragment ? flatten((child as ReactElement<{ children?: ReactNode }>).props.children) : isValidElement(child) ? [child] : [],
  );

/** Un grup de rânduri într-un card, cu titlu de secțiune deasupra. */
export function MenuGroup({ title, children }: { title?: string; children: ReactNode }) {
  const theme = useTheme();
  const dark = useDark();
  const rows = flatten(children);
  return (
    <View style={styles.group}>
      {title ? (
        <ThemedText type="smallBold" themeColor="muted" accessibilityRole="header" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}
      {/* Umbra stă pe cardul exterior; cel interior taie colțurile rândurilor apăsate (pe iOS, overflow ar tăia și umbra). */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, cardSurface(dark)]}>
        <View style={styles.clip}>
          {rows.map((row, i) => (
            <View key={row.key ?? i}>
              {i ? <View style={[styles.separator, { backgroundColor: theme.border }]} /> : null}
              {row}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 58, paddingHorizontal: Spacing.three, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: Spacing.three - 2 },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  label: { fontWeight: 600 },
  group: { gap: Spacing.two },
  title: { paddingHorizontal: 6, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12 },
  card: { borderRadius: Shape.card },
  clip: { borderRadius: Shape.card, overflow: 'hidden' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 70 },
  dim: { opacity: 0.5 },
});
