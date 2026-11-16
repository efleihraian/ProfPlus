// Filele de jos: aceleași secțiuni ca antetul site-ului, plus Cont (pe site butonul „Intră în cont”).
// P-201: doar pictograme, la cererea titularului. Pe Android modul „unlabeled” ascunde textul, dar TalkBack citește numele;
// pe iOS eticheta e ascunsă cu `hidden` (citirea cu VoiceOver neverificată).
import { NativeTabs } from 'expo-router/native-tabs';
import { Platform } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { TABS } from '@/components/tab-list';

export { TABS };

export default function AppTabs() {
  const theme = useTheme();

  return (
    <NativeTabs
      backgroundColor={theme.surface}
      labelVisibilityMode="unlabeled"
      indicatorColor={theme.soft}
      rippleColor={theme.soft}
      iconColor={{ default: theme.muted, selected: theme.softText }}
      labelStyle={{ default: { color: theme.muted }, selected: { color: theme.text } }}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label hidden={Platform.OS === 'ios'}>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
