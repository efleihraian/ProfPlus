// Rând de alegere cu buton radio sau bifă, cu ținta de atingere a întregului rând (min. 48 px).
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { radius, Spacing } from '@/constants/theme';
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
        { borderColor: selected ? theme.accent : theme.borderStrong, backgroundColor: selected ? theme.soft : pressed ? theme.hover : theme.surface },
      ]}>
      <View
        style={[
          styles.mark,
          kind === 'radio' ? styles.round : styles.square,
          { borderColor: selected ? theme.accent : theme.borderStrong, backgroundColor: selected ? theme.accent : 'transparent' },
        ]}>
        {selected ? <ThemedText style={styles.tick}>{kind === 'radio' ? '●' : '✓'}</ThemedText> : null}
      </View>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 48, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  mark: { width: 22, height: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  round: { borderRadius: 11 },
  square: { borderRadius: 4 },
  tick: { color: '#fff', fontSize: 12, lineHeight: 14 },
  label: { flex: 1 },
});
