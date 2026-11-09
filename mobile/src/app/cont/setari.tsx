// Cont → Setări (P-195): „Aspect și preferințe” și „Cookie-uri și confidențialitate” de pe site, împreună.
// Disponibil și fără cont: tema și informațiile despre date țin de telefon.
import { openBrowserAsync } from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Choice } from '@/components/account/choice';
import { PrivacyCard } from '@/components/privacy-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SITE_URL } from '@/components/ui/coming-soon';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { loadThemeChoice, saveThemeChoice, THEME_OPTIONS, type ThemeChoice } from '@/lib/appearance';

export default function SettingsScreen() {
  const [theme, setTheme] = useState<ThemeChoice | null>(null);

  useEffect(() => {
    void loadThemeChoice().then(setTheme);
  }, []);

  return (
    <Screen title="Setări" back>
      <Card eyebrow="Aspect și preferințe">
        <ThemedText type="smallBold" accessibilityRole="header">
          Tema ProfPlus pe acest telefon
        </ThemedText>
        {THEME_OPTIONS.map((option) => (
          <Choice
            key={option.value}
            kind="radio"
            label={option.label}
            selected={theme === option.value}
            disabled={theme === null}
            onPress={() => {
              setTheme(option.value);
              void saveThemeChoice(option.value);
            }}
          />
        ))}
        <View style={styles.row}>
          <ThemedText>Limba interfeței</ThemedText>
          <ThemedText type="smallBold">Română</ThemedText>
        </View>
      </Card>
      <PrivacyCard />
      <Card eyebrow="Documente">
        <Button variant="secondary" onPress={() => openBrowserAsync(SITE_URL + '/termeni')}>
          Termenii de utilizare
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
});
