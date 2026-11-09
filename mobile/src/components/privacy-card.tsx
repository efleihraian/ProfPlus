// P-167 — „Date și permisiuni” în aplicație: ce se prelucrează, ce senzori se folosesc și cum retragi accesul.
// Aplicația nu are cookie-uri, trackere de analiză/publicitate, microfon sau localizare; camera și pozele se cer
// doar la folosire. Textul trebuie să rămână aliniat cu profplus.ro/confidentialitate și cu declarațiile din magazine.
import * as SecureStore from 'expo-secure-store';
import { openBrowserAsync } from 'expo-web-browser';
import { useState } from 'react';
import { Linking } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SITE_URL } from '@/components/ui/coming-soon';

export function PrivacyCard() {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <Card eyebrow="Date și permisiuni">
      <ThemedText themeColor="muted">
        Pe telefon păstrăm doar sesiunea de autentificare, criptată, confirmarea informărilor și tema aleasă. Nu folosim cookie-uri, trackere de analiză sau publicitate, microfonul ori localizarea.
      </ThemedText>
      <ThemedText themeColor="muted">
        Camera și pozele se folosesc doar când apeși „Fotografiază” (portofoliu) sau „Foto” (chat), după ce telefonul îți cere permisiunea. Fotografiile din chat sunt trimise fără locație serviciului AI (OpenAI) numai pentru răspuns și nu se salvează.
      </ThemedText>
      <ThemedText themeColor="muted">
        Mesajele și documentele tale sunt salvate în cont și prelucrate de serviciul AI pentru răspunsuri. Nu include date personale ale elevilor.
      </ThemedText>
      <Button variant="secondary" onPress={() => openBrowserAsync(SITE_URL + '/confidentialitate')}>
        Politica de confidențialitate
      </Button>
      <Button variant="secondary" onPress={() => void Linking.openSettings()}>
        Permisiunile aplicației în setările telefonului
      </Button>
      <Button
        variant="secondary"
        onPress={async () => {
          try {
            await SecureStore.deleteItemAsync('profplus-photo-notice-v1');
            setMessage('Informarea despre fotografii va apărea din nou la următoarea fotografie.');
          } catch {
            setMessage('Informarea nu a putut fi resetată.');
          }
        }}>
        Arată din nou informarea despre fotografii
      </Button>
      {message ? (
        <ThemedText type="small" themeColor="muted" accessibilityLiveRegion="polite">
          {message}
        </ThemedText>
      ) : null}
    </Card>
  );
}
