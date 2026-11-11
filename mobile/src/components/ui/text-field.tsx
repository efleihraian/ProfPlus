// Câmp de formular cu etichetă vizibilă (P-200): umplere discretă în loc de chenar; la focus, contur verde.
import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Shape } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function TextField({ label, onFocus, onBlur, ...input }: TextInputProps & { label: string }) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" themeColor="muted">
        {label}
      </ThemedText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.subtle}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, { color: theme.text, backgroundColor: theme.fill, borderColor: focused ? theme.accent : 'transparent' }]}
        {...input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: { minHeight: 52, borderWidth: 1.5, borderRadius: Shape.control, paddingHorizontal: 16, fontSize: 16 },
});
