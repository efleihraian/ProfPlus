// Ecran pentru secțiunile care nu sunt încă în aplicație: spune deschis ce vine și trimite la site între timp.
import { openBrowserAsync } from 'expo-web-browser';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';

export const SITE_URL = 'https://profplus.ro';

export function ComingSoon({ title, intro, items }: { title: string; intro: string; items: string[] }) {
  return (
    <Screen title={title} intro={intro}>
      <Card soft eyebrow="În curând în aplicație">
        {items.map((item) => (
          <ThemedText key={item}>• {item}</ThemedText>
        ))}
      </Card>
      <Card>
        <ThemedText themeColor="muted">Până atunci, secțiunea funcționează pe site, cu același cont.</ThemedText>
        <Button variant="secondary" onPress={() => openBrowserAsync(SITE_URL)}>
          Deschide profplus.ro
        </Button>
      </Card>
    </Screen>
  );
}
