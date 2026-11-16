// Pagina unei clase: personalizări, carduri pentru documente și observații, ștergerea clasei; „Generează cu Profi” pornește
// o conversație nouă în proiectul clasei, cu o ciornă editabilă care folosește personalizările clasei.
import { useFocusEffect, useIsFocused, useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, ReduceMotion, ZoomIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { ClassNotes } from '@/components/classes/class-notes';
import { ClassSettingsForm } from '@/components/classes/class-settings';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRightIcon, CloseIcon, SlidersIcon, TrashIcon } from '@/components/ui/icons';
import { Screen } from '@/components/ui/screen';
import { brand, radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  api,
  ApiError,
  CLASS_CARD_ICONS,
  CLASS_CARDS,
  CLASS_SECTIONS,
  CLASSROOM_APP_RETURN,
  CLASSROOM_CODE_PARAM,
  CLASSROOM_ERROR_PARAM,
  CLASSROOM_FILES_PARAM,
  CLASSROOM_STATE_PARAM,
  classSettingsWithSubject,
  type ChatDocument,
  type ClassCard,
  type ClassCardId,
  type ClassDetail,
  type ClassJournal,
  type ClassSection,
  type DriveImportResult,
} from '@/lib/api';
import { type DocumentType } from '@/lib/chat-options';
import { openPortfolioFile } from '@/lib/portfolio-open';
import { log } from '@/lib/log';
import { LIBRARY_TYPES, pickDocument, uploadForm } from '@/lib/upload';
import { CLASS_SECTION_COLORS } from '../../../../web/shared/class-catalog';
import { busyStatus, statusLabel } from '../../../../web/shared/document-status';

