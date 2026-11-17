import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useDark, useTheme } from '@/hooks/use-theme';
import { api, ApiError, type LibraryItem } from '@/lib/api';
import { MAX_EXTRA_SOURCES, searchable, toggleExtra, type ChatSelection } from '@/lib/chat-options';
import { log } from '@/lib/log';

const MAX_RESULTS = 40;
const usable = (item: LibraryItem) => item.status === 'ready' && !item.modelTypes?.length && !!item.title;
const PERSONAL_BORDER = { light: '#9B4D8F', dark: '#D493C9' } as const;
const personalFirst = (items: LibraryItem[]) => [...items].sort((a, b) => Number(!!b.personal) - Number(!!a.personal));

type Props = { visible: boolean; selection: ChatSelection; chatId: string | null; onChange: (selection: ChatSelection) => void; onClose: () => void };

export function SourcePicker({ visible, selection, chatId, onChange, onClose }: Props) {
  const theme = useTheme();
  const dark = useDark();
  const router = useRouter();
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible || items) return;
    let current = true;
    setError(null);
    api.library
      .list(chatId)
      .then((data) => {
        if (current) setItems(personalFirst(data.items.filter(usable)));
      })
      .catch((e) => {
        log('error', 'library_load_failed', { status: e instanceof ApiError ? e.status : undefined }, e);
        if (current) setError(e instanceof ApiError ? e.message : 'Biblioteca nu poate fi încărcată acum. Verifică internetul.');
      });
    return () => {
      current = false;
    };
  }, [visible, items, chatId]);

  const chosen = useMemo(() => new Set([...(selection.extraManualIds ?? []), ...(selection.extraDocumentIds ?? [])]), [selection]);
  const results = useMemo(() => {
    if (!items) return [];
    const words = searchable(query).split(/\s+/).filter(Boolean);
    if (!words.length) return items.filter((item) => chosen.has(item.id));
    return items
      .filter((item) => {
        const text = searchable([item.title, item.subject, item.schoolClass, item.publisher].filter(Boolean).join(' '));
        return words.every((word) => text.includes(word));
      })
      .slice(0, MAX_RESULTS);
  }, [items, query, chosen]);
  const full = chosen.size >= MAX_EXTRA_SOURCES;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderColor: theme.border }]}>
          <ThemedText type="subtitle" accessibilityRole="header" style={styles.flex}>
            Adaugă surse
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
            <ThemedText type="linkPrimary">Gata</ThemedText>
          </Pressable>
        </View>
        <View style={styles.search}>
          <ThemedText type="small" themeColor="muted">
            Profi alege singur sursele potrivite profilului tău. Aici adaugi altele, pentru conversația asta{chosen.size ? ` (${chosen.size} adăugate)` : ''}.
          </ThemedText>
          <TextInput
            accessibilityLabel="Caută în bibliotecă"
            placeholder="Caută titlu, disciplină, editură…"
            placeholderTextColor={theme.subtle}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.borderStrong }]}
          />
          <Button onPress={() => { onClose(); router.push('/cont/biblioteca'); }}>Biblioteca personală</Button>
        </View>
        {error ? (
          <View style={styles.search}>
            <ThemedText themeColor="dangerText">{error}</ThemedText>
            <Button variant="secondary" onPress={() => setItems(null)}>
              Încearcă din nou
            </Button>
          </View>
        ) : null}
        {!items && !error ? <ActivityIndicator style={styles.loading} accessibilityLabel="Se încarcă biblioteca" /> : null}
        {items ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.kind + item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <ThemedText themeColor="muted">{query.trim() ? 'Nicio sursă găsită.' : 'Scrie mai sus ca să cauți în bibliotecă.'}</ThemedText>
            }
            renderItem={({ item }) => {
              const selected = chosen.has(item.id);
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled: full && !selected }}
                  disabled={full && !selected}
                  onPress={() => onChange(toggleExtra(selection, item, !selected))}
                  style={[styles.item, { backgroundColor: selected ? theme.soft : theme.fill, borderColor: item.personal ? PERSONAL_BORDER[dark ? 'dark' : 'light'] : selected ? theme.accent : 'transparent' }]}>
                  <View style={styles.flex}>
                    <ThemedText numberOfLines={2} accessibilityLabel={item.personal ? `Din biblioteca personală: ${item.title}` : undefined}>{item.title}</ThemedText>
                    <ThemedText type="small" themeColor="muted" numberOfLines={1}>
                      {[item.schoolClass, item.subject === '*' ? '' : item.subject, item.publisher].filter(Boolean).join(' · ')}
                    </ThemedText>
                  </View>
                  {selected ? <ThemedText themeColor="softText">✓</ThemedText> : null}
                </Pressable>
              );
            }}
          />
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, borderBottomWidth: 1, gap: Spacing.two },
  close: { minHeight: 44, justifyContent: 'center' },
  search: { padding: Spacing.three, gap: Spacing.two },
  input: { minHeight: 52, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, fontSize: 16 },
  loading: { marginTop: Spacing.four },
  list: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.four, gap: Spacing.two },
  item: { minHeight: 56, borderWidth: 1.5, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
