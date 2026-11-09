// Acasă: aceleași trei intrări ca pagina principală a site-ului (asistentul, portofoliul, clasele).
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Profi } from '@/components/profi';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAuth();

  return (
    <Screen title="Bună! Cu ce te pot ajuta?" intro="Profi caută prin manuale și pregătește materiale pentru ora ta.">
      <Card soft>
        <View style={styles.assistant}>
          <View style={styles.assistantText}>
            <ThemedText type="smallBold" themeColor="softText">
              Asistent virtual
            </ThemedText>
            <ThemedText type="subtitle">Întreabă-l pe Profi</ThemedText>
          </View>
          <Profi width={104} />
        </View>
        <ThemedText themeColor="muted">Planificări, teste, fișe de lucru și explicații, cu sursele din manualele alese.</ThemedText>
        <Button onPress={() => router.navigate('/asistent')}>Vorbește cu Profi</Button>
      </Card>

      <Card eyebrow="Obligatoriu din 2026–2027" title="Portofoliul profesional">
        <ThemedText themeColor="muted">
          Documentele cerute de OMEC nr. 3.858/2026, grupate pe secțiuni, cu progresul tău.
        </ThemedText>
        <Button variant="secondary" onPress={() => router.navigate('/documente')}>
          Mergi la Documente personale
        </Button>
      </Card>

      <Card eyebrow="Clasele mele" title="Materiale pe fiecare clasă">
        <ThemedText themeColor="muted">Planificări, proiecte de lecție, teste și fișe, ordonate pe clase.</ThemedText>
        <Button variant="secondary" onPress={() => router.navigate('/clase')}>
          Deschide clasele
        </Button>
      </Card>

      {session === null ? (
        <Card>
          <ThemedText>Intră în cont ca să-ți păstrezi conversațiile, documentele și clasele.</ThemedText>
          <Button onPress={() => router.navigate('/cont/intrare')}>Intră în cont</Button>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  assistant: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  assistantText: { flex: 1, gap: Spacing.two },
});
