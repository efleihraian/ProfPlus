import {generationDeadline,CHAT_TIMEOUT_MS,GENERATION_TIMEOUT_MESSAGE} from "./generation-limits";
// Singurul loc prin care un client vorbește cu API-ul ProfPlus.
// Site-ul îl folosește cu cookie-ul de sesiune; aplicația mobilă îi dă adresa serverului și tokenul Supabase.
import type {RevisionInput} from "./document-sections";
import type {ClassBannerColor, ClassJournal} from "./class-catalog";
import type {ClassroomCourse, DriveImportResult} from "./classroom-import";
import type {DocumentSharing} from "./library-sharing";
import type {OwnFeedback} from "./feedback";
import {readChatResponse, type ChatPlan, type ChatStage} from "./chat-progress";
import type {AccountResponse, AccountUpdate, ChatDocument, ClassDetail, LibraryItem, ChatReply, ChatRequest, ChatMessage, HistoryChat, OwnedClass, PortfolioFile, Project, SavedChat} from "./api-types";

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly field?: string) { super(message); }
}

export type ApiClientOptions = {
  /** "" pe site (aceeași origine); adresa serverului în aplicația mobilă. */
  baseUrl?: string;
  /** Aplicația mobilă: tokenul de acces Supabase al utilizatorului conectat. */
  getToken?: () => string | null | Promise<string | null>;
  /** Aplicația mobilă: după câte milisecunde renunță la o cerere fără răspuns. Site-ul nu setează limita. */
  timeoutMs?: number;
  /** Aplicația mobilă: apelată după fiecare cerere, ca să poată scrie în jurnal eșecurile și cererile lente. */
  onRequestEnd?: (info: RequestEnd) => void;
};

export type RequestEnd = {method: string; path: string; ok: boolean; status: number; durationMs: number; error?: unknown; aborted?: boolean};

/** Un fișier de 10 MB pe o conexiune mobilă lentă. */
const UPLOAD_TIMEOUT_MS = 120_000;

