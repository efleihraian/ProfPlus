// Tema aplicației vine din jetoanele comune cu site-ul (web/shared/design-tokens.ts), ca aplicația să arate ca profplus.ro.

import '@/global.css';

import { Platform, StyleSheet } from 'react-native';

import { brand, colors, font, radius, type ColorScheme } from '../../../web/shared/design-tokens';

export { brand, font, radius };

// Toate culorile site-ului (bg, surface, accent, okText...) plus numele folosite de componentele din șablonul Expo.
const scheme = (name: ColorScheme) => ({
  ...colors[name],
  background: colors[name].bg,
  backgroundElement: colors[name].surface,
  backgroundSelected: colors[name].soft,
  textSecondary: colors[name].muted,
  // P-200: umplerea discretă a butoanelor secundare și a câmpurilor (în locul chenarelor), doar în aplicație.
  fill: name === 'light' ? 'rgba(31,42,36,0.055)' : 'rgba(255,255,255,0.075)',
  fillStrong: name === 'light' ? 'rgba(31,42,36,0.1)' : 'rgba(255,255,255,0.13)',
});

/** P-200: formele aplicației — controale rotunjite, carduri cu colțuri mari (site-ul își păstrează `radius`). */
export const Shape = { control: 14, card: 22, sheet: 28 } as const;

/** Umbra fină a cardurilor în modul luminos; în modul întunecat cardul are doar un contur discret. */
export function cardSurface(dark: boolean) {
  if (dark) return { borderWidth: StyleSheet.hairlineWidth };
  return Platform.select({
    ios: { shadowColor: '#1F2A24', shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
    default: { elevation: 2, shadowColor: '#1F2A24' },
  });
}

export const Colors = {
  light: scheme('light'),
  dark: scheme('dark'),
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  // Pe Android fontul implicit al sistemului este Roboto, același ca pe site (font.family).
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
