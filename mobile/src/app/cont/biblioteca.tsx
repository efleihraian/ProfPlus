import {ACCOUNT_DOCUMENT_LIMIT} from "../../../../web/shared/document-limits";
// Cont → Bibliotecă personală (P-195), ca pe site: documentele folosite des, consultate automat de Profi în toate conversațiile.
// Aceleași rute ca site-ul: GET /api/library/personal, încărcare prin /api/documents cu scope=library, ștergere prin /api/documents/[id].
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Choice } from '@/components/account/choice';
import { Notice } from '@/components/account/notice';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileTextIcon, TrashIcon } from '@/components/ui/icons';
import { Screen } from '@/components/ui/screen';
import { cardSurface, radius, Spacing } from '@/constants/theme';
import { useDark, useTheme } from '@/hooks/use-theme';
import { api, ApiError, type ChatDocument } from '@/lib/api';
import { useAuth, type Outcome } from '@/lib/auth';
import { log } from '@/lib/log';
import { LIBRARY_TYPES, pickDocument, uploadForm } from '@/lib/upload';
import { busyStatus, statusLabel } from '../../../../web/shared/document-status';
import {
  SHARING_CONSENT_POINTS,
  SHARING_CONSENT_TITLE,
  canShare,
  canWithdraw,
  sharingLabel,
  type DocumentSharing,
} from '../../../../web/shared/library-sharing';

const failure = (e: unknown, fallback: string) => (e instanceof ApiError ? e.message : fallback);

