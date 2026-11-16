// P-241 — Importul claselor din Google Classroom, ca pe site: explicația, consimțământul Google într-o fereastră de
// browser, apoi verificarea propunerilor (clasă, literă, disciplină) înainte de a adăuga ceva. Tokenul Google nu ajunge
// în aplicație: aceasta primește doar codul de o singură folosire și îl trimite serverului ProfPlus, cu contul conectat.
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  api,
  ApiError,
  CLASSROOM_APP_RETURN,
  CLASSROOM_CODE_PARAM,
  CLASSROOM_ERROR_PARAM,
  CLASSROOM_STATE_PARAM,
  classTitle,
  courseSummary,
  emptyJournal,
  importLabel,
  importPlan,
  journalWithImport,
  LETTERS,
  MAX_CLASSES,
  ROMAN,
  type ClassroomCourse,
  type ImportChoice,
  type OwnedClass,
} from '@/lib/api';

type Row = ClassroomCourse & ImportChoice;
type Props = { visible: boolean; existing: OwnedClass[]; onClose: () => void; onImported: () => Promise<void> };
// Pregătitoare (0) și clasele I–XII, ca la adăugarea manuală.
const GRADES = ROMAN.slice(0, 13).map((label, g) => ({ g, label: g === 0 ? 'P' : label }));
const text = (e: unknown, fallback: string) => (e instanceof ApiError ? e.message : fallback);

