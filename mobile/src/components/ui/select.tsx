// Dropdownul aplicației, în același stil ca pe site: câmp cu săgeată, iar lista se deschide de jos, cu alegerea curentă pe verde și bifă.
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { TextField } from '@/components/ui/text-field';
import { Shape, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { filterClassSubjects } from '@/lib/api';

type Props<T extends string> = { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void; searchLabel?: string; disabled?: boolean };

export function Select<T extends string>({ label, value, options, onChange, searchLabel, disabled }: Props<T>) {
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
        disabled={disabled}
        accessibilityState={{ disabled, expanded: open }}
        onPress={() => setOpen(true)}
        style={[styles.input, { backgroundColor: theme.fill, borderColor: open ? theme.accent : 'transparent' }]}>
        <ThemedText numberOfLines={1} style={styles.value}>
          {current}
        </ThemedText>
        <ThemedText themeColor="muted">▾</ThemedText>
      </Pressable>
      <OptionSheet visible={open && !disabled} searchLabel={searchLabel} title={label} value={value} options={options} onChange={onChange} onClose={() => setOpen(false)} />
    </View>
  );
}

type SheetProps<T extends string> = { visible: boolean; title: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void; onClose: () => void; searchLabel?: string };

/** Lista care se deschide de jos, folosită și de butoanele din chat. */
export function OptionSheet<T extends string>({ visible, title, value, options, onChange, onClose, searchLabel }: SheetProps<T>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const labels = searchLabel && query ? new Set(filterClassSubjects(options.map((option) => option.label), query)) : null;
  const visibleOptions = labels ? options.filter((option) => labels.has(option.label)) : options;
  function close() {
    setQuery('');
    onClose();
  }
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView style={styles.modalLayout} behavior={searchLabel && process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
        <Pressable accessibilityLabel="Închide lista" style={styles.backdrop} onPress={close} />
        <View style={[styles.sheet, { backgroundColor: theme.surface, paddingBottom: insets.bottom + Spacing.three }]}>
          <View style={[styles.grabber, { backgroundColor: theme.borderStrong }]} />
          <ThemedText type="smallBold" themeColor="muted" accessibilityRole="header" style={styles.title}>
            {title}
          </ThemedText>
          {searchLabel ? <TextField label={searchLabel} value={query} onChangeText={setQuery} autoCorrect={false} /> : null}
          <FlatList
            data={visibleOptions}
            keyExtractor={(option) => option.value}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<ThemedText themeColor="muted">Nicio opțiune găsită.</ThemedText>}
            renderItem={({ item: option }) => {
              const selected = option.value === value;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onChange(option.value);
                    close();
                  }}
                  style={({ pressed }) => [styles.option, { backgroundColor: selected ? theme.soft : pressed ? theme.hover : 'transparent' }]}>
                  <ThemedText type={selected ? 'smallBold' : 'default'} themeColor={selected ? 'softText' : 'text'} style={styles.value}>
                    {option.label}
                  </ThemedText>
                  {selected ? <ThemedText themeColor="softText">✓</ThemedText> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: { minHeight: 52, borderWidth: 1.5, borderRadius: Shape.control, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  value: { flex: 1 },
  modalLayout: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { maxHeight: '70%', borderTopLeftRadius: Shape.sheet, borderTopRightRadius: Shape.sheet, paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: Spacing.two },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: Spacing.one },
  title: { paddingHorizontal: 4 },
  option: { minHeight: 52, borderRadius: Shape.control, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
