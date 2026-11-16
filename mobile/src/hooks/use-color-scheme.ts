import { useSyncExternalStore } from 'react';
import { useColorScheme as useSystemScheme } from 'react-native';

import { activeThemeChoice, subscribeThemeChoice } from '@/lib/appearance';

export function useColorScheme() {
  const device = useSystemScheme();
  const choice = useSyncExternalStore(subscribeThemeChoice, activeThemeChoice, activeThemeChoice);
  return choice === 'light' || choice === 'dark' ? choice : device;
}
