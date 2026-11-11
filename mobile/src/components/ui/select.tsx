// Dropdownul aplicației, în același stil ca pe site: câmp cu săgeată, iar lista se deschide de jos, cu alegerea curentă pe verde și bifă.
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Shape, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props<T extends string> = { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void };

export function Select<T extends string>({ label, value, options, onChange }: Props<T>) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value)?.label ?? '';

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" themeColor="muted">
        {label}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current}`}
        accessibilityHint="Deschide lista de opțiuni"
        onPress={() => setOpen(true)}
        style={[styles.input, { backgroundColor: theme.fill, borderColor: open ? theme.accent : 'transparent' }]}>
        <ThemedText numberOfLines={1} style={styles.value}>
          {current}
        </ThemedText>
        <ThemedText themeColor="muted">▾</ThemedText>
      </Pressable>
      <OptionSheet visible={open} title={label} value={value} options={options} onChange={onChange} onClose={() => setOpen(false)} />
    </View>
  );
}

type SheetProps<T extends string> = { visible: boolean; title: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void; onClose: () => void };

/** Lista care se deschide de jos, folosită și de butoanele din chat. */
export function OptionSheet<T extends string>({ visible, title, value, options, onChange, onClose }: SheetProps<T>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Închide lista" style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.surface, paddingBottom: insets.bottom + Spacing.three }]}>
        <View style={[styles.grabber, { backgroundColor: theme.borderStrong }]} />
        <ThemedText type="smallBold" themeColor="muted" accessibilityRole="header" style={styles.title}>
          {title}
        </ThemedText>
        <ScrollView>
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  onChange(option.value);
                  onClose();
                }}
                style={({ pressed }) => [styles.option, { backgroundColor: selected ? theme.soft : pressed ? theme.hover : 'transparent' }]}>
                <ThemedText type={selected ? 'smallBold' : 'default'} themeColor={selected ? 'softText' : 'text'} style={styles.value}>
                  {option.label}
                </ThemedText>
                {selected ? <ThemedText themeColor="softText">✓</ThemedText> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: { minHeight: 52, borderWidth: 1.5, borderRadius: Shape.control, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  value: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { maxHeight: '70%', borderTopLeftRadius: Shape.sheet, borderTopRightRadius: Shape.sheet, paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: Spacing.two },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: Spacing.one },
  title: { paddingHorizontal: 4 },
  option: { minHeight: 52, borderRadius: Shape.control, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
