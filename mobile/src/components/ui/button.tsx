// Butoanele site-ului: principal verde închis cu text alb, secundar alb cu chenar. Minim 48 px înălțime pentru atingere.
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { brand, radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
};

export function Button({ children, onPress, variant = 'primary', disabled, loading, accessibilityHint }: Props) {
  const theme = useTheme();
  const primary = variant === 'primary';
  const danger = variant === 'danger';
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityHint={accessibilityHint}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary
          ? { backgroundColor: pressed ? theme.accent : theme.dark, borderColor: 'transparent' }
          : danger
            ? { backgroundColor: pressed ? theme.dangerSoft : theme.surface, borderColor: theme.dangerBorder }
            : { backgroundColor: pressed ? theme.hover : theme.surface, borderColor: theme.borderStrong },
        inactive && styles.inactive,
      ]}>
      {loading ? <ActivityIndicator color={primary ? brand.onAccent : theme.text} /> : null}
      <Text style={[styles.label, { color: primary ? brand.onAccent : danger ? theme.dangerText : theme.text }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: { fontSize: 16, fontWeight: 600 },
  inactive: { opacity: 0.55 },
});
