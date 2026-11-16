// Pe iOS bara de file plutește peste ecran, deci ce e fixat jos (câmpul de mesaj) trebuie ridicat deasupra ei.
// Pe Android bara nu acoperă conținutul: NativeTabs lasă singur spațiul.
import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

export function AboveTabBar({ children }: { children: ReactNode }) {
  return Platform.OS === 'ios' ? <SafeAreaView edges={{ bottom: true }}>{children}</SafeAreaView> : <>{children}</>;
}
