// Butoanele aplicației (P-200): în formă de pastilă, fără chenar. Principal verde închis cu text alb; secundar cu umplere
// discretă; pericol pe roșu deschis; „ghost” doar text. La apăsare butonul se micșorează ușor. Minim 52 px înălțime.
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { brand, radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Pictogramă înaintea textului; primește culoarea textului. */
  icon?: (color: string) => ReactNode;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
};

export function Button({ children, onPress, variant = 'primary', icon, disabled, loading, accessibilityHint }: Props) {
  const theme = useTheme();
  const inactive = disabled || loading;
  const look = {
    primary: { background: theme.dark, pressed: theme.accent, text: brand.onAccent },
    secondary: { background: theme.fill, pressed: theme.fillStrong, text: theme.text },
    danger: { background: theme.dangerSoft, pressed: theme.dangerBorder, text: theme.dangerText },
    ghost: { background: 'transparent', pressed: theme.fill, text: theme.accentText },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityHint={accessibilityHint}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? look.pressed : look.background },
        pressed && styles.pressed,
        inactive && styles.inactive,
      ]}>
      {loading ? <ActivityIndicator color={look.text} /> : icon ? <View>{icon(look.text)}</View> : null}
      <Text style={[styles.label, { color: look.text }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  label: { fontSize: 16, fontWeight: 600, letterSpacing: 0.1, textAlign: 'center' },
  inactive: { opacity: 0.45 },
});
