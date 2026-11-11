// Cadrul comun al unui ecran: logo sus, titlu, conținut derulabil pe fundalul crem al site-ului.
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/components/ui/brand';
import { ChevronLeftIcon } from '@/components/ui/icons';
import { LoadingBar } from '@/components/ui/loading-bar';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** `back`: un ecran din interiorul unei file (de ex. Cont → Profil) are butonul rotund „Înapoi” (doar săgeata, P-201) în loc de logo.
 * `loading` (P-219): bara de încărcare sub antet; conținutul se așază nevăzut și apare întreg când datele sunt gata. */
export function Screen({ title, intro, back, loading = false, children }: { title?: string; intro?: string; back?: boolean; loading?: boolean; children?: ReactNode }) {
  const router = useRouter();
  const theme = useTheme();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        {back ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Înapoi"
            onPress={() => router.back()}
            hitSlop={4}
            style={({ pressed }) => [styles.back, { backgroundColor: pressed ? theme.fillStrong : theme.fill }]}>
            <ChevronLeftIcon color={theme.text} />
          </Pressable>
        ) : (
          <Brand />
        )}
      </View>
      {loading ? <LoadingBar label="Se încarcă ecranul" /> : <View style={styles.barSpace} />}
      {/* Pe iOS bara de file plutește: lista lasă singură loc sub ultimul rând. */}
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {title ? (
          <ThemedText type="title" accessibilityRole="header">
            {title}
          </ThemedText>
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
  barSpace: { height: 3 },
  body: { gap: Spacing.three },
  pending: { opacity: 0 },
  back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
