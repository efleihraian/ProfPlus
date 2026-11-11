// Acasă: aceleași trei intrări ca pagina principală a site-ului (asistentul, portofoliul, clasele).
// P-202: salutul și Profi stau în aceeași casetă principală, apoi Portofoliul profesional și Clasele mele, fără etichete verzi.
// P-217: Fun Prof nu mai are casetă pe Acasă; rămâne în Asistent (exemplul de cerere și modul din setările mesajului).
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
    <Screen>
      <Card soft>
        <View style={styles.assistant}>
          <View style={styles.assistantText}>
            <ThemedText type="subtitle" accessibilityRole="header">
              Bună! Cu ce te pot ajuta?
            </ThemedText>
          </View>
          <Profi width={104} />
        </View>
        <ThemedText themeColor="muted">
          Profi caută prin manuale și pregătește planificări, teste, fișe de lucru și explicații pentru ora ta.
        </ThemedText>
        <Button onPress={() => router.navigate('/asistent')}>Vorbește cu Profi</Button>
      </Card>

      <Card title="Portofoliul profesional">
        <ThemedText themeColor="muted">
          Documentele cerute de OMEC nr. 3.858/2026, obligatorii din 2026–2027, grupate pe secțiuni, cu progresul tău.
        </ThemedText>
        <Button variant="secondary" onPress={() => router.navigate('/documente')}>
          Mergi la Documente personale
        </Button>
      </Card>

      <Card title="Clasele mele">
        <ThemedText themeColor="muted">Fiecare clasă cu jurnalul ei și materialele pregătite pentru ea: planificări, proiecte de lecție, teste și fișe.</ThemedText>
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
