// Asistentul virtual: conversația cu Profi, salvată în același istoric ca pe site.
// Fluxul urmează site-ul: mesajul profesorului se salvează întâi (PUT /api/history), apoi serverul generează și salvează răspunsul.
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TeachingForm } from '@/components/account/teaching-form';
import { busyStatus, ChatDocuments } from '@/components/chat/chat-documents';
import { ChatOptions, optionsSummary } from '@/components/chat/chat-options';
import { GenerationProgress } from '@/components/chat/generation-progress';
import { MessageBubble } from '@/components/chat/message-bubble';
import { Profi } from '@/components/profi';
import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/components/ui/brand';
import { AboveTabBar } from '@/components/ui/above-tab-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUpIcon, CloseIcon, HistoryIcon, NewChatIcon, PlusIcon, SlidersIcon, StopIcon } from '@/components/ui/icons';
import { OptionSheet } from '@/components/ui/select';
import { brand, cardSurface, radius, Spacing } from '@/constants/theme';
import { useDark, useTheme } from '@/hooks/use-theme';
import type { GeneratedDocument } from '@/lib/api';
import { api, ApiError, funProfSuggestion, isPlanKind, suggestionsFor, type ChatDocument, type ChatMessage, type GenerationPlan, type HistoryChat, type ProgressStage } from '@/lib/api';
import { asSelection, AUTOMATIC, DIFFICULTIES, DOCUMENT_TYPES, type ChatSelection, type DocumentType } from '@/lib/chat-options';
import { MAX_CHAT_PHOTOS, photoMarker, pickChatPhotos, takeChatPhoto, withinTotal, type ChatImage } from '@/lib/chat-photo';
import { log } from '@/lib/log';
import { LIBRARY_TYPES, pickDocument, uploadForm } from '@/lib/upload';
import { useAccount } from '@/lib/use-account';

const isDocumentType = (value: unknown): value is DocumentType => DOCUMENT_TYPES.some((t) => t.id === value);

/** P-199: „+” din compozitor, ca pe site — fotografii doar pentru acest mesaj sau un document salvat în conversație. */
type AttachChoice = 'camera' | 'gallery' | 'document' | '';
const ATTACH_OPTIONS: { value: AttachChoice; label: string }[] = [
  { value: 'camera', label: 'Fotografiază (nu se păstrează)' },
  { value: 'gallery', label: 'Fotografii din galerie (nu se păstrează)' },
  { value: 'document', label: 'Adaugă document în conversație' },
];

const MAX_MESSAGE = 6000;
const NEW_TITLE = 'Conversație nouă';

const failure = (e: unknown, aborted: boolean) =>
  aborted ? 'Răspunsul a fost oprit. Poți reîncerca.' : e instanceof ApiError ? e.message : 'Conexiunea a eșuat. Verifică internetul și încearcă din nou.';

// P-214: account/navigation changes create fresh state; clearing consumed parameters keeps the current draft.
export default function AssistantScreen() {
  const accountState = useAccount();
  const router = useRouter();
  const { seed, chatId: openId, type, documentType, grade, difficulty } = useLocalSearchParams<{
    seed?: string; chatId?: string; type?: string; documentType?: string; grade?: string; difficulty?: string;
  }>();
  const requestedType = DOCUMENT_TYPES.find((option) => option.id === documentType)?.id;
  const requestedDifficulty = DIFFICULTIES.find((option) => option.id === difficulty)?.id;
  const requestedGrade = grade ? Number(grade) : NaN;
  const classOptions: Partial<ChatSelection> | undefined = openId && requestedType ? {
    documentType: requestedType,
    ...(Number.isInteger(requestedGrade) && requestedGrade >= 0 && requestedGrade <= 13 ? { grade: requestedGrade } : {}),
    ...(requestedDifficulty ? { difficulty: requestedDifficulty } : {}),
  } : undefined;
  const [launch, setLaunch] = useState({ seenSeed: seed, seenId: openId, seenType: type, type: isDocumentType(type) ? type : undefined, seed, openId, classOptions, version: 0 });
  if (launch.seenSeed !== seed || launch.seenId !== openId || launch.seenType !== type) {
    setLaunch({ ...launch, seenSeed: seed, seenId: openId, seenType: type, ...(seed || openId || type ? { seed, openId, type: isDocumentType(type) ? type : undefined, classOptions, version: launch.version + 1 } : {}) });
  }
  useEffect(() => {
    if (seed || openId || type) router.setParams({ type: '', seed: '', chatId: '', documentType: '', grade: '', difficulty: '' });
  }, [seed, openId, type, router]);
  const signedIn = Boolean(accountState.account?.user);
  const needsProfile = accountState.account?.provider === 'supabase' && !!accountState.account.user && (!accountState.account.user.teaching || accountState.account.user.deleting);
  const identity = accountState.userId === undefined ? 'loading' : accountState.userId ?? 'guest';
  return <AssistantConversation key={JSON.stringify([identity, signedIn, needsProfile, launch.version])} accountState={accountState} initialSeed={launch.seed} initialChatId={launch.openId} initialType={launch.type} initialClassOptions={launch.classOptions} />;
}

