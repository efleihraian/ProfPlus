// Setările pentru următorul mesaj, ca rândul de butoane de pe site: ce creează Profi, dificultatea, baremul, clasa și sursele.
// Dificultatea și baremul apar doar la teste și fișe.
import { createContext, useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { SourcePicker } from '@/components/chat/source-picker';
import { ThemedText } from '@/components/themed-text';
import { OptionSheet } from '@/components/ui/select';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ROMAN } from '@/lib/api';
import { exerciseCounts, setExerciseCount, assessmentSettingsVisible, DIFFICULTIES, DOCUMENT_TYPES, type ChatSelection, type Difficulty } from '@/lib/chat-options';

const ListLayout = createContext(false);
const useListLayout = () => useContext(ListLayout);

const FROM_MESSAGE = 'Din mesaj';
const TYPE_OPTIONS = [{ value: '', label: FROM_MESSAGE }, ...DOCUMENT_TYPES.map((type) => ({ value: type.id as string, label: type.label }))];
const DIFFICULTY_OPTIONS = [{ value: '', label: FROM_MESSAGE }, ...DIFFICULTIES.map((level) => ({ value: level.id as string, label: level.label }))];
const GRADE_OPTIONS = [{ value: '', label: 'După profil și mesaj' }, ...ROMAN.slice(0, 13).map((label, grade) => ({ value: String(grade), label: grade === 0 ? 'Pregătitoare' : `Clasa ${label}` }))];

const labelOf = (options: { value: string; label: string }[], value: string) => options.find((option) => option.value === value)?.label ?? FROM_MESSAGE;

type Sheet = 'type' | 'difficulty' | 'grade' | 'sources' | 'original' | 'copied' | null;
type Props = { selection: ChatSelection; draft: string; chatId: string | null; disabled: boolean; onChange: (selection: ChatSelection) => void; layout?: 'row' | 'list' };

/** P-169: textul butonului „Setări” din compozitor (tipul documentului ales sau „Setări”). */
export function optionsSummary(selection: ChatSelection): { label: string; configured: boolean } {
  const type = DOCUMENT_TYPES.find((t) => t.id === selection.documentType);
  const configured = !!(selection.exerciseOptions || selection.documentType || selection.difficulty || selection.answerKey || selection.grade !== undefined || selection.mode === 'manual' || selection.extraManualIds?.length || selection.extraDocumentIds?.length);
  return { label: type?.label ?? 'Setări', configured };
}

