// Câmp de formular cu etichetă vizibilă, ca pe site.
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function TextField({ label, ...input }: TextInputProps & { label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.subtle}
        style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.borderStrong }]}
        {...input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 14, fontSize: 16 },
});
