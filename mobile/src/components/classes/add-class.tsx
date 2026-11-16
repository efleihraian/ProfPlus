// Adăugarea unei clase: clasa (P, I–XII) și litera (A–J), cu previzualizarea numelui și refuzul dublurilor, ca pe site.
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { classTitle, LETTERS, ROMAN, type OwnedClass } from '@/lib/api';

// Pregătitoare (0) și clasele I–XII; XIII apare doar la unele licee și se poate adăuga de pe site.
const GRADES = ROMAN.slice(0, 13).map((label, g) => ({ g, label: g === 0 ? 'P' : label }));

type Props = { visible: boolean; existing: OwnedClass[]; busy: boolean; error: string | null; onClose: () => void; onAdd: (g: number, l: string) => void };

export function AddClass({ visible, existing, busy, error, onClose, onAdd }: Props) {
  const theme = useTheme();
  const [grade, setGrade] = useState<number | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const duplicate = grade !== null && letter !== null && existing.some((c) => c.g === grade && c.l === letter);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderColor: theme.border }]}>
          <ThemedText type="subtitle" accessibilityRole="header">
            Adaugă clasă
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
            <ThemedText type="linkPrimary">Închide</ThemedText>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <ThemedText type="smallBold">Clasa</ThemedText>
          <View style={styles.chips}>
            {GRADES.map(({ g, label }) => (
              <Chip key={g} label={label} selected={grade === g} onPress={() => setGrade(g)} />
            ))}
          </View>
          <ThemedText type="smallBold">Litera</ThemedText>
          <View style={styles.chips}>
            {[...LETTERS].map((l) => (
              <Chip key={l} label={l} selected={letter === l} onPress={() => setLetter(l)} />
            ))}
          </View>
          <View style={[styles.preview, { backgroundColor: theme.soft }]}>
            <ThemedText type="small" themeColor="muted">
              Se va adăuga
            </ThemedText>
            <ThemedText type="subtitle">{grade !== null && letter ? classTitle(grade, letter) : 'Alege clasa și litera'}</ThemedText>
            {duplicate ? <ThemedText themeColor="dangerText">Clasa aceasta este deja în listă.</ThemedText> : null}
          </View>
          {error ? <ThemedText themeColor="dangerText">{error}</ThemedText> : null}
          <Button disabled={grade === null || !letter || duplicate} loading={busy} onPress={() => grade !== null && letter && onAdd(grade, letter)}>
            Adaugă clasa
          </Button>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.three, borderBottomWidth: 1 },
  close: { minHeight: 44, justifyContent: 'center' },
  body: { padding: Spacing.three, gap: Spacing.three },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minWidth: 48, minHeight: 48, borderWidth: 1.5, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  preview: { borderRadius: 18, padding: 16, gap: 4 },
});