export default function ClassScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width, height, fontScale } = useWindowDimensions();
  const panelHeight = Math.min(520, Math.max(340, Math.round(height * 0.56)));
  const focused = useIsFocused();
  const { id, settings: openSettings } = useLocalSearchParams<{ id: string; settings?: string }>();
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ subject: string; subjects: string[] } | null>(null);
  const profileSubject = profile?.subject ?? null;
  const [expanded, setExpanded] = useState<ClassCardId | null>(null);
  const [uploading, setUploading] = useState<ClassSection | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);
  const [fileError, setFileError] = useState<{ section: ClassSection; message: string } | null>(null);
  const fileOperation = useRef(false);
  const [editing, setEditing] = useState(openSettings === '1');
  const [removing, setRemoving] = useState(false);
  // P-244: fișiere din Google Drive într-o secțiune; rezultatul rămâne afișat în cardul secțiunii.
  const [bringing, setBringing] = useState<string | null>(null);
  const [drive, setDrive] = useState<{ section: string; error?: string; results?: DriveImportResult[] } | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setDetail(await api.classes.get(id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Clasa nu poate fi încărcată acum. Verifică internetul.');
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void reload();
      void api.account.get().then(({ user, subjects }) => {
        if (active) setProfile({ subject: user?.teaching?.subject ?? '', subjects: subjects ?? [] });
      }).catch(() => {
        if (active) setProfile({ subject: '', subjects: [] });
      });
      return () => { active = false; };
    }, [reload]),
  );

  const documentsPending = !!detail && Object.values(detail.documents).some((docs) => docs.some((doc) => busyStatus(doc.status)));
  useEffect(() => {
    if (!focused || !documentsPending) return;
    const timer = setInterval(() => { void reload(); }, 4000);
    return () => clearInterval(timer);
  }, [documentsPending, focused, reload]);

  const fileBusy = !!(uploading || bringing || deletingDocument);
  const settings = detail && classSettingsWithSubject(detail.journal.settings, profileSubject ?? '');
  const selected = CLASS_CARDS.find((card) => card.id === expanded);
  const wide = width >= 760;
  const threeAcross = width >= 360 && fontScale <= 1.2;

  useFocusEffect(useCallback(() => {
    if (!expanded) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      setExpanded(null);
      return true;
    });
    return () => listener.remove();
  }, [expanded]));

  function goBack() {
    if (expanded) setExpanded(null);
    else if (router.canGoBack()) router.back();
    else router.replace('/clase');
  }

  async function upload(section: ClassSection) {
    if (!detail || fileOperation.current) return;
    fileOperation.current = true;
    setUploading(section);
    setFileError(null);
    try {
      const picked = await pickDocument(LIBRARY_TYPES);
      if (!picked) return;
      if ('error' in picked) {
        setFileError({ section, message: picked.error });
        return;
      }
      await api.documents.upload(uploadForm(picked.file, { scope: 'class', classId: detail.class.id, section }));
      await reload();
    } catch (e) {
      setFileError({ section, message: e instanceof ApiError ? e.message : 'Fișierul nu a putut fi încărcat. Reîncearcă.' });
      await reload();
    } finally {
      fileOperation.current = false;
      setUploading(null);
    }
  }

  async function removeDocument(id: string, section: ClassSection) {
    if (fileOperation.current) return;
    fileOperation.current = true;
    setDeletingDocument(id);
    setFileError(null);
    try {
      await api.documents.remove(id);
      await reload();
    } catch (e) {
      setFileError({ section, message: e instanceof ApiError ? e.message : 'Fișierul nu a putut fi șters. Reîncearcă.' });
    } finally {
      fileOperation.current = false;
      setDeletingDocument(null);
    }
  }

  function confirmRemoveDocument(doc: ChatDocument, section: ClassSection) {
    Alert.alert('Ștergi fișierul?', `„${doc.name}” va fi eliminat din secțiunea acestei clase.`, [
      { text: 'Renunță', style: 'cancel' },
      { text: 'Șterge', style: 'destructive', onPress: () => void removeDocument(doc.id, section) },
    ]);
  }

  function generate(type: DocumentType) {
    if (!detail || !settings || profileSubject === null) return;
    router.navigate({pathname:'/asistent', params:{classId: detail.class.id, type}});
  }

  /**
   * P-244: profesorul alege fișierele în selectorul Google, deschis în browserul sistemului; aplicația primește doar
   * codul de o singură folosire și identificatorii fișierelor alese, iar serverul ProfPlus le aduce în secțiune.
   */
  async function bringFromDrive(section: ClassSection) {
    if (!detail || fileOperation.current) return;
    fileOperation.current = true;
    setBringing(section);
    setDrive(null);
    try {
      const { url } = await api.classes.classroomFilesStart(true);
      const state = new URL(url).searchParams.get('state');
      const result = await WebBrowser.openAuthSessionAsync(url, CLASSROOM_APP_RETURN);
      if (result.type !== 'success') {
        setDrive({ section, error: 'Alegerea fișierelor nu s-a încheiat. Nu s-a adus nimic.' });
        return;
      }
      const back = new URL(result.url).searchParams;
      const code = back.get(CLASSROOM_CODE_PARAM);
      const files = (back.get(CLASSROOM_FILES_PARAM) ?? '').split(',').filter(Boolean);
      // Numai răspunsul la cererea pornită acum de aplicație.
      if (!code || !state || back.get(CLASSROOM_STATE_PARAM) !== state || !files.length) {
        const reason = back.get(CLASSROOM_ERROR_PARAM);
        setDrive({
          section,
          error:
            reason === 'denied'
              ? 'Nu ai acordat accesul la fișiere; nu s-a adus nimic.'
              : reason === 'nofiles'
                ? 'Nu ai ales niciun fișier; nu s-a adus nimic.'
                : 'Alegerea fișierelor nu s-a încheiat. Încearcă din nou.',
        });
        return;
      }
      const { results } = await api.classes.classroomFilesImport({ code, state, files, classId: detail.class.id, section });
      setDrive({ section, results });
      await reload();
    } catch (e) {
      log('error', 'class_drive_import_failed', { status: e instanceof ApiError ? e.status : undefined }, e);
      setDrive({ section, error: e instanceof ApiError ? e.message : 'Fișierele nu au putut fi aduse. Verifică internetul și reîncearcă.' });
    } finally {
      fileOperation.current = false;
      setBringing(null);
    }
  }

  // Revizia împiedică suprascrierea unei modificări făcute pe alt dispozitiv.
  async function saveJournal(journal: ClassJournal) {
    if (!detail) return false;
    setError(null);
    try {
      const { revision } = await api.classes.saveJournal(detail.class.id, journal, detail.revision);
      setDetail((current) => current?.class.id === detail.class.id ? { ...current, journal, revision } : current);
      return true;
    } catch (e) {
      log('error', 'class_journal_save_failed', { status: e instanceof ApiError ? e.status : undefined }, e);
      setError(e instanceof ApiError ? e.message : 'Salvarea nu a mers. Verifică internetul și reîncearcă.');
      return false;
    }
  }

  function confirmRemove() {
    if (!detail) return;
    Alert.alert(
      `Ștergi ${detail.class.name}?`,
      'Se șterg documentele încărcate în această clasă, observațiile și setările ei. Conversațiile rămân în istoric. Ștergerea nu poate fi anulată.',
      [
        { text: 'Renunță', style: 'cancel' },
        { text: 'Șterge clasa', style: 'destructive', onPress: () => void remove() },
      ],
    );
  }

  async function remove() {
    if (!detail) return;
    setRemoving(true);
    setError(null);
    try {
      await api.classes.remove(detail.class.id);
      router.back();
    } catch (e) {
      log('error', 'class_remove_failed', { status: e instanceof ApiError ? e.status : undefined }, e);
      setError(e instanceof ApiError ? e.message : 'Clasa nu a putut fi ștearsă. Reîncearcă.');
      setRemoving(false);
    }
  }

  const documentSection = selected && "documentType" in selected ? selected : null;
  const docs = documentSection ? detail?.documents[documentSection.id] ?? [] : [];
  const sectionDocuments = documentSection && detail ? <>
      <View style={styles.actions}>
        <Button disabled={profileSubject === null} onPress={() => generate(documentSection.documentType)}>
          Generează cu Profi
        </Button>
        <Button
          variant="secondary"
          loading={uploading === documentSection.id}
          disabled={fileBusy || docs.length >= 10}
          onPress={() => upload(documentSection.id)}>
          Încarcă
        </Button>
        {detail.classroomImport ? (
          <Button
            variant="ghost"
            loading={bringing === documentSection.id}
            disabled={fileBusy || docs.length >= 10}
            onPress={() => bringFromDrive(documentSection.id)}
            accessibilityHint="Alegi fișierele în Google, iar ProfPlus primește acces numai la cele alese">
            Din Google Drive
          </Button>
        ) : null}
      </View>
      <ThemedText type="small" themeColor="muted">
        Profi poate folosi fișierele în conversațiile clasei. Evită documentele cu date personale ale elevilor.
      </ThemedText>
      {fileError?.section === documentSection.id ? (
        <ThemedText accessibilityRole="alert" themeColor="dangerText">{fileError.message}</ThemedText>
      ) : null}
      {docs.length ? (
        docs.map((d) => (
          <View key={d.id} style={[styles.document, { borderColor: theme.border }]}>
            <View style={styles.sectionLabel}>
              <Pressable accessibilityRole="button" accessibilityLabel={'Deschide ' + d.name}
                onPress={() => {
                  setFileError(null);
                  void openPortfolioFile(d).catch((e) => setFileError({
                    section: documentSection.id,
                    message: e instanceof Error ? e.message : 'Fișierul nu a putut fi deschis.',
                  }));
                }}>
                <ThemedText type="smallBold" themeColor="accentText">{d.name}</ThemedText>
              </Pressable>
              <ThemedText type="small" themeColor={d.status === 'failed' ? 'dangerText' : 'muted'}>
                {deletingDocument === d.id ? 'Se șterge…' : statusLabel(d.status)}
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={'Șterge ' + d.name}
              disabled={fileBusy || busyStatus(d.status)}
              onPress={() => confirmRemoveDocument(d, documentSection.id)}
              style={({ pressed }) => [styles.removeDocument, pressed && { backgroundColor: theme.fill }]}>
              <TrashIcon color={theme.dangerText} />
            </Pressable>
          </View>
        ))
      ) : (
        <ThemedText type="small" themeColor="subtle">
          Niciun document încărcat în această secțiune.
        </ThemedText>
      )}
      {drive?.section === documentSection.id && drive.error ? <ThemedText themeColor="dangerText">{drive.error}</ThemedText> : null}
      {drive?.section === documentSection.id && drive.results
        ? drive.results.map((r, i) => (
            <ThemedText key={i} type="small" themeColor={r.ok ? 'muted' : 'dangerText'}>
              {r.name}: {r.message}
            </ThemedText>
          ))
        : null}
    </> : null;

  return (
    <Screen back onBack={goBack} maxContentWidth={1440} title={detail?.class.name ?? 'Clasa'} loading={!detail && !error}
      titleAction={detail ? (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Personalizări"
            accessibilityState={{ disabled: profileSubject === null }}
            disabled={profileSubject === null}
            onPress={() => setEditing(true)}
            style={({ pressed }) => [styles.iconButton, { backgroundColor: pressed ? theme.fillStrong : theme.fill }]}>
            <SlidersIcon size={24} color={theme.text} />
          </Pressable>
      ) : null}>
      {error ? (
        <Card>
          <ThemedText themeColor="dangerText">{error}</ThemedText>
          <Button variant="secondary" onPress={reload}>
            Încearcă din nou
          </Button>
        </Card>
      ) : null}

      {detail ? (
        <>
          {editing && settings && profileSubject !== null ? (
            <Modal transparent visible onRequestClose={() => setEditing(false)}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
                <View accessibilityViewIsModal style={[styles.modal, { backgroundColor: theme.surface, borderColor: theme.borderStrong }]}>
                  <View style={[styles.modalHeader, { borderColor: theme.border }]}>
                    <ThemedText type="subtitle" accessibilityRole="header">Personalizări</ThemedText>
                    <Pressable accessibilityRole="button" accessibilityLabel="Închide personalizările"
                      style={styles.iconButton} onPress={() => setEditing(false)}>
                      <CloseIcon size={22} color={theme.text} />
                    </Pressable>
                  </View>
                  <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalContent}>
                    {error ? <ThemedText accessibilityRole="alert" themeColor="dangerText">{error}</ThemedText> : null}
                    <ClassSettingsForm
                      value={detail.journal.settings}
                      bannerColor={detail.journal.bannerColor ?? null}
                      grade={detail.class.g}
                      letter={detail.class.l}
                      profileSubject={profileSubject ?? ''}
                      subjects={profile?.subjects ?? []}
                      onCancel={() => setEditing(false)}
                      onSave={async (settings, bannerColor) => {
                        const saved = await saveJournal({ ...detail.journal, settings, bannerColor });
                        if (saved) setEditing(false);
                        return saved;
                      }}
                    />
                    <Button variant="secondary" onPress={() => {
                      setEditing(false);
                      setExpanded('observatii');
                    }}>Observații</Button>
                    {detail.journal.classroom ? (
                      <Card title="Din Google Classroom">
                        <ThemedText type="small" themeColor="muted">
                          Cursul „{detail.journal.classroom.name}”, importat la {detail.journal.classroom.importedAt.split('-').reverse().join('.')}. Profi folosește
                          capitolele și temele recente ca să știe ce s-a lucrat la clasă.
                        </ThemedText>
                        {(
                          [
                            ['Capitole', detail.journal.classroom.topics],
                            ['Materiale postate', detail.journal.classroom.materials],
                            ['Teme date', detail.journal.classroom.assignments],
                          ] as const
                        )
                          .filter(([, items]) => items.length)
                          .map(([label, items]) => (
                            <ThemedText key={label}>
                              <ThemedText type="smallBold">
                                {label} ({items.length}):{' '}
                              </ThemedText>
                              {items.slice(0, 12).join('; ')}
                              {items.length > 12 ? ` și încă ${items.length - 12}` : ''}
                            </ThemedText>
                          ))}
                        <Button variant="danger" onPress={() => void saveJournal({ ...detail.journal, classroom: undefined })}>
                          Elimină datele importate
                        </Button>
                      </Card>
                    ) : null}
                  </ScrollView>
                </View>
              </KeyboardAvoidingView>
            </Modal>
          ) : null}

          <View style={selected && wide ? styles.workspaceWide : styles.workspace}>
            {selected ? (
              <ScrollView horizontal={!wide} nestedScrollEnabled
                style={wide ? [styles.sidebar, { maxHeight: panelHeight }] : styles.phoneSelector}
                contentContainerStyle={wide ? styles.sidebarButtons : styles.phoneButtons}>
                {CLASS_SECTIONS.filter((card) => card.id !== selected.id).map((card) => (
                  <SectionButton key={card.id} card={card} compact
                    style={!wide ? styles.phoneButton : undefined} onPress={() => setExpanded(card.id)} />
                ))}
              </ScrollView>
            ) : (
              <Animated.View entering={gridEntrance} style={styles.cardGrid}>
                {CLASS_SECTIONS.map((card) => (
                  <SectionButton key={card.id} card={card} compact={false}
                    style={threeAcross ? styles.gridCardThird : styles.gridCardHalf} onPress={() => setExpanded(card.id)} />
                ))}
              </Animated.View>
            )}
            {selected ? (
              <Animated.View key={selected.id} entering={panelEntrance} exiting={panelExit}
                style={[styles.section, wide && styles.activePanelWide, { height: panelHeight, backgroundColor: theme.surface, borderColor: theme.softBorder }]}>
                <View style={[styles.panelHeader, {backgroundColor: CLASS_SECTION_COLORS[selected.id]}]}>
                  <View style={styles.sectionLabel}>
                    <ThemedText type="subtitle" accessibilityRole="header" style={styles.onColor}>{selected.title}</ThemedText>
                    <ThemedText type="small" style={styles.onColor}>{selected.desc}</ThemedText>
                  </View>

                </View>
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled"
                  style={[styles.panelScroll, { borderColor: theme.border }]} contentContainerStyle={styles.sectionBody}>
                  {"documentType" in selected ? sectionDocuments
                    : <ClassNotes notes={detail.journal.notes} onSave={(notes) => saveJournal({ ...detail.journal, notes })} />}
                </ScrollView>
              </Animated.View>
            ) : null}
          </View>

          <Button variant="danger" loading={removing} onPress={confirmRemove}>
            Șterge clasa
          </Button>
        </>
      ) : null}
    </Screen>
  );
}