export function createApiClient({baseUrl = "", getToken, timeoutMs, onRequestEnd}: ApiClientOptions = {}) {
  async function request<T>(path: string, init: RequestInit = {}, limitMs = timeoutMs, read: (response: Response) => Promise<{ok: boolean; status: number; data: unknown}> = readJson): Promise<T> {
    const started = Date.now();
    const method = init.method ?? "GET";
    try {
      const data = await send<T>(path, init, limitMs, read);
      onRequestEnd?.({method, path, ok: true, status: 200, durationMs: Date.now() - started});
      return data;
    } catch (error) {
      onRequestEnd?.({method, path, ok: false, status: error instanceof ApiError ? error.status : 0, durationMs: Date.now() - started, error, aborted: !!init.signal?.aborted});
      throw error;
    }
  }
  async function readJson(response: Response) {
    try { return {ok: response.ok, status: response.status, data: await response.json() as unknown}; } catch { throw new ApiError("Răspuns invalid de la server.", response.status); }
  }
  async function send<T>(path: string, init: RequestInit, limitMs: number | undefined, read: (response: Response) => Promise<{ok: boolean; status: number; data: unknown}>): Promise<T> {
    const budget = generationDeadline(init.signal, limitMs || CHAT_TIMEOUT_MS);
    let result: {ok: boolean; status: number; data: unknown};
    try {
      const headers = new Headers(init.headers);
      const token = await budget.wait(Promise.resolve(getToken?.()));
      if (token) headers.set("Authorization", "Bearer " + token);
      budget.signal.throwIfAborted();
      const response = await budget.wait(fetch(baseUrl + path, {cache: "no-store", ...init, headers, signal: budget.signal}));
      result = await budget.wait(read(response));
    } catch (error) {
      if (budget.signal.aborted && !init.signal?.aborted) throw new ApiError(path === '/api/chat' ? GENERATION_TIMEOUT_MESSAGE : "Serverul nu a răspuns la timp. Încearcă din nou.", 0);
      throw error;
    } finally {
      budget.dispose();
    }
    const data = result.data as {error?: string; field?: string};
    if (!result.ok) throw new ApiError(data?.error || "Operația a eșuat.", result.status, data?.field);
    return data as T;
  }
  const json = (method: string, body: unknown): RequestInit => ({method, headers: {"Content-Type": "application/json"}, body: JSON.stringify(body)});

  return {
    request,
    json,
    account: {
      get: () => request<AccountResponse>("/api/account"),
      update: (body: AccountUpdate) => request<{message?: string}>("/api/account", json("POST", body)),
    },
    // P-291: feedback-ul profesorului (text și cel mult 5 imagini, multipart).
    feedback: {
      list: () => request<{feedback: OwnFeedback[]}>("/api/feedback"),
      submit: (form: FormData) => request<{id: string}>("/api/feedback", {method: "POST", body: form}, UPLOAD_TIMEOUT_MS),
    },
    tours: {
      list: () => request<{tours: string[]}>("/api/account/tours"),
      mark: (id: string) => request<{ok: true}>("/api/account/tours?id=" + encodeURIComponent(id), {method: "POST"}),
      /** Fără id: toate tururile contului pornesc din nou. */
      reset: (id?: string) => request<{ok: true}>("/api/account/tours" + (id ? "?id=" + encodeURIComponent(id) : ""), {method: "DELETE"}),
    },
    library: {
      /** Tot catalogul vizibil contului; `chatId` adaugă documentele conversației. */
      list: (chatId?: string | null) => request<{items: LibraryItem[]}>("/api/library" + (chatId ? "?chatId=" + encodeURIComponent(chatId) : "")),
      /** Biblioteca personală (P-195). Încărcarea: documents.upload cu `scope=library`; ștergerea: documents.remove. */
      personal: () => request<{documents: ChatDocument[]; limit: number; sharing?: Record<string, DocumentSharing>; sharingAvailable?: boolean}>("/api/library/personal"),
      /** P-210: propune un document pentru toți profesorii (acord explicit) sau retrage acordul. */
      share: (documentId: string) => request<{sharing: DocumentSharing}>("/api/library/shared", json("POST", {documentId, consent: true})),
      withdraw: (documentId: string) => request<{withdrawn: true}>("/api/library/shared?id=" + encodeURIComponent(documentId), {method: "DELETE"}),
    },
    classes: {
      list: () => request<{classes: OwnedClass[]; classroomImport?: boolean}>("/api/classes"),
      /** P-241: adresa Google de la care pornește importul din Classroom (`app`: întoarcerea se face în aplicația mobilă). */
      classroomStart: (app = false) => request<{url: string}>("/api/classes/classroom", json("POST", {app})),
      /** P-244: adresa selectorului de fișiere Google (acces numai la fișierele alese acolo). */
      classroomFilesStart: (app = false) => request<{url: string}>("/api/classes/classroom/files", json("POST", {app})),
      /** P-244: aduce fișierele alese în secțiunea clasei; fiecare trece prin verificările încărcării obișnuite. */
      classroomFilesImport: (input: {code: string; state: string; files: string[]; classId: string; section: string}) => request<{results: DriveImportResult[]}>("/api/classes/classroom/files/import", json("POST", input), UPLOAD_TIMEOUT_MS * 2),
      /** P-241: după întoarcerea de la Google, propunerile de clase; nimic nu se creează încă. */
      classroomCourses: (code: string, state: string) => request<{courses: ClassroomCourse[]}>("/api/classes/classroom/courses", json("POST", {code, state}), 30_000),
      create: (g: number, l: string) => request<{class: OwnedClass}>("/api/classes", json("POST", {g, l})),
      get: (id: string) => request<ClassDetail>("/api/classes/" + encodeURIComponent(id)),
      /** `revision` previne suprascrierea din altă fereastră (409). */
      saveJournal: (id: string, journal: ClassJournal, revision: number | null) => request<{revision: number}>("/api/classes/" + encodeURIComponent(id), json("PUT", {journal, revision})),
      setColor: (id: string, bannerColor: ClassBannerColor | null) => request<{revision: number}>("/api/classes/" + encodeURIComponent(id), json("PATCH", {bannerColor})),
      /** Șterge documentele clasei, observațiile și setările; conversațiile rămân în istoric. */
      remove: (id: string) => request<{deleted: true; documents: number}>("/api/classes/" + encodeURIComponent(id), {method: "DELETE"}),
    },
    documents: {
      reviseSection: (input: RevisionInput, signal?: AbortSignal) => request<{replacement:string}>("/api/documents/revise", {...json("POST", input), signal}, 55_000),
      async list(chatId: string, signal?: AbortSignal) {
        const load = () => request<{documents: ChatDocument[]}>("/api/documents?chatId=" + encodeURIComponent(chatId), {signal}, 10_000);
        try { return await load(); }
        catch (error) {
          const temporary = error instanceof TypeError || error instanceof ApiError && (error.status === 0 || error.status === 408 || error.status >= 500);
          if (signal?.aborted || !temporary) throw error;
          return load();
        }
      },
      /** Încărcare multipart (`file`, `scope`, `slot` sau `chatId`), până la 10 MB; pe telefon poate dura. */
      upload: (form: FormData) => request<{document: {id: string; name: string}}>("/api/documents", {method: "POST", body: form}, UPLOAD_TIMEOUT_MS),
      remove: (id: string) => request<{deleted: true}>("/api/documents/" + encodeURIComponent(id), {method: "DELETE"}),
    },
    portfolio: {
      list: () => request<{documents: PortfolioFile[]}>("/api/portfolio"),
    },
    history: {
      list: () => request<{chats: HistoryChat[]; projects: Project[]}>("/api/history"),
      get: (id: string) => request<{chat: SavedChat}>("/api/history?id=" + encodeURIComponent(id)),
      create: (projectId: string | null = null) => request<{id: string}>("/api/history", json("POST", {projectId})),
      /** Salvează toată conversația; serverul refuză (409) dacă `revision` nu mai e cea curentă. */
      save: (chat: {id: string; revision: number; messages: ChatMessage[]; selection: unknown; projectId: string | null; title: string}) =>
        request<{revision: number}>("/api/history", json("PUT", chat)),
    },
    chat: {
      send: (body: ChatRequest, signal?: AbortSignal) => request<ChatReply>("/api/chat", {...json("POST", body), signal}, CHAT_TIMEOUT_MS),
      /** P-199: cere pașii reali ai generării (NDJSON, P-198) și îi raportează pe măsură ce sosesc; serverul vechi răspunde JSON simplu. */
      sendWithProgress: (body: ChatRequest, onStage: (stage: ChatStage) => void, signal?: AbortSignal, onDelta?: (text: string, reset: boolean) => void, onPlan?: (plan: ChatPlan) => void) => {
        const init = json("POST", body);
        return request<ChatReply>("/api/chat", {...init, headers: {...init.headers as Record<string, string>, Accept: "application/x-ndjson, application/json"}, signal}, CHAT_TIMEOUT_MS, response => readChatResponse(response, onStage, onDelta, onPlan));
      },
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

/** Clientul site-ului: aceeași origine, autentificat prin cookie. */
export const api = createApiClient();
