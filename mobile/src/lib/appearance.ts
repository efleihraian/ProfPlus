// Tema aplicației (P-195), ca „Aspect” pe site: luminoasă, întunecată sau ca pe telefon.
// Appearance.setColorScheme schimbă tema doar în ProfPlus; „auto” revine la setarea telefonului (React Native 0.88).
// Alegerea rămâne pe telefon, în AsyncStorage; nu ajunge pe server.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform } from 'react-native';

import { log } from '@/lib/log';

export type ThemeChoice = 'light' | 'dark' | 'auto';
export const THEME_KEY = 'profplus-theme';
export const THEME_OPTIONS: readonly { value: ThemeChoice; label: string }[] = [
  { value: 'light', label: 'Luminos' },
  { value: 'dark', label: 'Întunecat' },
  { value: 'auto', label: 'Ca pe telefon' },
];

const valid = (value: unknown): value is ThemeChoice => value === 'light' || value === 'dark' || value === 'auto';
const apply = (choice: ThemeChoice) => {
  if (Platform.OS !== 'web') Appearance.setColorScheme(choice);
};

/** La pornire: aplică tema aleasă înainte, dacă există. */
export async function loadThemeChoice(): Promise<ThemeChoice> {
  const saved = await AsyncStorage.getItem(THEME_KEY).catch(() => null);
  const choice = valid(saved) ? saved : 'auto';
  if (choice !== 'auto') apply(choice);
  return choice;
}

export async function saveThemeChoice(choice: ThemeChoice) {
  apply(choice);
  try {
    if (choice === 'auto') await AsyncStorage.removeItem(THEME_KEY);
    else await AsyncStorage.setItem(THEME_KEY, choice);
  } catch (error) {
    log('warn', 'theme_unsaved', undefined, error);
  }
}
