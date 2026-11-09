// Cont → Bibliotecă personală (P-195), ca pe site: documentele folosite des, consultate automat de Profi în toate conversațiile.
// Aceleași rute ca site-ul: GET /api/library/personal, încărcare prin /api/documents cu scope=library, ștergere prin /api/documents/[id].
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Notice } from '@/components/account/notice';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileTextIcon, TrashIcon } from '@/components/ui/icons';
import { Screen } from '@/components/ui/screen';
import { radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api, ApiError, type ChatDocument } from '@/lib/api';
import { useAuth, type Outcome } from '@/lib/auth';
import { log } from '@/lib/log';
import { LIBRARY_TYPES, pickDocument, uploadForm } from '@/lib/upload';

const busyStatus = (status: string) => ['uploading', 'indexing', 'deleting'].includes(status);
const statusLabel = (status: string) =>
  status === 'ready' ? 'Gata · folosit de Profi' : status === 'indexing' ? 'Se pregătește…' : status === 'uploading' ? 'Se încarcă…' : status === 'deleting' ? 'Se șterge…' : 'Eroare · șterge și reîncarcă';
const failure = (e: unknown, fallback: string) => (e instanceof ApiError ? e.message : fallback);

export default function PersonalLibraryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { session } = useAuth();
  const [documents, setDocuments] = useState<ChatDocument[] | null>(null);
  const [limit, setLimit] = useState(10);
  const [uploading, setUploading] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    if (session === null) router.back();
  }, [session, router]);

  const refresh = useCallback(async () => {
    const data = await api.library.personal();
    setDocuments(data.documents);
    setLimit(data.limit);
    return data.documents;
  }, []);

  useEffect(() => {
    refresh().catch((e) => setOutcome({ error: failure(e, 'Biblioteca personală nu a putut fi încărcată.') }));
  }, [refresh]);

  // Cât timp un document se pregătește, lista se reîmprospătează la 4 secunde, ca pe site.
  useEffect(() => {
    if (!documents?.some((d) => busyStatus(d.status))) return;
    const timer = setInterval(() => void refresh().catch(() => undefined), 4000);
    return () => clearInterval(timer);
  }, [documents, refresh]);

  async function add() {
    setOutcome(null);
    setConfirm(null);
    if ((documents?.length ?? 0) >= limit) {
      setOutcome({ error: `Biblioteca personală poate avea cel mult ${limit} documente.` });
      return;
    }
    const picked = await pickDocument(LIBRARY_TYPES);
    if (!picked) return;
    if ('error' in picked) {
      setOutcome({ error: picked.error });
      return;
    }
    setUploading(picked.file.name);
    try {
      await api.documents.upload(uploadForm(picked.file, { scope: 'library' }));
      await refresh();
      setOutcome({ message: 'Documentul a fost adăugat. Profi îl poate folosi după ce se pregătește.' });
    } catch (e) {
      log('warn', 'library_upload_failed', { status: e instanceof ApiError ? e.status : 0 });
      setOutcome({ error: failure(e, 'Încărcarea a eșuat. Verifică internetul și încearcă din nou.') });
      void refresh().catch(() => undefined);
    } finally {
      setUploading(null);
    }
  }

  async function remove(document: ChatDocument) {
    if (confirm !== document.id) {
      setConfirm(document.id);
      return;
    }
    setConfirm(null);
    setOutcome(null);
    try {
      await api.documents.remove(document.id);
      setDocuments((previous) => (previous ?? []).filter((d) => d.id !== document.id));
    } catch (e) {
      setOutcome({ error: failure(e, 'Ștergerea a eșuat.') });
    }
  }

  const full = (documents?.length ?? 0) >= limit;
  return (
    <Screen
      title="Bibliotecă personală"
      intro="Documentele pe care le folosești des: planificări, modele de teste, fișe sau materiale proprii. Profi le consultă automat în toate conversațiile. Rămân private, legate de contul tău."
      back>
      <Card>
        <Button onPress={add} loading={!!uploading} disabled={documents === null || full}>
          {uploading ? 'Se încarcă…' : 'Adaugă un document'}
        </Button>
        <ThemedText type="small" themeColor="muted" accessibilityLiveRegion="polite">
          {documents === null ? 'Se verifică…' : `${documents.length} din ${limit} documente`}
        </ThemedText>
        {uploading ? <ThemedText type="small">{uploading}</ThemedText> : null}
        <Notice outcome={outcome} />
      </Card>
      {documents === null && !outcome ? <ActivityIndicator accessibilityLabel="Se încarcă biblioteca" /> : null}
      {documents?.length === 0 ? <ThemedText themeColor="muted">Biblioteca ta personală este goală.</ThemedText> : null}
      {documents?.length ? (
        <View style={styles.list}>
          {documents.map((document) => {
            const asking = confirm === document.id;
            return (
              <View key={document.id} style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <FileTextIcon color={theme.muted} />
                <View style={styles.name}>
                  <ThemedText numberOfLines={2}>{document.name}</ThemedText>
                  <ThemedText type="small" themeColor={document.status === 'ready' ? 'softText' : 'muted'}>
                    {statusLabel(document.status)} · {Math.max(1, Math.round(document.size / 1024))} KB
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={asking ? `Confirmă ștergerea: ${document.name}` : `Șterge ${document.name}`}
                  disabled={busyStatus(document.status)}
                  onPress={() => void remove(document)}
                  style={({ pressed }) => [
                    styles.remove,
                    { borderColor: asking ? theme.dangerBorder : theme.borderStrong, backgroundColor: asking ? theme.dangerSoft : pressed ? theme.hover : 'transparent' },
                  ]}>
                  <TrashIcon color={asking ? theme.dangerText : theme.text} />
                  {asking ? (
                    <ThemedText type="small" themeColor="dangerText">
                      Confirmă
                    </ThemedText>
                  ) : null}
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}
      <ThemedText type="small" themeColor="muted">
        PDF, DOC, DOCX, PPTX, TXT, MD sau HTML, cel mult 10 MB fiecare; maximum {limit} documente în bibliotecă. Nu încărca date personale ale elevilor (nume, note,
        situații). Pentru căutare, documentele sunt indexate la furnizorul AI folosit de ProfPlus; ștergerea aici elimină originalul și indexul.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  item: { minHeight: 60, borderWidth: 1, borderRadius: radius.md, padding: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  name: { flex: 1, gap: 2 },
  remove: { minWidth: 44, minHeight: 44, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
