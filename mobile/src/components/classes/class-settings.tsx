// Setările clasei, aceleași câmpuri și limite ca pe site. Profi le folosește când pregătește documente pentru clasă.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { PencilIcon } from '@/components/ui/icons';
import { Select } from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';
import { radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { classSettingsWithSubject, filterClassSubjects, type ClassLevel, type ClassSettings } from '@/lib/api';
import { ClassBannerArt } from '@/components/classes/class-banner-art';
import { CLASS_BANNER_OPTIONS, classBannerOption, type ClassBannerColor } from '../../../../web/shared/class-catalog';

const LEVELS: readonly { value: ClassLevel; label: string }[] = [
  { value: '', label: 'Nespecificat' },
  { value: 'sprijin', label: 'Are nevoie de sprijin' },
  { value: 'mediu', label: 'Mediu' },
  { value: 'avansat', label: 'Avansat' },
];

type Props = {
  value: ClassSettings; bannerColor: ClassBannerColor | null; grade: number; letter: string;
  profileSubject: string; subjects: readonly string[];
  onSave: (settings: ClassSettings, color: ClassBannerColor | null) => Promise<boolean>; onCancel: () => void;
};

export function ClassSettingsForm({ value, bannerColor, grade, letter, profileSubject, subjects, onSave, onCancel }: Props) {
  const theme = useTheme();
  const [editingSubject, setEditingSubject] = useState(false);
  const [query, setQuery] = useState('');
  const [subjectBottom, setSubjectBottom] = useState(0);
  const [settings, setSettings] = useState(value);
  const [color, setColor] = useState(bannerColor);
  const [students, setStudents] = useState(value.students === null ? '' : String(value.students));
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof ClassSettings>(key: K, next: ClassSettings[K]) => setSettings((current) => ({ ...current, [key]: next }));

  const inherited = classSettingsWithSubject({ ...settings, subject: '' }, profileSubject).subject;
  const subject = settings.subject || inherited;
  const matchingSubjects = filterClassSubjects(subjects, query);
  function chooseSubject(next: string) {
    set('subject', next);
    setEditingSubject(false);
  }

  async function save() {
    setBusy(true);
    await onSave({ ...settings, students: students === '' ? null : Math.min(60, Number(students)) }, color);
    setBusy(false);
  }

  return (
    <View style={{ gap: Spacing.three }}>
      <View style={styles.field}>
        <ThemedText type="smallBold" themeColor="muted">Culoarea cardului</ThemedText>
        <View accessibilityRole="radiogroup" accessibilityLabel="Culoarea cardului" style={styles.colors}>
          {/* P-279: miniaturi ale bannerului (nuanța și desenul temei), ca pe site. */}
          {[{ id: null, label: 'Automat', option: classBannerOption(grade, letter) }, ...CLASS_BANNER_OPTIONS.map((option) => ({ id: option.id, label: option.label, option }))].map(({ id, label, option }) => {
            const checked = id === color;
            return (
              <Pressable key={id ?? 'auto'} accessibilityLabel={label} accessibilityRole="radio"
                accessibilityState={{ checked, disabled: busy }} disabled={busy} onPress={() => setColor(id)} style={styles.color}>
                <View style={[styles.tile, { backgroundColor: option.color, borderColor: checked ? theme.accentText : 'transparent' }]}>
                  <ClassBannerArt color={option.id} opacity={0.34} />
                  {checked ? (
                    <View style={styles.tick}>
                      <ThemedText accessible={false} type="smallBold" themeColor="accentText">✓</ThemedText>
                    </View>
                  ) : null}
                </View>
                <ThemedText type={checked ? 'smallBold' : 'small'} themeColor={checked ? 'text' : 'muted'} numberOfLines={1}>{label}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
      <ThemedText type="small" themeColor="muted">
        Profi folosește setările didactice când generează documente pentru clasă. Nu introduce date despre elevi individuali.
      </ThemedText>
      <View style={styles.field} onLayout={({ nativeEvent: { layout } }) => setSubjectBottom(layout.y + layout.height)}>
        <ThemedText type="smallBold" themeColor="muted">Disciplina</ThemedText>
        <View style={[styles.subject, { backgroundColor: theme.fill }]}>
          {editingSubject ? (
            <TextInput accessibilityLabel="Caută o disciplină" placeholder="Caută o disciplină" placeholderTextColor={theme.muted}
              value={query} onChangeText={setQuery} autoFocus editable={!busy} style={[styles.subjectText, styles.search, { color: theme.text }]} />
          ) : (
            <ThemedText style={styles.subjectText} numberOfLines={1}>{subject || 'Nespecificată'}</ThemedText>
          )}
          <Pressable accessibilityRole="button" accessibilityLabel="Editează disciplina" accessibilityState={{ expanded: editingSubject }}
            disabled={busy} style={styles.edit} onPress={() => { setQuery(''); setEditingSubject((open) => !open); }}>
            <PencilIcon color={theme.text} />
          </Pressable>
        </View>
      </View>
      <Select label="Nivelul clasei" value={settings.level} options={LEVELS} onChange={(level) => set('level', level)} />
      <TextField
        label="Număr de elevi"
        value={students}
        onChangeText={(text) => setStudents(text.replace(/\D/g, '').slice(0, 2))}
        keyboardType="number-pad"
        accessibilityHint="Cel mult 60"
      />
      <TextField label="Manualul folosit" value={settings.manual} onChangeText={(text) => set('manual', text)} maxLength={120} placeholder="ex. Editura …" />
      <TextField
        label="Preferințe pentru documente"
        value={settings.preferences}
        onChangeText={(text) => set('preferences', text)}
        maxLength={600}
        multiline
        textAlignVertical="top"
        placeholder="ex. fișe pe două niveluri, exerciții scurte, fără bonus"
      />
      <Button loading={busy} onPress={save}>
        Salvează setările
      </Button>
      <Button variant="secondary" disabled={busy} onPress={onCancel}>
        Renunță
      </Button>
      {editingSubject ? (
        <View style={[styles.picker, { top: subjectBottom + Spacing.one, borderColor: theme.borderStrong, backgroundColor: theme.surface }]}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={styles.results}>
            {settings.subject && inherited ? (
              <Pressable accessibilityRole="button" disabled={busy} style={styles.option} onPress={() => chooseSubject('')}>
                <ThemedText>Folosește materia din profil</ThemedText>
              </Pressable>
            ) : null}
            {matchingSubjects.map((item) => (
              <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: item === subject }}
                disabled={busy} style={[styles.option, item === subject && { backgroundColor: theme.soft }]} onPress={() => chooseSubject(item)}>
                <ThemedText>{item}</ThemedText>
              </Pressable>
            ))}
            {!matchingSubjects.length ? <ThemedText themeColor="muted">Nu am găsit nicio disciplină.</ThemedText> : null}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}


const styles = StyleSheet.create({
  field: { gap: Spacing.two },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  color: { width: '30%', flexGrow: 1, gap: 6 },
  tile: { height: 56, borderRadius: radius.sm, borderWidth: 2.5, overflow: 'hidden' },
  tick: { position: 'absolute', top: 5, left: 5, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  subject: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderRadius: radius.sm, paddingLeft: Spacing.three },
  subjectText: { flex: 1 },
  search: { alignSelf: 'stretch', fontSize: 16, paddingVertical: 0 },
  edit: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  picker: { position: 'absolute', left: 0, right: 0, zIndex: 1, borderWidth: 1, borderRadius: radius.sm, padding: Spacing.two },
  results: { height: 176, flexGrow: 0 },
  option: { minHeight: 44, justifyContent: 'center', borderRadius: radius.sm, paddingHorizontal: Spacing.two },
});
