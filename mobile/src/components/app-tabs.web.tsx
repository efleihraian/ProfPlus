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
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: isFocused }} onPress={onPress} onLongPress={onLongPress} style={styles.trigger}>
      <View style={[styles.tab, isFocused && { backgroundColor: theme.soft }]}>
        <ThemedText numberOfLines={1} type="smallBold" style={styles.label} themeColor={isFocused ? 'text' : 'muted'}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, padding: Spacing.two },
  trigger: {flex: 1, minWidth: 0},
  tab: {minHeight: 44, paddingHorizontal: Spacing.one, justifyContent: 'center', borderRadius: radius.md},
  label: {fontSize: 12, textAlign: 'center'},
});