function AssistantConversation({ accountState, initialSeed, initialChatId, initialType, initialClassOptions }: {
  accountState: ReturnType<typeof useAccount>;
  initialSeed?: string;
  initialChatId?: string;
  initialType?: DocumentType;
  initialClassOptions?: Partial<ChatSelection>;
}) {
  const theme = useTheme();
  const dark = useDark();
  const { account, error: accountError, reload } = accountState;
  const signedIn = Boolean(account?.user);
  const needsProfile = account?.provider === 'supabase' && !!account.user && (!account.user.teaching || account.user.deleting);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [awaitingClassChat, setAwaitingClassChat] = useState(Boolean(initialClassOptions && initialChatId));
  const [title, setTitle] = useState(NEW_TITLE);
  const [draft, setDraft] = useState(initialSeed ?? '');
  // P-166: photos for the next message only; never saved in the history.
  const [photos, setPhotos] = useState<ChatImage[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chats, setChats] = useState<HistoryChat[] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  // P-199: pasul generării (raportat de server) și documentele conversației.
  const [stage, setStage] = useState<ProgressStage>('prepare');
  const [startedAt, setStartedAt] = useState(0);
  // P-220: textul răspunsului în curs de scriere (ciornă); răspunsul final îl înlocuiește.
  const [draftReply, setDraftReply] = useState('');
  const draftBuffer = useRef('');
  // P-227: felul cererii, anunțat de server (textul și durata obișnuită din bara de progres).
  const [plan, setPlan] = useState<GenerationPlan | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [documents, setDocuments] = useState<ChatDocument[]>([]);
  const [documentLoadError, setDocumentLoadError] = useState(false);
  const documentRead = useRef<{id: string; controller: AbortController; promise: Promise<void>} | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const [fresh, setFresh] = useState<number | null>(null);
  const revision = useRef(0);
  const savingDocument = useRef(false);
  const initialSelection: ChatSelection = initialType ? { ...AUTOMATIC, documentType: initialType } : AUTOMATIC;
  const selection = useRef<ChatSelection>(initialSelection);
  const [options, setOptions] = useState<ChatSelection>(initialSelection);
  const summary = optionsSummary(options);
  const projectId = useRef<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);
  const router = useRouter();
  const currentChatId = useRef<string | null>(null);
  // A manual navigation/new message supersedes the initial history request.
  const navigationVersion = useRef(0);

  const choose = useCallback((next: ChatSelection) => {
    selection.current = next;
    setOptions(next);
  }, []);

  const show = useCallback((chat: { id: string; title: string; messages: ChatMessage[]; revision: number; selection: unknown; project_id: string | null }) => {
    setFresh(null);
    if (chat.id !== currentChatId.current) {
      documentRead.current?.controller.abort();
      setDocuments([]);
      setDocumentLoadError(false);
    }
    currentChatId.current = chat.id;
    setChatId(chat.id);
    setTitle(chat.title);
    setMessages(chat.messages);
    revision.current = chat.revision;
    choose(asSelection(chat.selection));
    projectId.current = chat.project_id;
    setError(chat.messages.at(-1)?.role === 'user' ? 'Ultima cerere nu are un răspuns salvat. Poți reîncerca.' : null);
  }, [choose]);

  const startNew = useCallback(() => {
    navigationVersion.current++;
    currentChatId.current = null;
    setAwaitingClassChat(false);
    setFresh(null);
    setDraft('');
    setChatId(null);
    setTitle(NEW_TITLE);
    setMessages([]);
    setPhotos([]);
    documentRead.current?.controller.abort();
    setDocuments([]);
    setDocumentLoadError(false);
    setError(null);
    revision.current = 0;
    choose(AUTOMATIC);
    projectId.current = null;
    setHistoryOpen(false);
  }, [choose]);

  const entered=useRef(false),returnGuard=useRef({busy,uploading,error});
  useEffect(()=>{returnGuard.current={busy,uploading,error};},[busy,uploading,error]);
  useFocusEffect(useCallback(()=>{
    if(entered.current&&!returnGuard.current.busy&&!returnGuard.current.uploading&&!returnGuard.current.error)startNew();
    entered.current=true;
  },[startNew]));

  async function refreshHistory() {
    const data = await api.history.list();
    setChats(data.chats);
    return data.chats;
  }

  async function open(id: string) {
    const version = ++navigationVersion.current;
    setHistoryOpen(false);
    try {
      const { chat } = await api.history.get(id);
      if (version !== navigationVersion.current) return;
      if (awaitingClassChat) {
        setDraft('');
        setPhotos([]);
        setAwaitingClassChat(false);
      }
      show(chat);
    } catch (e) {
      if (version === navigationVersion.current) setError(failure(e, false));
    }
  }

  // Initial state comes from the component key/initialSeed, not synchronous state resets in effects.
  useEffect(() => {
    if (!signedIn || needsProfile) return;
    let active = true;
    const version = navigationVersion.current;
    const current = () => active && version === navigationVersion.current;
    const load = (id: string) => api.history.get(id).then(({ chat }) => {
      if (!current()) return;
      show(initialClassOptions ? { ...chat, selection: { ...asSelection(chat.selection), ...initialClassOptions } } : chat);
      setAwaitingClassChat(false);
    });
    const failed = (e: unknown) => { if (current()) setError(failure(e, false)); };
    void api.history.list().then(({ chats: list }) => {
      if (!current()) return;
      setChats(list);
      // P-231: history opens only through an explicit chatId, never the last chat automatically.
    }).catch(failed);
    if (initialChatId) void load(initialChatId).catch(failed);
    return () => { active = false; };
  }, [signedIn, needsProfile, initialSeed, initialChatId, initialClassOptions, show]);

  useEffect(() => () => { abort.current?.abort(); }, []);

  // P-199/P-214: only the active conversation can receive a document-list response.
  const refreshDocuments = useCallback(async (id: string) => {
    const pending = documentRead.current;
    if (pending?.id === id && !pending.controller.signal.aborted) return pending.promise;
    pending?.controller.abort();
    const controller = new AbortController();
    const promise = (async () => {
      try {
        const data = await api.documents.list(id, controller.signal);
        if (controller.signal.aborted || currentChatId.current !== id) return;
        setDocuments(data.documents);
        setDocumentLoadError(false);
      } catch {
        if (!controller.signal.aborted && currentChatId.current === id) setDocumentLoadError(true);
      } finally {
        if (documentRead.current?.controller === controller) documentRead.current = null;
      }
    })();
    documentRead.current = {id, controller, promise};
    return promise;
  }, []);
  useEffect(() => {
    if (!signedIn || !chatId) return;
    void refreshDocuments(chatId);
    return () => {
      const read = documentRead.current;
      if (read?.id === chatId) read.controller.abort();
    };
  }, [chatId, signedIn, refreshDocuments]);
  const documentsPending = documents.some((d) => busyStatus(d.status));
  useEffect(() => {
    if (!signedIn || !chatId || !documentsPending) return;
    const timer = setInterval(() => { void refreshDocuments(chatId); }, 5000);
    return () => clearInterval(timer);
  }, [chatId, signedIn, documentsPending, refreshDocuments]);

  /** Conversația pe server: există deja sau o creăm acum (la primul mesaj sau la primul document). */
  async function ensureChat() {
    if (chatId) return chatId;
    navigationVersion.current++;
    const id = (await api.history.create(projectId.current)).id;
    revision.current = (await api.history.get(id)).chat.revision;
    currentChatId.current = id;
    setChatId(id);
    return id;
  }

  async function addDocument() {
    const picked = await pickDocument(LIBRARY_TYPES);
    if (!picked) return;
    if ('error' in picked) {
      setError(picked.error);
      return;
    }
    setError(null);
    setUploading(picked.file.name);
    try {
      const id = await ensureChat();
      const { document } = await api.documents.upload(uploadForm(picked.file, { chatId: id }));
      // Cu sursele alese manual (pe site), documentul nou intră în listă, ca pe site; în modul automat îl ia serverul.
      if (selection.current.mode === 'manual') choose({ ...selection.current, documentIds: [...new Set([...selection.current.documentIds, document.id])] });
      documentRead.current?.controller.abort();
      void refreshDocuments(id);
    } catch (e) {
      log('warn', 'chat_document_upload_failed', { status: e instanceof ApiError ? e.status : 0 });
      setError(e instanceof ApiError ? e.message : 'Încărcarea a eșuat. Verifică internetul și încearcă din nou.');
    } finally {
      setUploading(null);
    }
  }

  async function removeDocument(id: string) {
    try {
      log('info', 'chat_document_removed');
      await api.documents.remove(id);
      documentRead.current?.controller.abort();
      setDocuments((current) => current.filter((d) => d.id !== id));
      if (currentChatId.current) void refreshDocuments(currentChatId.current);
      if (selection.current.mode === 'manual') choose({ ...selection.current, documentIds: selection.current.documentIds.filter((d) => d !== id) });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ștergerea a eșuat.');
    }
  }

  async function saveGeneratedDocument(index: number, original: GeneratedDocument, document: GeneratedDocument) {
    const id = currentChatId.current;
    if (!id || busy || savingDocument.current || messages[index]?.document !== original) throw new Error('Redeschide documentul înainte de a-l salva.');
    const next = messages.map((message,position)=>position===index?{...message,document,content:document.content}:message);
    const navigation = navigationVersion.current;
    savingDocument.current = true;
    try {
      const saved = await api.history.save({id,revision:revision.current,messages:next,selection:selection.current,projectId:projectId.current,title:title===NEW_TITLE?'':title});
      if (currentChatId.current===id && navigationVersion.current===navigation) {
        revision.current = saved.revision;
        setMessages(next);
      }
    } finally { savingDocument.current=false; }
  }

  async function deliver(next: ChatMessage[], alreadySaved: boolean) {
    if (savingDocument.current) return;
    navigationVersion.current++;
    setMessages(next);
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    abort.current = controller;
    // Pasul curent ajunge în jurnal dacă ceva eșuează: crearea, salvarea, generarea sau salvarea răspunsului.
    let stage = 'create';
    const started = Date.now();
    setStage('prepare');
    setStartedAt(started);
    setPlan(null);
    try {
      let id = chatId;
      if (signedIn) {
        id = await ensureChat();
        stage = 'save';
        if (!alreadySaved) {
          const saved = await api.history.save({
            id,
            revision: revision.current,
            messages: next,
            selection: selection.current,
            projectId: projectId.current,
            title: title === NEW_TITLE ? '' : title,
          });
          revision.current = saved.revision;
        }
      }
      stage = 'generate';
      const reply = await api.chat.sendWithProgress(
        {
          messages: next.slice(-20).map(({ role, content }) => ({ role, content: content.slice(0, MAX_MESSAGE) })),
          ...(signedIn && id ? { chatId: id, revision: revision.current, selection: selection.current } : {}),
          ...(photos.length ? { images: photos } : {}),
        },
        setStage,
        controller.signal,
        // P-220: ciorna se actualizează cel mult de câteva ori pe secundă.
        (text, reset) => {
          draftBuffer.current = reset ? '' : draftBuffer.current + text;
          if (!draftTimer.current)
            draftTimer.current = setTimeout(() => {
              draftTimer.current = null;
              setDraftReply(draftBuffer.current);
            }, 200);
        },
        (next) => {
          if (isPlanKind(next.kind)) setPlan({ kind: next.kind, grade: next.grade, web: next.web });
        },
      );
      if (!reply.reply?.trim()) throw new ApiError('Răspunsul nu a putut fi citit. Încearcă din nou.', 0);
      const completed: ChatMessage[] = [
        ...next,
        {
          role: 'assistant',
          content: reply.reply,
          sources: reply.sources,
          warnings: reply.warnings,
          document: reply.document,
          model: reply.model,
          ...(reply.followUps?.length ? { followUps: reply.followUps.slice(0, 4) } : {}),
        },
      ];
      // P-211: după primul răspuns Fun Prof (pornit din mesaj), modul rămâne ales în setările mesajului, ca pe site.
      const funChosen = !!reply.funProf && !selection.current.documentType;
      if (funChosen) choose({ ...selection.current, documentType: 'fun' });
      if (reply.document) setFresh(completed.length - 1);
      setMessages(completed);
      setPhotos([]);
      stage = 'save-reply';
      if (signedIn && id) {
        // Serverul salvează singur răspunsul când primește revision; altfel îl salvăm noi.
        if (typeof reply.revision === 'number') {
          revision.current = reply.revision;
          if (funChosen)
            revision.current = (
              await api.history.save({ id, revision: revision.current, messages: completed, selection: selection.current, projectId: projectId.current, title: '' })
            ).revision;
        } else
          revision.current = (
            await api.history.save({ id, revision: revision.current, messages: completed, selection: selection.current, projectId: projectId.current, title: '' })
          ).revision;
        refreshHistory().catch(() => {});
      }
    } catch (e) {
      const aborted = controller.signal.aborted;
      log(aborted ? 'info' : 'error', aborted ? 'chat_stopped' : 'chat_failed', { stage, signedIn, durationMs: Date.now() - started }, aborted ? undefined : e);
      setError(failure(e, aborted));
    } finally {
      abort.current = null;
      setBusy(false);
      if (draftTimer.current) clearTimeout(draftTimer.current);
      draftTimer.current = null;
      draftBuffer.current = '';
      setDraftReply('');
    }
  }

  function send(text = draft) {
    const written = text.trim() || (photos.length ? 'Explică sau rezolvă ce se vede în fotografie.' : '');
    if (!written || busy || awaitingClassChat) return;
    if (savingDocument.current) {
      setError('Așteaptă finalizarea salvării documentului.');
      return;
    }
    const content = photos.length ? `${written}\n\n${photoMarker(photos.length)}` : written;
    if (content.length > MAX_MESSAGE) {
      setError(`Scrie un mesaj de cel mult ${MAX_MESSAGE} de caractere.`);
      return;
    }
    setDraft('');
    void deliver([...messages, { role: 'user', content }], false);
  }

  // P-173: camera sau galerie, până la 15 fotografii pe mesaj. P-199: și documente salvate în conversație.
  function chooseAttachment(choice: AttachChoice) {
    if (choice !== 'document' && photos.length >= MAX_CHAT_PHOTOS) {
      setError(`Poți atașa cel mult ${MAX_CHAT_PHOTOS} fotografii la un mesaj.`);
      return;
    }
    // Pe iOS camera sau selectorul nu se pot deschide cât timp lista încă se închide.
    setTimeout(
      () => {
        if (choice === 'document') void addDocument();
        else if (choice === 'camera') void fromCamera();
        else if (choice === 'gallery') void fromGallery();
      },
      Platform.OS === 'ios' ? 450 : 0,
    );
  }
  function attach(added: ChatImage[], problem?: string) {
    const next = withinTotal(photos, added);
    setPhotos(next.photos);
    setError(next.error ?? problem ?? null);
  }
  async function fromCamera() {
    const result = await takeChatPhoto();
    if (!result) return;
    if ('error' in result) setError(result.error);
    else attach([result.photo]);
  }
  async function fromGallery() {
    const result = await pickChatPhotos(MAX_CHAT_PHOTOS - photos.length);
    if (result) attach(result.photos, result.error);
  }

  // Reluarea ultimei cereri: citește versiunea salvată, ca să nu dublăm mesajul sau să suprascriem altă fereastră.
  async function retry() {
    if (savingDocument.current) return;
    if (!signedIn || !chatId) {
      if (messages.at(-1)?.role === 'user') void deliver(messages, true);
      return;
    }
    try {
      const { chat } = await api.history.get(chatId);
      show(chat);
      if (chat.messages.at(-1)?.role === 'user') void deliver(chat.messages, true);
    } catch (e) {
      setError(failure(e, false));
    }
  }

  if (account === null && !accountError) {
    return (
      <Frame>
        <ActivityIndicator style={styles.center} accessibilityLabel="Se încarcă" />
      </Frame>
    );
  }
  if (accountError) {
    return (
      <Frame>
        <Card style={styles.margin}>
          <ThemedText themeColor="dangerText">{accountError}</ThemedText>
          <Button variant="secondary" onPress={reload}>
            Încearcă din nou
          </Button>
        </Card>
      </Frame>
    );
  }
  // Serverul primește cereri fără cont doar din paginile site-ului, deci în aplicație conversația cere logarea.
  if (!signedIn) {
    return (
      <Frame>
        <Card style={styles.margin}>
          <View style={styles.mascot}>
            <Profi width={120} />
          </View>
          <ThemedText type="subtitle">Intră în cont ca să vorbești cu Profi</ThemedText>
          <ThemedText themeColor="muted">Conversațiile, documentele și clasele tale sunt aceleași ca pe profplus.ro.</ThemedText>
          <Button onPress={() => router.navigate('/cont/intrare')}>Intră în cont</Button>
        </Card>
      </Frame>
    );
  }
  if (needsProfile && account) {
    return (
      <Frame>
        <ScrollView contentContainerStyle={styles.profile} keyboardShouldPersistTaps="handled">
          {account.user?.deleting ? (
            <Card title="Ștergerea contului este în curs">
              <ThemedText themeColor="muted">Conversațiile sunt blocate până se încheie ștergerea. O poți relua din fila Cont.</ThemedText>
              <Button onPress={() => router.navigate('/cont')}>Deschide Cont</Button>
            </Card>
          ) : (
            // P-195: profilul se completează aici, nu pe site.
            <Card title="Completează profilul didactic">
              <ThemedText themeColor="muted">Profi adaptează exemplele și sursele la profilul tău didactic.</ThemedText>
              <TeachingForm account={account} onSaved={reload} />
            </Card>
          )}
        </ScrollView>
      </Frame>
    );
  }

  const unanswered = !busy && messages.at(-1)?.role === 'user';
  return (
    <Frame
      actions={
        <View style={styles.actions}>
          {signedIn ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Istoricul conversațiilor"
              onPress={() => setHistoryOpen(true)}
              style={({ pressed }) => [styles.headerButton, { backgroundColor: pressed ? theme.fillStrong : theme.fill }]}>
              <HistoryIcon color={theme.text} />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Conversație nouă"
            disabled={busy}
            onPress={startNew}
            style={({ pressed }) => [styles.headerButton, { backgroundColor: pressed ? theme.fillStrong : theme.fill }, busy && styles.dim]}>
            <NewChatIcon color={theme.text} />
          </Pressable>
        </View>
      }>
      <AboveTabBar>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            ref={scroll}
            style={styles.flex}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
            {messages.length === 0 ? (
              <View style={styles.welcome}>
                <View style={styles.mascot}>
                  <Profi width={120} />
                </View>
                <ThemedText type="title" accessibilityRole="header">
                  Cu ce te pot ajuta?
                </ThemedText>
                <ThemedText themeColor="muted">
                  {account?.user?.teaching?.role === 'educator'
                    ? 'Fișe de desenat, jocuri și activități pentru grădiniță.'
                    : 'Lecții, teste, fișe și explicații, cu surse din manualele potrivite profilului tău.'}
                </ThemedText>
                {suggestionsFor(account?.user?.teaching).map((s) => (
                  <Pressable
                    key={s.label}
                    accessibilityRole="button"
                    onPress={() => setDraft(s.prompt)}
                    style={({ pressed }) => [styles.suggestion, { backgroundColor: theme.surface, borderColor: theme.border }, cardSurface(dark), pressed && styles.pressed]}>
                    <ThemedText>{s.prompt}</ThemedText>
                  </Pressable>
                ))}
                {(() => {
                  const fun = funProfSuggestion(account?.user?.teaching);
                  return (
                    <Pressable
                      key="fun-prof"
                      accessibilityRole="button"
                      accessibilityHint="Completează câmpul de mesaj cu un exemplu Fun Prof"
                      onPress={() => setDraft(fun.prompt)}
                      style={({ pressed }) => [styles.suggestion, { backgroundColor: theme.soft, borderColor: theme.border }, cardSurface(dark), pressed && styles.pressed]}>
                      <ThemedText>{fun.prompt}</ThemedText>
                    </Pressable>
                  );
                })()}
              </View>
            ) : (
              messages.map((m, i) => (
                <MessageBubble key={i} message={m} opened={i === fresh} onSaveDocument={signedIn && chatId && !busy && m.document ? (document)=>saveGeneratedDocument(i,m.document!,document) : undefined} onFollowUp={i === messages.length - 1 && !busy ? (text) => send(text) : undefined} />
              ))
            )}
            {busy && draftReply.trim() ? <MessageBubble message={{ role: 'assistant', content: draftReply }} /> : null}
            {busy ? <GenerationProgress stage={stage} startedAt={startedAt} plan={plan} /> : null}
            {error ? (
              <View
                accessibilityLiveRegion="polite"
                style={[styles.error, { backgroundColor: theme.dangerSoft }]}>
                <ThemedText themeColor="dangerText">{error}</ThemedText>
                {unanswered ? (
                  <Pressable accessibilityRole="button" onPress={retry}>
                    <ThemedText type="linkPrimary">Reîncearcă</ThemedText>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </ScrollView>

          {/* P-169: setările mesajului se deschid la cerere, ca listă verticală; nu mai ocupă un rând permanent. */}
          {settingsOpen ? (
            <View style={[styles.optionsPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.optionsHead}>
                <ThemedText type="smallBold">Setări pentru mesaj</ThemedText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Închide setările"
                  onPress={() => setSettingsOpen(false)}
                  style={[styles.done, { backgroundColor: theme.dark }]}>
                  <ThemedText type="smallBold" style={{ color: brand.onAccent }}>
                    Gata
                  </ThemedText>
                </Pressable>
              </View>
              <ChatOptions selection={options} layout="list" draft={draft} chatId={chatId} disabled={busy} onChange={choose} />
            </View>
          ) : null}
          <View style={[styles.composerArea, { backgroundColor: theme.background }]}>
            {documentLoadError && chatId ? (
              <View accessibilityLiveRegion="polite" style={[styles.error, { backgroundColor: theme.dangerSoft }]}>
                <ThemedText themeColor="dangerText">Documentele nu s-au putut actualiza.</ThemedText>
                <Button variant="secondary" onPress={() => void refreshDocuments(chatId)}>Reîncearcă</Button>
              </View>
            ) : null}
            <ChatDocuments documents={documents} uploading={uploading} disabled={busy} onRemove={(id) => void removeDocument(id)} />
            <View style={[styles.composerBox, { borderColor: theme.border, backgroundColor: theme.surface }, cardSurface(dark)]}>
              {photos.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos} accessibilityLabel={`${photos.length} fotografii atașate temporar`}>
                  {photos.map((photo, i) => (
                    <Pressable
                      key={photo.data.slice(-24) + i}
                      accessibilityRole="button"
                      accessibilityLabel={`Elimină fotografia ${i + 1}`}
                      disabled={busy}
                      onPress={() => setPhotos((current) => current.filter((_, n) => n !== i))}>
                      <Image alt="" source={{ uri: photo.data }} style={[styles.photo, { borderColor: theme.border }]} accessibilityIgnoresInvertColors />
                      <View style={[styles.photoRemove, { backgroundColor: theme.surface }]}>
                        <CloseIcon size={12} color={theme.text} />
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}
              <TextInput
                accessibilityLabel="Mesaj pentru Profi"
                placeholder="Întreabă sau cere un document…"
                placeholderTextColor={theme.subtle}
                value={draft}
                onChangeText={setDraft}
                multiline
                maxLength={MAX_MESSAGE}
                editable={!busy}
                style={[styles.input, { color: theme.text }]}
              />
              <View style={styles.toolbar}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Atașează: fotografii sau un document"
                  accessibilityHint="Fotografiile se trimit doar cu acest mesaj; documentul rămâne în conversație"
                  disabled={busy || !!uploading}
                  onPress={() => setAttachOpen(true)}
                  hitSlop={4}
                  style={({ pressed }) => [styles.iconButton, { backgroundColor: pressed ? theme.fillStrong : theme.fill }, (busy || !!uploading) && styles.dim]}>
                  <PlusIcon color={theme.text} />
                </Pressable>
                <OptionSheet<AttachChoice>
                  visible={attachOpen}
                  title={`Atașează (până la ${MAX_CHAT_PHOTOS} fotografii pe mesaj)`}
                  value=""
                  options={ATTACH_OPTIONS}
                  onChange={chooseAttachment}
                  onClose={() => setAttachOpen(false)}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Setări pentru mesaj: ${summary.label}`}
                  accessibilityState={{ expanded: settingsOpen }}
                  onPress={() => setSettingsOpen((open) => !open)}
                  style={[
                    styles.settings,
                    { backgroundColor: summary.configured || settingsOpen ? theme.soft : theme.fill },
                  ]}>
                  {/* P-201: doar pictograma; setarea aleasă se citește în etichetă și se vede ca punct verde. */}
                  <SlidersIcon color={summary.configured ? theme.softText : theme.text} />
                  {summary.configured ? <View style={[styles.settingsDot, { backgroundColor: theme.accent, borderColor: theme.surface }]} /> : null}
                </Pressable>
                <View style={styles.flex} />
                {busy ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Oprește răspunsul"
                    onPress={() => abort.current?.abort()}
                    style={[styles.sendButton, { backgroundColor: theme.fill }]}>
                    <StopIcon color={theme.text} />
                  </Pressable>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Trimite mesajul"
                    accessibilityState={{ disabled: awaitingClassChat || (!draft.trim() && !photos.length) }}
                    disabled={awaitingClassChat || (!draft.trim() && !photos.length)}
                    onPress={() => {
                      setSettingsOpen(false);
                      send();
                    }}
                    style={[styles.sendButton, { backgroundColor: theme.dark }, !draft.trim() && !photos.length && styles.dim]}>
                    <ArrowUpIcon color={brand.onAccent} />
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </AboveTabBar>

      <Modal visible={historyOpen} animationType="slide" onRequestClose={() => setHistoryOpen(false)}>
        <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderColor: theme.border }]}>
            <ThemedText type="subtitle" accessibilityRole="header">
              Conversațiile tale
            </ThemedText>
            <Pressable accessibilityRole="button" onPress={() => setHistoryOpen(false)} style={styles.close}>
              <ThemedText type="linkPrimary">Închide</ThemedText>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.history}>
            <Button onPress={startNew}>Conversație nouă</Button>
            {chats === null ? <ActivityIndicator /> : null}
            {chats?.length === 0 ? <ThemedText themeColor="muted">Nu ai încă nicio conversație salvată.</ThemedText> : null}
            {chats?.map((chat) => (
              <Pressable
                key={chat.id}
                accessibilityRole="button"
                accessibilityState={{ selected: chat.id === chatId }}
                onPress={() => open(chat.id)}
                style={[
                  styles.historyRow,
                  chat.id === chatId ? { backgroundColor: theme.soft } : [{ backgroundColor: theme.surface, borderColor: theme.border }, cardSurface(dark)],
                ]}>
                <ThemedText numberOfLines={2}>{chat.title || NEW_TITLE}</ThemedText>
                <ThemedText type="small" themeColor="subtle">
                  {new Date(chat.updated_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </Frame>
  );
}

// Antetul cu logo-ul (și butoanele conversației), pe fundalul ecranului.
function Frame({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  const theme = useTheme();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <Brand />
        {actions}
      </View>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  profile: { padding: Spacing.three },
  center: { marginTop: Spacing.five },
  margin: { margin: Spacing.three },
  dim: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.98 }] },
  header: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  actions: { flexDirection: 'row', gap: 6, flexShrink: 1 },
  chip: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 12, minHeight: 36, justifyContent: 'center' },
  messages: { padding: Spacing.three, gap: Spacing.three, flexGrow: 1 },
  welcome: { gap: Spacing.three, paddingTop: Spacing.two },
  suggestion: { borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16 },
  mascot: { alignItems: 'center' },
  error: { borderRadius: 14, padding: 14, gap: 6 },
  headerButton: { width: 42, height: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  composerArea: { paddingHorizontal: Spacing.two, paddingTop: 8, paddingBottom: Spacing.two, gap: 6 },
  composerBox: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 26, paddingHorizontal: 10, paddingTop: 6, paddingBottom: 8, gap: 4 },
  input: { minHeight: 40, maxHeight: 132, paddingHorizontal: 4, paddingTop: 8, paddingBottom: 6, fontSize: 16 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconButton: { width: 42, height: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  settings: { width: 42, height: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  settingsDot: { position: 'absolute', top: 7, right: 7, width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  sendButton: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  optionsPanel: { borderTopWidth: 1, maxHeight: 360 },
  optionsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 10 },
  done: { minHeight: 36, paddingHorizontal: 16, borderRadius: radius.pill, justifyContent: 'center' },
  send: { minHeight: 48, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 16, justifyContent: 'center' },
  photos: { flexDirection: 'row', gap: Spacing.two, paddingTop: 4 },
  photo: { width: 56, height: 56, borderRadius: 14 },
  photoRemove: { position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.three, borderBottomWidth: 1 },
  close: { minHeight: 44, justifyContent: 'center' },
  history: { padding: Spacing.three, gap: Spacing.two },
  historyRow: { borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, gap: 2 },
});
