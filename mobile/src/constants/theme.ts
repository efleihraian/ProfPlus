import { Platform, StyleSheet } from 'react-native';

import { brand, colors, font, radius, type ColorScheme } from '../../../web/shared/design-tokens';

export { brand, font, radius };

const scheme = (name: ColorScheme) => ({
  ...colors[name],
  background: colors[name].bg,
  backgroundElement: colors[name].surface,
  backgroundSelected: colors[name].soft,
  textSecondary: colors[name].muted,
  fill: name === 'light' ? 'rgba(31,42,36,0.055)' : 'rgba(255,255,255,0.075)',
  fillStrong: name === 'light' ? 'rgba(31,42,36,0.1)' : 'rgba(255,255,255,0.13)',
});

export const Shape = { control: radius.md, card: radius.lg, sheet: radius.xl } as const;

export function cardSurface(_dark: boolean) {
  return { borderWidth: StyleSheet.hairlineWidth };
}

export const Colors = {
  light: scheme('light'),
  dark: scheme('dark'),
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
