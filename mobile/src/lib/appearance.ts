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

let choice: ThemeChoice | null = null;
let accountChoice: ThemeChoice | null = null;
const listeners = new Set<() => void>();
const edits = new Set<(value: ThemeChoice) => void>();

export const activeThemeChoice = () => accountChoice ?? choice;
export function subscribeThemeChoice(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function subscribeThemeEdits(listener: (value: ThemeChoice) => void) {
  edits.add(listener);
  return () => { edits.delete(listener); };
}
function refreshAppearance() {
  apply(activeThemeChoice() ?? 'auto');
  listeners.forEach(listener => listener());
}
export function applyAccountTheme(value: ThemeChoice | null) {
  if (accountChoice === value) return;
  accountChoice = value;
  refreshAppearance();
}

let loading: Promise<ThemeChoice> | undefined;
let saving = Promise.resolve();

export function loadThemeChoice(): Promise<ThemeChoice> {
  if (choice !== null) return Promise.resolve(choice);
  return loading ??= AsyncStorage.getItem(THEME_KEY).catch(() => null).then(saved => {
    if (choice === null) {
      choice = valid(saved) ? saved : 'auto';
      refreshAppearance();
    }
    return choice;
  });
}

export function saveThemeChoice(value: ThemeChoice) {
  choice = value;
  if (accountChoice !== null) accountChoice = value;
  refreshAppearance();
  edits.forEach(listener => listener(value));
  saving = saving.then(async () => {
    if (choice !== value) return;
    if (value === 'auto') await AsyncStorage.removeItem(THEME_KEY);
    else await AsyncStorage.setItem(THEME_KEY, value);
  }).catch(error => log('warn', 'theme_unsaved', undefined, error));
  return saving;
}
