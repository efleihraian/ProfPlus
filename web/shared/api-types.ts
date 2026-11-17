import type {ClassBannerColor, ClassJournal} from "./class-catalog";

export type Stage = "primary" | "middle" | "high";
export type TeachingProfile = {role: "educator" | "primary" | "teacher"; subject: string; stages: Stage[]};
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

export type AccountResponse = {
  user: AccountIdentity | null;
  admin: boolean;
  mfaPending?: boolean;
  mfaEnrolled?: boolean;
  accountMfaEnrollment?: boolean;
  provider: "sites" | "supabase";
  ready: boolean;
  google: boolean;
  apple: boolean;
  registration: boolean;
  emailEnabled: boolean;
  deletionEnabled: boolean;
  emailActionConfirmations?: boolean;
  defaultManualIds: string[];
  subjects?: string[];
};

export type AccountUpdate =
  | {action: "profile"; name: string; teaching?: TeachingProfile}
  | {action: "password-link" | "delete-code"}
  | {action: "delete"; confirmation: "STERGE"; code: string};

export type ChatDocument = {id: string; name: string; size: number; status: string};

export type HistoryChat = {id: string; title: string; project_id: string | null; updated_at: number};
export type Project = {id: string; name: string};

export type ChatSource = {id: number; kind: "manual" | "document" | "web"; title: string; schoolClass?: string; subject?: string; publisher?: string; author?: string; license?: string; page?: number; url: string; shared?: boolean};
export type GeneratedDocument = {title: string; content: string; latex?: string};
export type ChatMessage = {role: "user" | "assistant"; content: string; sources?: ChatSource[]; warnings?: string[]; document?: GeneratedDocument; model?: string; followUps?: string[]};
export type SavedChat = {id: string; title: string; project_id: string | null; messages: ChatMessage[]; selection: unknown; revision: number};
export type ChatRequest = {documentTitle?: string; messages: {role: "user" | "assistant"; content: string}[]; chatId?: string; revision?: number; model?: string; selection?: unknown; images?: {name: string; data: string}[]};
export type ChatReply = {reply: string; grounded?: boolean; sources?: ChatSource[]; warnings?: string[]; document?: GeneratedDocument; model?: string; revision?: number; funProf?: boolean; followUps?: string[]};

export type LibraryItem = {id: string; kind: "manual" | "document"; status: string; title?: string; publisher?: string; subject?: string; schoolClass?: string; modelTypes?: string[]; personal?: boolean};

export type PortfolioFile = {id: string; name: string; size: number; status: string; slot: string; createdAt: number};

export type OwnedClass = {id: string; name: string; g: number; l: string; bannerColor?: ClassBannerColor};
export type ClassDetail = {class: OwnedClass; journal: ClassJournal; revision: number | null; classroomImport?: boolean; documents: Record<string, ChatDocument[]>; conversations: {id: string; title: string; updatedAt: number}[];
  generated?: Record<string, ClassGeneratedDocument[]>};
export type ClassGeneratedDocument = {chatId: string; index: number; title: string; updatedAt: number};
