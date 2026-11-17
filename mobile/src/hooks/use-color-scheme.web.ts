import '@/global.css';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { activeThemeChoice, subscribeThemeChoice } from '@/lib/appearance';

export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();
  const choice = useSyncExternalStore(subscribeThemeChoice, activeThemeChoice, () => null);

  if (hasHydrated) {
    return choice === 'light' || choice === 'dark' ? choice : colorScheme;
  }

  return 'light';
}