export function ChatOptions({ selection, draft, chatId, disabled, onChange, layout = 'row' }: Props) {
  const [sheet, setSheet] = useState<Sheet>(null);
  const assessment = assessmentSettingsVisible(selection.documentType, draft);
  const counts = exerciseCounts(selection);
  const countKind = sheet === 'copied' ? 'copied' : 'original';
  const countLimit = 30 - counts[countKind === 'original' ? 'copied' : 'original'];
  const countOptions = Array.from({length: countLimit + 1}, (_,value)=>({value:String(value),label:String(value)})).filter(option=>Number(option.value)+counts[countKind === 'original' ? 'copied' : 'original']>0);
  const extras = (selection.extraManualIds?.length ?? 0) + (selection.extraDocumentIds?.length ?? 0);
  const manual = selection.mode === 'manual';
  const sources = manual ? `${selection.manualIds.length + selection.documentIds.length} alese pe site` : extras ? `Automat + ${extras}` : 'Automat';
  const close = () => setSheet(null);

  return (
    <ListLayout.Provider value={layout === 'list'}>
      {/* P-169: in the composer the options open as a vertical list (one row each, label left, value right). */}
      <ScrollView
        horizontal={layout === 'row'}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={layout === 'row' ? styles.row : styles.list}>
        <Chip label="Creează" value={labelOf(TYPE_OPTIONS, selection.documentType ?? '')} active={!!selection.documentType} disabled={disabled} onPress={() => setSheet('type')} />
        {assessment ? (
          <>
            <Chip label="Generate de ProfPlus" value={selection.exerciseOptions?.counts ? String(counts.original) : FROM_MESSAGE} active={!!selection.exerciseOptions?.counts} disabled={disabled} onPress={() => setSheet('original')} />
            <Chip label="Preluate exact din surse" value={selection.exerciseOptions?.counts ? String(counts.copied) : FROM_MESSAGE} active={!!selection.exerciseOptions?.counts} disabled={disabled} onPress={() => setSheet('copied')} />
            <Chip label="Dificultate" value={labelOf(DIFFICULTY_OPTIONS, selection.difficulty ?? '')} active={!!selection.difficulty} disabled={disabled} onPress={() => setSheet('difficulty')} />
            <Chip
              label="Barem"
              value={selection.answerKey ? 'Da' : 'Nu'}
              active={!!selection.answerKey}
              disabled={disabled}
              onPress={() => onChange({ ...selection, answerKey: !selection.answerKey || undefined })}
            />
          </>
        ) : null}
        <Chip
          label="Clasa"
          value={selection.grade === undefined ? 'Din mesaj' : ROMAN[selection.grade] === '0' ? 'Pregătitoare' : ROMAN[selection.grade]}
          active={selection.grade !== undefined}
          disabled={disabled || manual}
          onPress={() => setSheet('grade')}
        />
        <Chip label="Surse" value={sources} active={manual || extras > 0} disabled={disabled || manual} onPress={() => setSheet('sources')} />
      </ScrollView>

      <OptionSheet
        visible={sheet === 'type'}
        title="Ce creează Profi"
        value={selection.documentType ?? ''}
        options={TYPE_OPTIONS}
        onClose={close}
        onChange={(value) => onChange({ ...selection, documentType: value || undefined })}
      />
      <OptionSheet
        visible={sheet === 'difficulty'}
        title="Dificultate (nu apare pe document)"
        value={selection.difficulty ?? ''}
        options={DIFFICULTY_OPTIONS}
        onClose={close}
        onChange={(value) => onChange({ ...selection, difficulty: (value || undefined) as Difficulty | undefined })}
      />
      <OptionSheet
        visible={sheet === 'grade'}
        title="Clasa pentru surse"
        value={selection.grade === undefined ? '' : String(selection.grade)}
        options={GRADE_OPTIONS}
        onClose={close}
        onChange={(value) => onChange({ ...selection, grade: value === '' ? undefined : Number(value) })}
      />
      <OptionSheet
        visible={sheet === 'original' || sheet === 'copied'}
        title={countKind === 'original' ? 'Generate de ProfPlus' : 'Preluate exact din surse'}
        value={String(counts[countKind])}
        options={countOptions}
        onClose={close}
        onChange={(value) => onChange(setExerciseCount(selection, countKind, Number(value)))}
      />
      <SourcePicker visible={sheet === 'sources'} selection={selection} chatId={chatId} onChange={onChange} onClose={close} />
    </ListLayout.Provider>
  );
}

function Chip({ label, value, active, disabled, onPress }: { label: string; value: string; active: boolean; disabled: boolean; onPress: () => void }) {
  const theme = useTheme();
  const list = useListLayout();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.chip, list && styles.listRow, { backgroundColor: active ? theme.soft : theme.fill, borderColor: active ? theme.accent : 'transparent' }, disabled && styles.dim]}>
      <ThemedText type="small" themeColor="muted">
        {label}
      </ThemedText>
      <ThemedText type="smallBold" themeColor={active ? 'softText' : 'text'}>
        {value}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { gap: 6, paddingHorizontal: 8, paddingVertical: 6 },
  list: { gap: 8, padding: 12 },
  listRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52, borderRadius: radius.lg, gap: 12 },
  chip: { minHeight: 48, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, justifyContent: 'center' },
  dim: { opacity: 0.5 },
});