const panelEntrance = ZoomIn
  .duration(220)
  .easing(Easing.bezier(0.23, 1, 0.32, 1))
  .withInitialValues({ transform: [{ scale: 0.94 }] })
  .reduceMotion(ReduceMotion.System);

const gridEntrance = FadeIn.duration(140).reduceMotion(ReduceMotion.System);
const panelExit = FadeOut.duration(120).reduceMotion(ReduceMotion.System);

function SectionButton({ card, compact, style, onPress }: {
  card: ClassCard; compact: boolean; style?: ViewStyle; onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={compact ? card.title : `${card.title}. ${card.desc}`}
      onPress={onPress}
      style={({ pressed }) => [styles.section, styles.sectionHeader, compact ? styles.compact : styles.largeCard, style,
        { backgroundColor: CLASS_SECTION_COLORS[card.id], borderColor: "transparent", opacity: pressed ? 0.88 : 1 }]}>
      {!compact ? (
        <Svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={brand.onAccent}
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" accessible={false}>
          <Path d={CLASS_CARD_ICONS[card.id]} />
        </Svg>
      ) : null}
      {compact ? (
        <ThemedText type="smallBold" style={[styles.sectionLabel, styles.onColor]}>{card.title}</ThemedText>
      ) : (
        <View style={styles.cardCopy}>
          <ThemedText type="smallBold" style={[styles.cardText, styles.onColor]}>{card.title.split(' · ')[0]}</ThemedText>
        </View>
      )}
      {compact ? <ChevronRightIcon size={16} color={brand.onAccent} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, padding: Spacing.three, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(18,21,19,0.55)' },
  modal: { width: '100%', maxWidth: 520, maxHeight: '90%', borderRadius: radius.sm, borderWidth: 1 },
  modalHeader: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  modalScroll: { flexGrow: 0 },
  modalContent: { padding: Spacing.three, gap: Spacing.three },
  workspace: { gap: Spacing.two },
  workspaceWide: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: Spacing.three },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  gridCardHalf: {width: '48%'},
  gridCardThird: {width: '31%'},
  sidebar: { width: 230, flexGrow: 0 },
  sidebarButtons: { gap: Spacing.two },
  phoneSelector: { flexGrow: 0 },
  phoneButtons: { gap: Spacing.two },
  phoneButton: { width: 160 },
  activePanelWide: { flex: 1, minWidth: 0 },
  section: { borderWidth: 1, borderRadius: radius.sm },
  largeCard: {minHeight: 116, padding: Spacing.two, flexDirection: 'column', justifyContent: 'center', gap: Spacing.two},
  cardCopy: { width: '100%', gap: Spacing.one },
  cardText: { textAlign: 'center' },
  compact: { minHeight: 52, paddingVertical: Spacing.two },
  iconButton: { width: 48, height: 48, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  sectionHeader: { minHeight: 56, padding: Spacing.three, gap: Spacing.two, flexDirection: 'row', alignItems: 'center' },
  sectionLabel: { flex: 1, gap: Spacing.half },
  onColor: {color: brand.onAccent},
  panelHeader: { borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm, minHeight: 116, padding: Spacing.three, gap: Spacing.two, flexDirection: 'row', alignItems: 'flex-start' },
  panelScroll: { flex: 1, borderTopWidth: 1 },
  sectionBody: { padding: Spacing.three, gap: Spacing.two },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  document: { borderTopWidth: 1, paddingVertical: Spacing.two, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  removeDocument: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