export default function PersonalLibraryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const dark = useDark();
  const { session } = useAuth();
  const [documents, setDocuments] = useState<ChatDocument[] | null>(null);
  const [limit, setLimit] = useState(30);
  const [uploading, setUploading] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  // P-210: partajarea cu toți profesorii, cu acord explicit și verificare de administrator (ca pe site).
  const [sharing, setSharing] = useState<Record<string, DocumentSharing>>({});
  const [sharingAvailable, setSharingAvailable] = useState(false);
  const [consent, setConsent] = useState<ChatDocument | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [sharingBusy, setSharingBusy] = useState<string | null>(null);

  useEffect(() => {
    if (session === null) router.back();
  }, [session, router]);

  const refresh = useCallback(async () => {
    const data = await api.library.personal();
    setDocuments(data.documents);
    setLimit(data.limit);
    setSharing(data.sharing ?? {});
    setSharingAvailable(!!data.sharingAvailable);
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

  async function share() {
    if (!consent || !agreed) return;
    const document = consent;
    setSharingBusy(document.id);
    setOutcome(null);
    try {
      const saved = await api.library.share(document.id);
      setSharing((previous) => ({ ...previous, [document.id]: saved.sharing }));
      setOutcome({ message: `„${document.name}” a fost trimis la verificare. După aprobare, Profi îl poate folosi pentru toți profesorii.` });
    } catch (e) {
      setOutcome({ error: failure(e, 'Partajarea a eșuat.') });
    } finally {
      setConsent(null);
      setSharingBusy(null);
    }
  }

  async function withdraw(document: ChatDocument) {
    setSharingBusy(document.id);
    setOutcome(null);
    try {
      await api.library.withdraw(document.id);
      setSharing((previous) => {
        const next = { ...previous };
        delete next[document.id];
        return next;
      });
      setOutcome({ message: `Ai retras acordul pentru „${document.name}”. Materialul rămâne doar în biblioteca ta.` });
    } catch (e) {
      setOutcome({ error: failure(e, 'Retragerea a eșuat.') });
    } finally {
      setSharingBusy(null);
    }
  }

  const full = (documents?.length ?? 0) >= limit;
  return (
    <Screen
      title="Bibliotecă personală"
      intro="Documentele pe care le folosești des: planificări, modele de teste, fișe sau materiale proprii. Profi le consultă automat în toate conversațiile. Rămân private, legate de contul tău."
      back
      loading={documents === null && !outcome}>
      <Card>
        <Button onPress={add} loading={!!uploading} disabled={documents === null || full}>
          {uploading ? 'Se încarcă…' : 'Adaugă un document'}
        </Button>
        {/* P-288: regulile bibliotecii stau la butonul „i” de lângă contor, ca pe site. */}
        <View style={styles.countRow}>
          <ThemedText type="small" themeColor="muted" accessibilityLiveRegion="polite" style={styles.flex}>
            {documents === null ? 'Se verifică…' : `${documents.length} din ${limit} documente în biblioteca personală`}
          </ThemedText>
          <Pressable accessibilityRole="button" accessibilityLabel="Reguli pentru biblioteca personală" accessibilityState={{ expanded: rulesOpen }}
            onPress={() => setRulesOpen((open) => !open)} hitSlop={8}
            style={({ pressed }) => [styles.info, { borderColor: rulesOpen ? theme.borderStrong : theme.border, backgroundColor: pressed ? theme.fillStrong : theme.surface }]}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={rulesOpen ? theme.text : theme.muted} strokeWidth={2.2} strokeLinecap="round">
              <Path d="M12 11v6" />
              <Path d="M12 7.5v.01" />
            </Svg>
          </Pressable>
        </View>
        {rulesOpen ? (
          <View style={[styles.rules, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ThemedText type="small" themeColor="muted">
              În biblioteca personală poți păstra maximum {limit} de documente. Acestea sunt incluse în limita totală de {ACCOUNT_DOCUMENT_LIMIT} de fișiere încărcate pe cont (bibliotecă, conversații, clase și portofoliu).
            </ThemedText>
            <ThemedText type="small" themeColor="muted">
              PDF, DOC, DOCX, PPTX, TXT, MD sau HTML, cel mult 10 MB fiecare. O culegere mai mare de 10 MB se poate adăuga pe capitole. Nu încărca date personale ale elevilor (nume, note,
              situații). Pentru căutare, documentele sunt indexate la furnizorul AI folosit de ProfPlus; ștergerea aici elimină originalul și indexul.
              {sharingAvailable ? ' Un material partajat și verificat de un administrator poate fi folosit de Profi pentru toți profesorii; poți retrage acordul oricând.' : ''}
            </ThemedText>
          </View>
        ) : null}
        {uploading ? <ThemedText type="small">{uploading}</ThemedText> : null}
        <Notice outcome={outcome} />
      </Card>
      {consent ? (
        <Card>
          <ThemedText type="smallBold">{SHARING_CONSENT_TITLE}</ThemedText>
          <ThemedText type="small" numberOfLines={2}>
            {consent.name}
          </ThemedText>
          {SHARING_CONSENT_POINTS.map((point) => (
            <ThemedText key={point} type="small" themeColor="muted">
              • {point}
            </ThemedText>
          ))}
          <Choice kind="checkbox" selected={agreed} onPress={() => setAgreed((v) => !v)} label="Confirm cele de mai sus și sunt de acord cu partajarea acestui material." />
          <Button onPress={share} loading={sharingBusy === consent.id} disabled={!agreed}>
            Trimite la verificare
          </Button>
          <Button variant="ghost" onPress={() => setConsent(null)} disabled={!!sharingBusy}>
            Anulează
          </Button>
        </Card>
      ) : null}
      {documents?.length === 0 ? <ThemedText themeColor="muted">Biblioteca ta personală este goală.</ThemedText> : null}
      {documents?.length ? (
        <View style={styles.list}>
          {documents.map((document) => {
            const asking = confirm === document.id;
            return (
              <View key={document.id} style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }, cardSurface(dark)]}>
                <FileTextIcon color={theme.muted} />
                <View style={styles.name}>
                  <ThemedText numberOfLines={2}>{document.name}</ThemedText>
                  <ThemedText type="small" themeColor={document.status === 'ready' ? 'softText' : 'muted'}>
                    {statusLabel(document.status)} · {Math.max(1, Math.round(document.size / 1024))} KB
                  </ThemedText>
                  {sharing[document.id] ? (
                    <ThemedText type="small" themeColor={sharing[document.id].status === 'rejected' ? 'dangerText' : 'muted'}>
                      {sharingLabel(sharing[document.id])}
                    </ThemedText>
                  ) : null}
                  {sharingAvailable && canShare(document.status, sharing[document.id]) ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Partajează cu toți profesorii: ${document.name}`}
                      disabled={!!sharingBusy}
                      onPress={() => {
                        setOutcome(null);
                        setAgreed(false);
                        setConsent(document);
                      }}
                      style={styles.share}>
                      <ThemedText type="small" themeColor="accentText">
                        {sharing[document.id]?.status === 'rejected' ? 'Propune din nou' : 'Partajează cu toți profesorii'}
                      </ThemedText>
                    </Pressable>
                  ) : null}
                  {sharingAvailable && canWithdraw(sharing[document.id]) ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Retrage partajarea: ${document.name}`}
                      disabled={!!sharingBusy}
                      onPress={() => void withdraw(document)}
                      style={styles.share}>
                      <ThemedText type="small" themeColor="accentText">
                        {sharingBusy === document.id ? 'Se retrage…' : 'Retrage partajarea'}
                      </ThemedText>
                    </Pressable>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={asking ? `Confirmă ștergerea: ${document.name}` : `Șterge ${document.name}`}
                  disabled={busyStatus(document.status)}
                  onPress={() => void remove(document)}
                  style={({ pressed }) => [
                    styles.remove,
                    // P-288: butonul de ștergere e roșu mereu; la confirmare devine mai intens.
                    { borderColor: theme.dangerBorder, backgroundColor: asking || pressed ? theme.dangerSoft : 'transparent', borderWidth: asking ? 2 : 1 },
                  ]}>
                  <TrashIcon color={theme.dangerText} />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  item: { minHeight: 64, borderRadius: 20, padding: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  name: { flex: 1, gap: 2 },
  share: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  flex: { flex: 1 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  info: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rules: { gap: Spacing.two, borderWidth: 1, borderRadius: radius.sm, padding: Spacing.three },
  remove: { minWidth: 44, minHeight: 44, borderRadius: radius.pill, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
