import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Choice } from '@/components/account/choice';
import { SourcePicker } from '@/components/chat/source-picker';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';
import { radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api, CLASS_DIFFICULTY, classContext, classSettingsWithSubject, type ClassDetail, type OwnedClass } from '@/lib/api';
import { DIFFICULTIES, type ChatSelection, type DocumentType } from '@/lib/chat-options';
import { exerciseLabels, resizeExerciseCounts, validExerciseOptions, type ExerciseCounts, type ExerciseOptions } from '../../../../web/lib/exercise-options';
import { buildPrompt, documentTypeLabel, emptyPrompt, examplePrompt, generationTitle, GRADES, missingFields, promptFieldsFor, type GenerationTitle, type PromptFields } from '../../../../web/lib/prompt-template';

type Request = { text: string; title: GenerationTitle; selection: ChatSelection; classId?: string };
type Props = {
  type: DocumentType;
  subjects: readonly string[];
  subject: string;
  classId?: string;
  chatId: string | null;
  selection: ChatSelection;
  onClose: () => void;
  onSend: (request: Request) => void;
};
const DEFAULT_COUNTS = {original: 3, copied: 3, numbers: 0};
const gradeOptions = [{value: '', label: 'Alege clasa'}, ...GRADES.map(grade => ({value: grade, label: grade}))];
const difficultyOptions = [{value: '' as const, label: 'Nespecificată'}, ...DIFFICULTIES.map(level => ({value: level.id, label: level.label}))];

