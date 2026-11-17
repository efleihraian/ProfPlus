import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/components/ui/brand';
import { ChevronLeftIcon } from '@/components/ui/icons';
import { SchoolBackground } from '@/components/ui/school-background';
import { LoadingBar } from '@/components/ui/loading-bar';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Screen({ title, titleAction, intro, back, onBack, loading = false, children, maxContentWidth = MaxContentWidth }: { title?: string; titleAction?: ReactNode; intro?: string; back?: boolean; onBack?: () => void; loading?: boolean; maxContentWidth?: number; children?: ReactNode }) {
  const router = useRouter();
  const theme = useTheme();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <SchoolBackground />
      <View style={[styles.header, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        {back ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Înapoi"
            onPress={onBack ?? (() => {if (router.canGoBack()) router.back(); else router.replace('/');})}
            hitSlop={4}
            style={({ pressed }) => [styles.back, { backgroundColor: pressed ? theme.fillStrong : theme.fill }]}>
            <ChevronLeftIcon size={18} color={theme.text} />
            <ThemedText type="smallBold">Înapoi</ThemedText>
          </Pressable>
        ) : (
          <Brand />
        )}
      </View>
      {loading ? <LoadingBar label="Se încarcă ecranul" /> : <View style={styles.barSpace} />}
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { maxWidth: maxContentWidth }]} keyboardShouldPersistTaps="handled">
        {title ? (
          <View style={styles.titleRow}>
            <ThemedText style={styles.title} type="title" accessibilityRole="header">{title}</ThemedText>
            {titleAction}
          </View>
        ) : null}
        {intro ? <ThemedText themeColor="muted">{intro}</ThemedText> : null}
        <View
          style={[styles.body, loading && styles.pending]}
          pointerEvents={loading ? 'none' : 'auto'}
          accessibilityElementsHidden={loading}
          importantForAccessibility={loading ? 'no-hide-descendants' : 'auto'}>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingVertical: 12, borderBottomWidth: 1 },
  titleRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.two},
  title: {flex: 1},
  barSpace: { height: 3 },
  body: { gap: Spacing.three },
  pending: { opacity: 0 },
  back: { minHeight: 44, paddingHorizontal: Spacing.two, borderRadius: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    width: '100%',
    alignSelf: 'center',
  },
});
