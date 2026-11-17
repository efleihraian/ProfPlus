import { openBrowserAsync } from 'expo-web-browser';
import { useSyncExternalStore } from 'react';

import { Choice } from '@/components/account/choice';
import { PrivacyCard } from '@/components/privacy-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SITE_URL } from '@/components/ui/coming-soon';
import { Screen } from '@/components/ui/screen';
import { activeThemeChoice, saveThemeChoice, subscribeThemeChoice, THEME_OPTIONS } from '@/lib/appearance';

import { useAuth } from '@/lib/auth';

export default function SettingsScreen() {
  const {session} = useAuth();
  const theme = useSyncExternalStore(subscribeThemeChoice, activeThemeChoice, activeThemeChoice);

  return (
    <Screen title="Setări" back>
      <Card eyebrow="Aspect și preferințe">
        <ThemedText type="smallBold" accessibilityRole="header">
          Tema ProfPlus
        </ThemedText>
        {session ? <ThemedText type="small" themeColor="muted">Tema se sincronizează în cont când ești online.</ThemedText> : null}
        {THEME_OPTIONS.map((option) => (
          <Choice
            key={option.value}
            kind="radio"
            label={option.label}
            selected={theme === option.value}
            disabled={theme === null}
            onPress={() => void saveThemeChoice(option.value)}
          />
        ))}
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
