// Singurul loc prin care un client vorbește cu API-ul ProfPlus.
// Site-ul îl folosește cu cookie-ul de sesiune; aplicația mobilă îi dă adresa serverului și tokenul Supabase.
import type {ClassJournal} from "./class-catalog";
import type {DocumentSharing} from "./library-sharing";
import {readChatResponse, type ChatStage} from "./chat-progress";
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

/** Un răspuns AI poate dura minute: pregătirea bibliotecii (până la 2 min), apoi generarea (3–5 min, în app/api/chat).
 * Clientul așteaptă mai mult decât serverul, ca serverul să termine primul și să-și trimită propriul mesaj de eroare. */
const CHAT_TIMEOUT_MS = 480_000;
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
    const headers = new Headers(init.headers);
    const token = await getToken?.();
    if (token) headers.set("Authorization", "Bearer " + token);
    // Limita de timp și oprirea cerută de utilizator (init.signal) anulează aceeași cerere, inclusiv citirea unui răspuns
    // trimis pe parcurs (pașii generării, P-199).
    const controller = limitMs || init.signal ? new AbortController() : null;
    const timer = limitMs && controller ? setTimeout(() => controller.abort(), limitMs) : null;
    init.signal?.addEventListener("abort", () => controller?.abort());
    const timedOut = () => !!controller?.signal.aborted && !init.signal?.aborted;
    let result: {ok: boolean; status: number; data: unknown};
    try {
      const response = await fetch(baseUrl + path, {cache: "no-store", ...init, headers, ...(controller ? {signal: controller.signal} : {})});
      result = await read(response);
    } catch (error) {
      if (timedOut()) throw new ApiError("Serverul nu a răspuns la timp. Încearcă din nou.", 0);
      throw error;
    } finally {
      if (timer) clearTimeout(timer);
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
      list: () => request<{classes: OwnedClass[]}>("/api/classes"),
      create: (g: number, l: string) => request<{class: OwnedClass}>("/api/classes", json("POST", {g, l})),
      get: (id: string) => request<ClassDetail>("/api/classes/" + encodeURIComponent(id)),
      /** `revision` previne suprascrierea din altă fereastră (409). */
      saveJournal: (id: string, journal: ClassJournal, revision: number | null) => request<{revision: number}>("/api/classes/" + encodeURIComponent(id), json("PUT", {journal, revision})),
      /** Șterge documentele clasei, observațiile și setările; conversațiile rămân în istoric. */
      remove: (id: string) => request<{deleted: true; documents: number}>("/api/classes/" + encodeURIComponent(id), {method: "DELETE"}),
    },
    documents: {
      list: (chatId: string) => request<{documents: ChatDocument[]}>("/api/documents?chatId=" + encodeURIComponent(chatId)),
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
      sendWithProgress: (body: ChatRequest, onStage: (stage: ChatStage) => void, signal?: AbortSignal) => {
        const init = json("POST", body);
        return request<ChatReply>("/api/chat", {...init, headers: {...init.headers as Record<string, string>, Accept: "application/x-ndjson, application/json"}, signal}, CHAT_TIMEOUT_MS, response => readChatResponse(response, onStage));
      },
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

/** Clientul site-ului: aceeași origine, autentificat prin cookie. */
export const api = createApiClient();
