// Varianta pentru browser (expo start --web): aceleași file, ca bară simplă jos.
import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { TABS } from '@/components/tab-list';
import { ThemedText } from '@/components/themed-text';
import { radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const theme = useTheme();
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList style={[styles.list, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {TABS.map((tab) => (
          <TabTrigger key={tab.name} name={tab.name} href={tab.name === 'index' ? '/' : `/${tab.name}`} asChild>
            <TabButton>{tab.label}</TabButton>
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, onPress, onLongPress }: TabTriggerSlotProps) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: isFocused }} onPress={onPress} onLongPress={onLongPress}>
      <View style={[styles.tab, isFocused && { backgroundColor: theme.soft }]}>
        <ThemedText type="smallBold" themeColor={isFocused ? 'text' : 'muted'}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, padding: Spacing.two },
  tab: { paddingVertical: Spacing.one, paddingHorizontal: Spacing.three, borderRadius: radius.pill },
});