export function GenerationForm({type, subjects, subject, classId, chatId, selection, onClose, onSend}: Props) {
  const theme = useTheme();
  const [fields, setFields] = useState(() => ({
    ...emptyPrompt(type, subject === '*' ? '' : subject),
    grade: selection.grade === undefined ? '' : GRADES[selection.grade] ?? '',
    difficulty: selection.difficulty ?? '',
  } satisfies PromptFields));
  const [counts, setCounts] = useState<ExerciseCounts>(DEFAULT_COUNTS);
  const [details, setDetails] = useState('');
  const [subpoints, setSubpoints] = useState<Record<number, number>>({});
  const [specific, setSpecific] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sources, setSources] = useState(selection);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [classes, setClasses] = useState<OwnedClass[]>([]);
  const [chosen, setChosen] = useState(classId ?? '');
  const [target, setTarget] = useState<ClassDetail | null>(null);
  const [classError, setClassError] = useState('');
  const [classRetry, setClassRetry] = useState(0);
  const [error, setError] = useState('');
  const show = promptFieldsFor(type);
  const total = counts.original + counts.copied;
  const settings = target && target.class.id === chosen
    ? classSettingsWithSubject(target.journal.settings, subject)
    : null;

  useEffect(() => {
    let active = true;
    void api.classes.list().then(result => { if (active) setClasses(result.classes); }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!chosen) return;
    let active = true;
    void api.classes.get(chosen).then(detail => {
      if (!active) return;
      const defaults = classSettingsWithSubject(detail.journal.settings, subject);
      setTarget(detail);
      setFields(previous => ({
        ...previous,
        grade: GRADES[detail.class.g] ?? '',
        subject: defaults.subject || previous.subject,
        difficulty: defaults.level ? CLASS_DIFFICULTY[defaults.level] : previous.difficulty,
      }));
    }).catch(() => {
      if (active) setClassError('Clasa nu a putut fi încărcată.');
    });
    return () => { active = false; };
  }, [chosen, subject, classRetry]);

  const set = <K extends keyof PromptFields>(key: K, value: PromptFields[K]) => {
    setFields(previous => ({...previous, [key]: value}));
    setError('');
  };
  const subjectOptions = [{value: '', label: 'Alege disciplina'}, ...Array.from(new Set([...subjects, fields.subject].filter(Boolean))).map(value => ({value, label: value}))];
  const classOptions = [{value: '', label: 'Alege nivelul clasei'}, ...classes.map(item => ({value: item.id, label: item.name}))];
  const promptFields = {...fields, count: show.count && total ? String(total) : ''};
  const context = target && settings ? classContext(target.class.name, {...settings, subject: fields.subject}, target.journal.classroom) : '';
  const text = buildPrompt(promptFields) + (context
    ? '\nContextul clasei: ' + context + '. Folosește și documentele încărcate în această clasă, dacă sunt relevante.'
    : '');

  function updateCount(key: 'original' | 'copied', value: string) {
    const available = 30 - counts[key === 'original' ? 'copied' : 'original'];
    const next = {...counts, [key]: Math.min(available, Number(value.replace(/\D/g, '')))};
    setCounts(next);
    const nextTotal = next.original + next.copied;
    setSubpoints(previous => Object.fromEntries(Object.entries(previous).filter(([exercise]) => Number(exercise) <= nextTotal)));
    setError('');
  }

  function submit() {
    const missing = missingFields(promptFields);
    if (missing.length) {
      setError('Mai completează: ' + missing.join(', ') + '.');
      return;
    }
    const exerciseOptions: ExerciseOptions = {
      ...(total ? {total, counts} : {}),
      ...(specific ? {subpoints: Object.entries(subpoints).filter(([,count]) => count > 0).map(([exercise,count]) => ({exercise:Number(exercise),count}))} : {}),
      ...(details.trim() ? {details: details.trim()} : {}),
    };
    if (show.count && Object.keys(exerciseOptions).length && !validExerciseOptions(exerciseOptions)) {
      setError('Alege cel puțin un exercițiu pentru configurarea subpunctelor.');
      return;
    }
    onSend({
      text,
      title: generationTitle(promptFields),
      classId: chosen || undefined,
      selection: {
        ...sources,
        documentType: type,
        grade: GRADES.findIndex(grade => grade === fields.grade),
        difficulty: show.difficulty && fields.difficulty ? fields.difficulty : undefined,
        answerKey: show.answerKey && fields.answerKey ? true : undefined,
        exerciseOptions: show.count && Object.keys(exerciseOptions).length ? exerciseOptions : undefined,
      },
    });
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, {backgroundColor: theme.background}]}>
        <KeyboardAvoidingView style={styles.safe} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
            <ThemedText type="title" accessibilityRole="header">{documentTypeLabel(type)}</ThemedText>
            <Select label="Disciplina" value={fields.subject} options={subjectOptions} onChange={value => set('subject', value)} searchLabel="Caută disciplină" />
            {classId ? <ThemedText>{target?.class.name ?? 'Se încarcă clasa…'}</ThemedText> : (
              <>
                {classes.length > 0 ? <Select label="Clasele mele" value={chosen} options={classOptions} onChange={value => {
                  setTarget(null);
                  setClassError('');
                  setChosen(value);
                }} /> : null}
                {!chosen ? <Select label="Clasa" value={fields.grade} options={gradeOptions} onChange={value => set('grade', value)} /> : null}
              </>
            )}
            {classError ? <Button variant="secondary" onPress={() => {setClassError(''); setClassRetry(previous => previous + 1);}}>{classError} Reîncearcă</Button> : null}
            <TextField label="Tema sau capitolul" value={fields.topic} onChangeText={value => set('topic', value)} maxLength={160} />
            {show.count ? (
              <>
                <ThemedText type="smallBold">Exerciții: {total}</ThemedText>
                <TextField label={exerciseLabels.original} value={String(counts.original)} onChangeText={value => updateCount('original', value)} keyboardType="number-pad" maxLength={2} selectTextOnFocus />
                <TextField label={exerciseLabels.copied} value={String(counts.copied)} onChangeText={value => updateCount('copied', value)} keyboardType="number-pad" maxLength={2} selectTextOnFocus />
              </>
            ) : null}
            {show.duration ? <TextField label="Durata (minute)" keyboardType="number-pad" maxLength={3} value={fields.duration} onChangeText={value => set('duration', value)} /> : null}
            {show.slides ? <TextField label="Număr de slide-uri" keyboardType="number-pad" maxLength={2} value={fields.slides} onChangeText={value => set('slides', value)} /> : null}
            {show.period ? <TextField label="Perioada" maxLength={80} value={fields.period} onChangeText={value => set('period', value)} /> : null}
            <Button variant="secondary" onPress={() => {
              const example = examplePrompt(type);
              setFields({...example, subject: fields.subject || example.subject, grade: fields.grade || example.grade, ...(chosen ? {difficulty: fields.difficulty} : {})});
              setCounts(Number(example.count) ? resizeExerciseCounts({original:6,copied:4,numbers:0}, Number(example.count)) : DEFAULT_COUNTS);
              setDetails('');
              setSubpoints({});
              setSpecific(false);
              setError('');
            }}>Completează cu un exemplu</Button>
            <Button variant="secondary" expanded={settingsOpen} onPress={() => setSettingsOpen(open => !open)}>
              {settingsOpen ? 'Ascunde setările' : 'Setări pentru document'}
            </Button>
            {settingsOpen ? (
              <View style={[styles.configuration, {backgroundColor: theme.surface, borderColor: theme.border}]}>
                {show.count ? (
                  <>
                    <Select label="Dificultate" value={fields.difficulty} options={difficultyOptions} onChange={value => set('difficulty', value)} />
                    <Choice kind="checkbox" label="Stabilește subpunctele pe exerciții" selected={specific} onPress={() => setSpecific(!specific)} />
                    {specific ? Array.from({length: total}, (_, index) => (
                      <TextField key={index} label={'Subpuncte la exercițiul ' + (index + 1)} value={String(subpoints[index + 1] ?? 0)} keyboardType="number-pad" maxLength={2} selectTextOnFocus
                        onChangeText={value => setSubpoints(previous => ({...previous, [index + 1]: Math.min(10, Number(value.replace(/\D/g, '')))}))} />
                    )) : null}
                    <TextField label="Detalii despre exerciții (opțional)" multiline maxLength={800} value={details} onChangeText={setDetails} />
                  </>
                ) : null}
                {show.answerKey ? <Choice kind="checkbox" label="Adaugă baremul la final" selected={fields.answerKey} onPress={() => set('answerKey', !fields.answerKey)} /> : null}
                <Button variant="secondary" disabled={sources.mode === 'manual'} onPress={() => setLibraryOpen(true)}>Bibliotecă</Button>
              </View>
            ) : null}
            <ThemedText type="subtitle" accessibilityRole="header">Cererea ta</ThemedText>
            <ThemedText selectable themeColor="muted">{text}</ThemedText>
            <ThemedText type="small" themeColor="muted">Nu include date personale ale elevilor. Verifică materialul înainte de a-l folosi.</ThemedText>
            {error ? <ThemedText themeColor="dangerText" accessibilityRole="alert">{error}</ThemedText> : null}
          </ScrollView>
          <View style={[styles.footer, {backgroundColor: theme.surface, borderColor: theme.border}]}>
            <View style={styles.footerButton}><Button variant="secondary" onPress={onClose}>Renunță</Button></View>
            <View style={styles.footerButton}><Button disabled={Boolean(chosen && !settings)} onPress={submit}>Trimite</Button></View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <SourcePicker visible={libraryOpen} selection={sources} chatId={chatId} onChange={setSources} onClose={() => setLibraryOpen(false)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1},
  body: {width: '100%', maxWidth: 640, alignSelf: 'center', padding: Spacing.three, gap: Spacing.three},
  footer: {alignSelf: 'center', width: '100%', maxWidth: 640, borderTopWidth: 1, flexDirection: 'row', gap: Spacing.two, padding: Spacing.two},
  footerButton: {flex: 1},
  configuration: {borderRadius: radius.md, borderWidth: 1, padding: Spacing.three, gap: Spacing.two},
});