export function ImportClassroom({ visible, existing, onClose, onImported }: Props) {
  const theme = useTheme();
  const [step, setStep] = useState<'intro' | 'review' | 'done'>('intro');
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(0);

  const plan = importPlan(rows, existing, MAX_CLASSES);
  const ready = plan.filter((s) => s === 'ready').length;
  const updates = plan.filter((s) => s === 'update').length;
  const today = () => new Date().toISOString().slice(0, 10);
  const edit = (index: number, patch: Partial<Row>) => setRows((list) => list.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  function close() {
    if (busy) return;
    setStep('intro');
    setRows([]);
    setEditing(null);
    setError(null);
    onClose();
  }

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await api.classes.classroomStart(true);
      const state = new URL(url).searchParams.get('state');
      const result = await WebBrowser.openAuthSessionAsync(url, CLASSROOM_APP_RETURN);
      if (result.type !== 'success') {
        setError('Importul nu s-a încheiat. Nu s-a adăugat nimic.');
        return;
      }
      const back = new URL(result.url).searchParams;
      const code = back.get(CLASSROOM_CODE_PARAM);
      // Numai răspunsul la cererea pornită acum de aplicație.
      if (!code || !state || back.get(CLASSROOM_STATE_PARAM) !== state) {
        setError(
          back.get(CLASSROOM_ERROR_PARAM) === 'denied'
            ? 'Nu ai acordat accesul la cursurile din Google Classroom; nu s-a importat nimic.'
            : 'Importul din Google Classroom nu s-a încheiat. Încearcă din nou.',
        );
        return;
      }
      const { courses } = await api.classes.classroomCourses(code, state);
      // Clasele noi sunt alese din start; cele existente se actualizează numai dacă profesorul le alege.
      setRows(courses.map((c) => ({ ...c, selected: c.g !== null && !!c.l && !existing.some((k) => k.g === c.g && k.l === c.l) })));
      setStep('review');
    } catch (e) {
      setError(text(e, 'Importul nu a putut porni. Verifică internetul și reîncearcă.'));
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    setBusy(true);
    setError(null);
    let count = 0;
    try {
      for (const [index, row] of rows.entries()) {
        const status = plan[index];
        if (status === 'ready') {
          const created = await api.classes.create(row.g!, row.l!);
          count++;
          // Disciplina, numărul de elevi și titlurile din Classroom intră în clasă; dacă salvarea lor eșuează, clasa rămâne.
          await api.classes.saveJournal(created.class.id, journalWithImport(emptyJournal(), row, today()), null).catch(() => {});
        } else if (status === 'update') {
          // Clasă existentă: observațiile și setările profesorului rămân; revizia refuză salvarea peste o modificare paralelă.
          const owned = existing.find((c) => c.g === row.g && c.l === row.l);
          if (!owned) continue;
          const current = await api.classes.get(owned.id);
          await api.classes.saveJournal(owned.id, journalWithImport(current.journal, row, today()), current.revision);
          count++;
        }
      }
      setAdded(count);
      setStep('done');
    } catch (e) {
      const partial = count ? `${count} ${count === 1 ? 'clasă a fost salvată' : 'clase au fost salvate'}, apoi: ` : '';
      setError(partial + text(e, 'Importul a fost întrerupt. Reîncearcă.'));
    } finally {
      setBusy(false);
      await onImported().catch(() => {});
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderColor: theme.border }]}>
          <ThemedText type="subtitle" accessibilityRole="header" style={styles.flex}>
            Import din Google Classroom
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={close} style={styles.close}>
            <ThemedText type="linkPrimary">Închide</ThemedText>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {step === 'intro' ? (
            <>
              <ThemedText>
                Alegi contul Google în care ai cursurile, iar ProfPlus citește o singură dată cursurile active la care ești profesor: numele și secțiunea,
                titlurile capitolelor, ale materialelor postate și ale temelor date, și câți elevi sunt înscriși. Din ele propune clasa, litera și
                disciplina, pe care le verifici înainte de a salva ceva.
              </ThemedText>
              <View style={[styles.note, { backgroundColor: theme.soft }]}>
                <ThemedText type="small">• Despre elevi păstrăm doar numărul lor. Nu citim nume, adrese de email, predări, note sau anunțuri.</ThemedText>
                <ThemedText type="small">
                  • Nu aducem fișierele și nici descrierile, doar titluri. Pe ecranul Google poți debifa orice permisiune; partea respectivă nu se importă.
                </ThemedText>
                <ThemedText type="small">• Nu păstrăm accesul la contul tău Google și nu modificăm nimic în Classroom.</ThemedText>
                <ThemedText type="small">• În ProfPlus se salvează numai clasele pe care le alegi; datele importate se pot elimina din pagina clasei.</ThemedText>
              </View>
              {error ? <ThemedText themeColor="dangerText">{error}</ThemedText> : null}
              <Button loading={busy} onPress={start}>
                Continuă cu Google
              </Button>
            </>
          ) : null}

          {step === 'review' ? (
            <>
              <ThemedText themeColor="muted">
                {rows.length
                  ? 'Am propus clasa și litera după numele fiecărui curs. Corectează ce nu se potrivește și oprește cursurile pe care nu le vrei. Clasele pe care le ai deja se actualizează numai dacă le alegi; observațiile și setările tale rămân.'
                  : 'Nu am găsit cursuri active la care ești profesor în acest cont Google. Dacă le ai în alt cont, pornește importul din nou și alege-l pe acela.'}
              </ThemedText>
              {rows.map((row, index) => {
                const status = plan[index];
                const summary = courseSummary(row);
                const problem = status === 'incomplete' || status === 'duplicate' || status === 'over-limit';
                return (
                  <View key={index} style={[styles.row, { borderColor: status === 'ready' || status === 'update' ? theme.accent : theme.border, backgroundColor: theme.surface }]}>
                    <View style={styles.rowHead}>
                      <View style={styles.flex}>
                        <ThemedText type="smallBold">{row.name}</ThemedText>
                        {row.section ? (
                          <ThemedText type="small" themeColor="muted">
                            {row.section}
                          </ThemedText>
                        ) : null}
                        {summary ? (
                          <ThemedText type="small" themeColor="muted">
                            {summary}
                          </ThemedText>
                        ) : null}
                      </View>
                      <Switch
                        accessibilityLabel={`Importă ${row.name}`}
                        value={row.selected}
                        disabled={busy}
                        onValueChange={(selected) => edit(index, { selected })}
                      />
                    </View>
                    <ThemedText type="small" themeColor={problem ? 'dangerText' : 'muted'}>
                      {row.g !== null && row.l ? `${classTitle(row.g, row.l)} · ` : ''}
                      {importLabel(status, row)}
                    </ThemedText>
                    {editing === index ? (
                      <View style={styles.editor}>
                        <ThemedText type="smallBold">Clasa</ThemedText>
                        <View style={styles.chips}>
                          {GRADES.map(({ g, label }) => (
                            <Chip key={g} label={label} selected={row.g === g} onPress={() => edit(index, { g, selected: true })} />
                          ))}
                        </View>
                        <ThemedText type="smallBold">Litera</ThemedText>
                        <View style={styles.chips}>
                          {[...LETTERS].map((l) => (
                            <Chip key={l} label={l} selected={row.l === l} onPress={() => edit(index, { l, selected: true })} />
                          ))}
                        </View>
                        <TextField label="Disciplina" value={row.subject} onChangeText={(subject) => edit(index, { subject })} maxLength={80} placeholder="opțional" />
                        <Button variant="secondary" onPress={() => setEditing(null)}>
                          Gata
                        </Button>
                      </View>
                    ) : (
                      <Pressable accessibilityRole="button" disabled={busy} onPress={() => setEditing(index)} style={styles.editLink}>
                        <ThemedText type="linkPrimary">
                          {row.subject ? `Disciplina: ${row.subject} · ` : ''}Modifică
                        </ThemedText>
                      </Pressable>
                    )}
                  </View>
                );
              })}
              {error ? <ThemedText themeColor="dangerText">{error}</ThemedText> : null}
              {rows.length ? (
                <Button disabled={!(ready + updates)} loading={busy} onPress={apply}>
                  {ready + updates
                    ? [ready ? `Adaugă ${ready} ${ready === 1 ? 'clasă' : 'clase'}` : '', updates ? `${ready ? 'actualizează' : 'Actualizează'} ${updates} ${updates === 1 ? 'clasă' : 'clase'}` : '']
                        .filter(Boolean)
                        .join(' și ')
                    : 'Adaugă clasele'}
                </Button>
              ) : null}
            </>
          ) : null}

          {step === 'done' ? (
            <>
              <ThemedText>
                {added === 1 ? 'A fost salvată o clasă.' : `Au fost salvate ${added} clase.`} Disciplina, numărul de elevi și datele din Classroom sunt în
                pagina clasei, unde le poți schimba sau elimina oricând.
              </ThemedText>
              <Button onPress={close}>Gata</Button>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, { borderColor: selected ? theme.accent : 'transparent', backgroundColor: selected ? theme.soft : theme.fill }]}>
      <ThemedText type="smallBold" themeColor={selected ? 'softText' : 'text'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, padding: Spacing.three, borderBottomWidth: 1 },
  close: { minHeight: 44, justifyContent: 'center' },
  body: { padding: Spacing.three, gap: Spacing.three },
  note: { borderRadius: 18, padding: 16, gap: 6 },
  row: { borderWidth: 1.5, borderRadius: 18, padding: 14, gap: 8 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  editor: { gap: Spacing.two },
  editLink: { minHeight: 44, justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minWidth: 48, minHeight: 48, borderWidth: 1.5, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
});
