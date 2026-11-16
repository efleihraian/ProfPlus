// Clasele mele: lista claselor contului (aceleași ca pe site) și adăugarea uneia noi.
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AddClass } from '@/components/classes/add-class';
import { ImportClassroom } from '@/components/classes/import-classroom';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { cardSurface, Shape, Spacing } from '@/constants/theme';
import { useDark } from '@/hooks/use-theme';
import { api, ApiError, MAX_CLASSES, type OwnedClass } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ClassBannerArt } from '@/components/classes/class-banner-art';
import { classBannerOption } from '../../../../web/shared/class-catalog';

export default function ClassesScreen() {
  const router = useRouter();
  const dark = useDark();
  const { session } = useAuth();
  const [classes, setClasses] = useState<OwnedClass[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  // P-241: importul din Google Classroom apare numai când serverul îl are configurat.
  const [classroom, setClassroom] = useState(false);
  const [importing, setImporting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const data = await api.classes.list();
      const list = data.classes;
      setClassroom(!!data.classroomImport);
      setClasses([...list].sort((a, b) => a.g - b.g || a.l.localeCompare(b.l)));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Clasele nu pot fi încărcate acum. Verifică internetul.');
    }
  }, []);

  // Lista se reîncarcă la fiecare revenire, ca o clasă ștearsă să dispară imediat.
  useFocusEffect(
    useCallback(() => {
      if (session) void reload();
    }, [session, reload]),
  );

  async function add(g: number, l: string) {
    setBusy(true);
    setAddError(null);
    try {
      await api.classes.create(g, l);
      setAdding(false);
      await reload();
    } catch (e) {
      setAddError(e instanceof ApiError ? e.message : 'Clasa nu a putut fi adăugată. Reîncearcă.');
    } finally {
      setBusy(false);
    }
  }

  if (session === null) {
    return (
      <Screen title="Clasele mele" intro="Materialele tale, ordonate pe fiecare clasă.">
        <Card>
          <ThemedText>Intră în cont ca să-ți vezi și să-ți adaugi clasele.</ThemedText>
          <Button onPress={() => router.navigate('/cont/intrare')}>Intră în cont</Button>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Clasele mele" intro="Planificări, proiecte de lecție, teste și fișe, pe fiecare clasă. Aceleași clase ca pe site." loading={classes === null && !error}>
      <Button onPress={() => setAdding(true)} disabled={!classes || classes.length >= MAX_CLASSES}>
        Adaugă clasă
      </Button>
      {classroom ? (
        <Button variant="secondary" onPress={() => setImporting(true)} disabled={!classes || classes.length >= MAX_CLASSES}>
          Importă din Google Classroom
        </Button>
      ) : null}
      {error ? (
        <Card>
          <ThemedText themeColor="dangerText">{error}</ThemedText>
          <Button variant="secondary" onPress={reload}>
            Încearcă din nou
          </Button>
        </Card>
      ) : null}
      {classes?.length === 0 ? (
        <Card soft title="Nicio clasă încă">
          <ThemedText themeColor="muted">Adaugă prima clasă ca să-i pregătești planificări, lecții, teste și fișe cu Profi.</ThemedText>
        </Card>
      ) : null}
      <View style={styles.grid}>
        {classes?.map((c) => {
          const banner = classBannerOption(c.g, c.l, c.bannerColor);
          return (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            accessibilityLabel={`Deschide ${c.name}`}
            onPress={() => router.push({ pathname: '/clase/[id]', params: { id: c.id } })}
            style={({ pressed }) => [styles.card, { backgroundColor: banner.color }, cardSurface(dark), pressed && { transform: [{ scale: 0.98 }] }]}>
            <ClassBannerArt color={banner.id} />
            <ThemedText type="smallBold" style={styles.name}>{c.name}</ThemedText>
          </Pressable>
          );
        })}
      </View>
      <AddClass
        visible={adding}
        existing={classes ?? []}
        busy={busy}
        error={addError}
        onClose={() => {
          setAdding(false);
          setAddError(null);
        }}
        onAdd={add}
      />
      <ImportClassroom visible={importing} existing={classes ?? []} onClose={() => setImporting(false)} onImported={reload} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  card: { width: '48%', flexGrow: 1, minHeight: 104, padding: Spacing.three, borderRadius: Shape.control, borderColor: 'transparent', overflow: 'hidden' },
  name: { color: '#FFFFFF', fontSize: 17, lineHeight: 23 },
});
