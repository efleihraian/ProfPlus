// Cadrul comun al unui ecran: logo sus, titlu, conținut derulabil pe fundalul crem al site-ului.
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/components/ui/brand';
import { ChevronLeftIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** `back`: un ecran din interiorul unei file (de ex. Cont → Profil) are „Înapoi” în loc de logo. */
export function Screen({ title, intro, back, children }: { title: string; intro?: string; back?: boolean; children?: ReactNode }) {
  const router = useRouter();
  const theme = useTheme();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        {back ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Înapoi" onPress={() => router.back()} hitSlop={8} style={styles.back}>
            <ChevronLeftIcon color={theme.text} />
            <ThemedText type="smallBold">Înapoi</ThemedText>
          </Pressable>
        ) : (
          <Brand />
        )}
      </View>
      {/* Pe iOS bara de file plutește: lista lasă singură loc sub ultimul rând. */}
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText type="title" accessibilityRole="header">
          {title}
        </ThemedText>
        {intro ? <ThemedText themeColor="muted">{intro}</ThemedText> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingVertical: 12, borderBottomWidth: 1 },
  back: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
