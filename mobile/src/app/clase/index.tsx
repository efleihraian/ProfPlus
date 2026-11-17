import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AddClass } from '@/components/classes/add-class';
import { ImportClassroom } from '@/components/classes/import-classroom';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { cardSurface, Shape, Spacing } from '@/constants/theme';
import { SiteIcon } from '@/components/ui/site-icon';
import { useDark, useTheme } from '@/hooks/use-theme';
import { api, ApiError, MAX_CLASSES, type OwnedClass } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ClassBannerArt } from '@/components/classes/class-banner-art';
import { classBannerOption } from '../../../../web/shared/class-catalog';

export default function ClassesScreen() {
  const router = useRouter();
  const dark = useDark();
  const theme = useTheme();
  const { session } = useAuth();
  const [classes, setClasses] = useState<OwnedClass[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<OwnedClass | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
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

  useFocusEffect(
    useCallback(() => {
      if (session) void reload();
      return () => setEditing(false);
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

  async function remove() {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await api.classes.remove(deleting.id);
      setClasses(previous => previous?.filter(cls => cls.id !== deleting.id) ?? null);
      setDeleting(null);
    } catch (e) {
      setDeleteError(e instanceof ApiError ? e.message : 'Clasa nu a putut fi ștearsă. Reîncearcă.');
    } finally {
      setDeleteBusy(false);
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
      {classes?.length ? (
        <Button variant="secondary" expanded={editing} onPress={() => setEditing(value => !value)}>
          {editing ? 'Gata' : 'Editează'}
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
            <View key={c.id} style={[styles.card, {backgroundColor: banner.color}, cardSurface(dark)]}>
              <ClassBannerArt color={banner.id} />
              <Pressable accessibilityRole="button" accessibilityLabel={`Deschide ${c.name}`}
                onPress={() => router.push({pathname: '/clase/[id]', params: {id: c.id}})} style={styles.nameButton}>
                <ThemedText type="smallBold" style={styles.name}>{c.name}</ThemedText>
              </Pressable>
              {editing ? <View style={styles.tools}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Setări pentru ${c.name}`}
                  onPress={() => router.push({pathname: '/clase/[id]', params: {id: c.id, settings: '1'}})}
                  style={[styles.tool, {backgroundColor: theme.surface}]}>
                  <SiteIcon name="settings" color={theme.text} size={20} />
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Șterge ${c.name}`}
                  onPress={() => {setDeleteError(null); setDeleting(c);}} style={[styles.tool, {backgroundColor: theme.surface}]}>
                  <SiteIcon name="trash" color={theme.dangerText} size={20} />
                </Pressable>
              </View> : null}
            </View>
          );
        })}
      </View>
      <Modal visible={!!deleting} transparent animationType="fade" onRequestClose={() => {if (!deleteBusy) setDeleting(null);}}>
        <View style={styles.backdrop}>
          <View accessibilityViewIsModal style={styles.dialog}>
            <Card title={`Ștergi ${deleting?.name ?? 'clasa'}?`}>
              <ThemedText>Se șterg documentele încărcate în această clasă, observațiile și setările ei. Conversațiile rămân în istoric. Ștergerea nu poate fi anulată.</ThemedText>
              {deleteError ? <ThemedText themeColor="dangerText">{deleteError}</ThemedText> : null}
              <Button variant="secondary" disabled={deleteBusy} onPress={() => setDeleting(null)}>Renunță</Button>
              <Button variant="danger" disabled={deleteBusy} onPress={remove}>{deleteBusy ? 'Se șterge…' : 'Șterge clasa'}</Button>
            </Card>
          </View>
        </View>
      </Modal>
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
  nameButton: {minHeight: 44, justifyContent: 'center'},
  tools: {flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.one},
  tool: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: Shape.control},
  backdrop: {flex: 1, justifyContent: 'center', padding: Spacing.three, backgroundColor: 'rgba(0,0,0,0.46)'},
  dialog: {width: '100%', maxWidth: 480, alignSelf: 'center'},
  name: { color: '#FFFFFF', fontSize: 17, lineHeight: 23 },
});
