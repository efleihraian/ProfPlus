// Rând de alegere cu buton radio sau bifă (P-200: umplere discretă, alegerea pe verde cu contur), min. 52 px.
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { brand, Shape, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = { label: string; selected: boolean; onPress: () => void; kind: 'radio' | 'checkbox'; disabled?: boolean };

export function Choice({ label, selected, onPress, kind, disabled }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole={kind}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: selected ? theme.accent : 'transparent', backgroundColor: selected ? theme.soft : pressed ? theme.fillStrong : theme.fill },
        disabled && styles.dim,
      ]}>
      <View
        style={[
          styles.mark,
          kind === 'radio' ? styles.round : styles.square,
          { borderColor: selected ? theme.accent : theme.borderStrong, backgroundColor: selected ? theme.accent : theme.surface },
        ]}>
        {selected ? <ThemedText style={styles.tick}>{kind === 'radio' ? '●' : '✓'}</ThemedText> : null}
      </View>
      <ThemedText style={[styles.label, selected && { color: theme.softText, fontWeight: 600 }]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 52, borderWidth: 1.5, borderRadius: Shape.control, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: Spacing.three - 4 },
  mark: { width: 22, height: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  round: { borderRadius: 11 },
  square: { borderRadius: 6 },
  tick: { color: brand.onAccent, fontSize: 12, lineHeight: 14 },
  label: { flex: 1 },
  dim: { opacity: 0.5 },
});
