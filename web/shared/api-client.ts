import {generationDeadline,CHAT_TIMEOUT_MS,GENERATION_TIMEOUT_MESSAGE} from "./generation-limits";
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
  baseUrl?: string;
  getToken?: () => string | null | Promise<string | null>;
  timeoutMs?: number;
  onRequestEnd?: (info: RequestEnd) => void;
};

export type RequestEnd = {method: string; path: string; ok: boolean; status: number; durationMs: number; error?: unknown; aborted?: boolean};

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
    feedback: {
      list: () => request<{feedback: OwnFeedback[]}>("/api/feedback"),
      submit: (form: FormData) => request<{id: string}>("/api/feedback", {method: "POST", body: form}, UPLOAD_TIMEOUT_MS),
    },
    tours: {
      list: () => request<{tours: string[]}>("/api/account/tours"),
      mark: (id: string) => request<{ok: true}>("/api/account/tours?id=" + encodeURIComponent(id), {method: "POST"}),
      reset: (id?: string) => request<{ok: true}>("/api/account/tours" + (id ? "?id=" + encodeURIComponent(id) : ""), {method: "DELETE"}),
    },
    library: {
      list: (chatId?: string | null) => request<{items: LibraryItem[]}>("/api/library" + (chatId ? "?chatId=" + encodeURIComponent(chatId) : "")),
      personal: () => request<{documents: ChatDocument[]; limit: number; sharing?: Record<string, DocumentSharing>; sharingAvailable?: boolean}>("/api/library/personal"),
      share: (documentId: string) => request<{sharing: DocumentSharing}>("/api/library/shared", json("POST", {documentId, consent: true})),
      withdraw: (documentId: string) => request<{withdrawn: true}>("/api/library/shared?id=" + encodeURIComponent(documentId), {method: "DELETE"}),
    },
    classes: {
      list: () => request<{classes: OwnedClass[]; classroomImport?: boolean}>("/api/classes"),
      classroomStart: (app = false) => request<{url: string}>("/api/classes/classroom", json("POST", {app})),
      classroomFilesStart: (app = false) => request<{url: string}>("/api/classes/classroom/files", json("POST", {app})),
      classroomFilesImport: (input: {code: string; state: string; files: string[]; classId: string; section: string}) => request<{results: DriveImportResult[]}>("/api/classes/classroom/files/import", json("POST", input), UPLOAD_TIMEOUT_MS * 2),
      classroomCourses: (code: string, state: string) => request<{courses: ClassroomCourse[]}>("/api/classes/classroom/courses", json("POST", {code, state}), 30_000),
      create: (g: number, l: string) => request<{class: OwnedClass}>("/api/classes", json("POST", {g, l})),
      get: (id: string) => request<ClassDetail>("/api/classes/" + encodeURIComponent(id)),
      saveJournal: (id: string, journal: ClassJournal, revision: number | null) => request<{revision: number}>("/api/classes/" + encodeURIComponent(id), json("PUT", {journal, revision})),
      setColor: (id: string, bannerColor: ClassBannerColor | null) => request<{revision: number}>("/api/classes/" + encodeURIComponent(id), json("PATCH", {bannerColor})),
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
      remove: (kind: 'chat' | 'project', id: string) =>
        request<{deleted: true}>("/api/history?kind=" + kind + "&id=" + encodeURIComponent(id), {method: "DELETE"}),
      save: (chat: {id: string; revision: number; messages: ChatMessage[]; selection: unknown; projectId: string | null; title: string}) =>
        request<{revision: number}>("/api/history", json("PUT", chat)),
    },
    chat: {
      send: (body: ChatRequest, signal?: AbortSignal) => request<ChatReply>("/api/chat", {...json("POST", body), signal}, CHAT_TIMEOUT_MS),
      sendWithProgress: (body: ChatRequest, onStage: (stage: ChatStage) => void, signal?: AbortSignal, onDelta?: (text: string, reset: boolean) => void, onPlan?: (plan: ChatPlan) => void) => {
        const init = json("POST", body);
        return request<ChatReply>("/api/chat", {...init, headers: {...init.headers as Record<string, string>, Accept: "application/x-ndjson, application/json"}, signal}, CHAT_TIMEOUT_MS, response => readChatResponse(response, onStage, onDelta, onPlan));
      },
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

export const api = createApiClient();
