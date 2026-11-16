// Observațiile despre clasă, ca pe site: private, în contul profesorului, fără date despre elevi. Se notează cu data de azi.
import { randomUUID } from 'expo-crypto';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { NOTE_TAGS, type ClassNote } from '@/lib/api';

const MAX_NOTES = 200;
const TAGS = NOTE_TAGS.map((tag) => ({ value: tag.id, label: tag.label }));

function today() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
}

export function ClassNotes({ notes, onSave }: { notes: ClassNote[]; onSave: (notes: ClassNote[]) => Promise<boolean> }) {
  const theme = useTheme();
  const [tag, setTag] = useState<ClassNote['tag']>('lectie');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date));

  async function add() {
    setBusy(true);
    if (await onSave([...notes, { id: randomUUID().slice(0, 18), date: today(), tag, text: text.trim() }])) setText('');
    setBusy(false);
  }

  function remove(note: ClassNote) {
    Alert.alert('Ștergi observația?', 'Observația nu mai poate fi recuperată.', [
      { text: 'Renunță', style: 'cancel' },
      { text: 'Șterge', style: 'destructive', onPress: () => void onSave(notes.filter((other) => other.id !== note.id)) },
    ]);
  }

  return (
    <>
      <ThemedText type="small" themeColor="muted">
        Notează cum au mers lecțiile, evaluările sau organizarea, fără nume, note sau alte date personale ale elevilor. Observațiile sunt private, în contul tău.
      </ThemedText>
      <Select label="Tip" value={tag} options={TAGS} onChange={setTag} />
      <TextField
        label="Observație"
        value={text}
        onChangeText={setText}
        maxLength={1000}
        multiline
        textAlignVertical="top"
        placeholder="ex. Clasa a lucrat bine pe grupe."
      />
      <Button variant="secondary" loading={busy} disabled={!text.trim() || notes.length >= MAX_NOTES} onPress={add}>
        Adaugă observația
      </Button>
      {sorted.map((note) => (
        <View key={note.id} style={[styles.note, { borderColor: theme.border }]}>
          <View style={styles.header}>
            <ThemedText type="small" themeColor="muted" style={styles.flex}>
              {new Date(note.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })} · {NOTE_TAGS.find((item) => item.id === note.tag)?.label}
            </ThemedText>
            <Pressable accessibilityRole="button" accessibilityLabel="Șterge observația" onPress={() => remove(note)} hitSlop={8}>
              <ThemedText type="small" themeColor="dangerText">
                Șterge
              </ThemedText>
            </Pressable>
          </View>
          <ThemedText selectable>{note.text}</ThemedText>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  note: { borderTopWidth: 1, paddingTop: Spacing.two, gap: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1 },
});
