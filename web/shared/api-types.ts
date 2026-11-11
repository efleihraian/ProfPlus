// Contractul API ProfPlus: datele pe care serverul (web/app/api) le trimite clienților.
// Îl folosesc și site-ul (web/app), și aplicația mobilă (mobile/); importă doar tipuri din alte fișiere web/shared.
import type {ClassJournal} from "./class-catalog";

export type Stage = "primary" | "middle" | "high";
export type TeachingProfile = {role: "primary" | "teacher"; subject: string; stages: Stage[]};
/** Ordinea surselor pentru forma documentelor: modelele proprii, cele comune ProfPlus, structura propusă de AI. */
export type ModelSource = "personal" | "common" | "ai";

export type AccountIdentity = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean | null;
  provider: "sites" | "supabase";
  linkedProviders?: string[];
  teaching?: TeachingProfile | null;
  modelOrder?: ModelSource[];
  deleting?: boolean;
};

/** GET /api/account */
export type AccountResponse = {
  user: AccountIdentity | null;
  admin: boolean;
  provider: "sites" | "supabase";
  ready: boolean;
  google: boolean;
  apple: boolean;
  registration: boolean;
  emailEnabled: boolean;
  deletionEnabled: boolean;
  defaultManualIds: string[];
  /** Disciplinele pentru profilul didactic (P-195; lipsește la un server mai vechi). */
  subjects?: string[];
};

/** POST /api/account din aplicație (P-195): profilul și ștergerea, singurele acțiuni de cont permise cu token Bearer. */
export type AccountUpdate =
  | {action: "profile"; name: string; teaching?: TeachingProfile}
  | {action: "delete"; confirmation: "STERGE"};

/** Un document încărcat de profesor (GET /api/documents). */
export type ChatDocument = {id: string; name: string; size: number; status: string};

/** Istoricul conversațiilor (GET /api/history). */
export type HistoryChat = {id: string; title: string; project_id: string | null; updated_at: number};
export type Project = {id: string; name: string};

/** O sursă citată în răspuns: manual, document al profesorului sau pagină web. */
/** `shared`: fragment dintr-un material partajat de un profesor (P-210); `url` gol, originalul nu este oferit. */
export type ChatSource = {id: number; kind: "manual" | "document" | "web"; title: string; schoolClass?: string; subject?: string; publisher?: string; page?: number; url: string; shared?: boolean};
/** Documentul generat de Profi (test, fișă), editabil și exportabil pe site. */
export type GeneratedDocument = {title: string; content: string; latex?: string};
/** `followUps` (P-211): propunerile Fun Prof de sub răspuns, cel mult 4. */
export type ChatMessage = {role: "user" | "assistant"; content: string; sources?: ChatSource[]; warnings?: string[]; document?: GeneratedDocument; model?: string; followUps?: string[]};
/** O conversație salvată (GET /api/history?id=); `revision` previne suprascrierea din altă fereastră. */
export type SavedChat = {id: string; title: string; project_id: string | null; messages: ChatMessage[]; selection: unknown; revision: number};
/** POST /api/chat: fără `selection`, serverul alege sursele automat după profilul didactic. */
/** `images`: P-166 — fotografii (data URL JPEG/PNG/WEBP) atașate temporar ultimului mesaj; nu se salvează. */
export type ChatRequest = {messages: {role: "user" | "assistant"; content: string}[]; chatId?: string; revision?: number; model?: string; selection?: unknown; images?: {name: string; data: string}[]};
export type ChatReply = {reply: string; grounded?: boolean; sources?: ChatSource[]; warnings?: string[]; document?: GeneratedDocument; model?: string; revision?: number; funProf?: boolean; followUps?: string[]};

/** O sursă din bibliotecă (GET /api/library): manual sau document propriu. */
export type LibraryItem = {id: string; kind: "manual" | "document"; status: string; title?: string; publisher?: string; subject?: string; schoolClass?: string; modelTypes?: string[]};

/** Un fișier din portofoliul profesional (GET /api/portfolio); `slot` este rubrica din catalog (ex. a1). */
export type PortfolioFile = {id: string; name: string; size: number; status: string; slot: string; createdAt: number};

/** O clasă a profesorului (GET/POST /api/classes). */
export type OwnedClass = {id: string; name: string; g: number; l: string};
/** GET /api/classes/:id: jurnalul clasei, documentele pe secțiuni (planificari, proiecte, teste, fise) și conversațiile clasei. */
export type ClassDetail = {class: OwnedClass; journal: ClassJournal; revision: number | null; documents: Record<string, ChatDocument[]>; conversations: {id: string; title: string; updatedAt: number}[]};
