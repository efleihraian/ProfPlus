import '@/global.css';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { activeThemeChoice, subscribeThemeChoice } from '@/lib/appearance';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
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
