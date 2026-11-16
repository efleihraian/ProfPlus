// P-291: feedback de la profesori — text și imagini, revizuit în dashboard-ul de admin.
// Comun pentru site, server și aplicația mobilă (aceleași tipuri, etichete și limite).

export const FEEDBACK_CATEGORIES = [
  {id: "problem", label: "Problemă", hint: "Ceva nu merge cum trebuie", placeholder: "Ce s-a întâmplat? Spune-ne pașii până la problemă și ce te așteptai să se întâmple."},
  {id: "idea", label: "Idee", hint: "O funcție nouă sau o îmbunătățire", placeholder: "Ce ai vrea să poată face ProfPlus și cum te-ar ajuta la clasă?"},
  {id: "other", label: "Altceva", hint: "Orice alt gând despre ProfPlus", placeholder: "Scrie-ne orice gând despre ProfPlus."},
] as const;
// P-310: textul sugerat din caseta de mesaj urmează tipul ales; fără tip, cere întâi alegerea lui.
export const FEEDBACK_PLACEHOLDER = "Alege mai sus despre ce este, apoi scrie-ne aici.";
export const feedbackPlaceholder = (id: string | null | undefined) => FEEDBACK_CATEGORIES.find(c => c.id === id)?.placeholder ?? FEEDBACK_PLACEHOLDER;
export type FeedbackCategory = typeof FEEDBACK_CATEGORIES[number]["id"];

/** Stările din dashboard. „Implementat”, „Ignorat” și „Duplicat” închid feedback-ul. */
export const FEEDBACK_STATUSES = [
  {id: "new", label: "Nou", userLabel: "Primit"},
  {id: "reviewing", label: "În analiză", userLabel: "În analiză"},
  {id: "planned", label: "Planificat", userLabel: "Planificat"},
  {id: "done", label: "Implementat", userLabel: "Implementat"},
  {id: "ignored", label: "Ignorat", userLabel: "Analizat"},
  {id: "duplicate", label: "Duplicat", userLabel: "Analizat"},
] as const;
export type FeedbackStatus = typeof FEEDBACK_STATUSES[number]["id"];
export const CLOSED_FEEDBACK: readonly FeedbackStatus[] = ["done", "ignored", "duplicate"];

export const FEEDBACK_PLATFORMS = ["web", "android", "ios"] as const;
export type FeedbackPlatform = typeof FEEDBACK_PLATFORMS[number];

export const FEEDBACK_MIN_TEXT = 10;
export const FEEDBACK_MAX_TEXT = 4000;
export const FEEDBACK_MAX_IMAGES = 5;
/** Imaginile sunt micșorate pe dispozitiv (~1600 px, JPEG); 2 MB lasă loc și capturilor PNG mici. */
export const FEEDBACK_MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const FEEDBACK_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type FeedbackImageType = typeof FEEDBACK_IMAGE_TYPES[number];
export const FEEDBACK_MAX_NOTE = 2000;
/** Imaginile feedback-ului închis se șterg după acest interval (DPIA). */
export const FEEDBACK_IMAGE_RETENTION_DAYS = 365;

export const isFeedbackCategory = (v: unknown): v is FeedbackCategory => FEEDBACK_CATEGORIES.some(c => c.id === v);
export const isFeedbackStatus = (v: unknown): v is FeedbackStatus => FEEDBACK_STATUSES.some(s => s.id === v);
export const isFeedbackPlatform = (v: unknown): v is FeedbackPlatform => FEEDBACK_PLATFORMS.includes(v as FeedbackPlatform);
export const feedbackCategoryLabel = (id: string) => FEEDBACK_CATEGORIES.find(c => c.id === id)?.label ?? id;
export const feedbackStatusLabel = (id: string) => FEEDBACK_STATUSES.find(s => s.id === id)?.label ?? id;
export const feedbackUserStatus = (id: string) => FEEDBACK_STATUSES.find(s => s.id === id)?.userLabel ?? id;
/** ID-ul sarcinii din BACKLOG, de forma P-123; gol dacă nu există. */
export const validTaskId = (v: string) => v === "" || /^P-\d{1,5}$/.test(v);

/** Textul trimis: spațiile de la capete se elimină, caracterele de control (în afară de rânduri noi) nu sunt permise. */
export function feedbackText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/\r\n?/g, "\n").trim();
  if (text.length < FEEDBACK_MIN_TEXT || text.length > FEEDBACK_MAX_TEXT) return null;
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) return null;
  return text;
}

/** Tipul real al imaginii, după primii octeți (nu după extensie sau după ce declară clientul). */
export function sniffImage(bytes: Uint8Array): FeedbackImageType | null {
  const b = (i: number) => bytes[i];
  if (bytes.length >= 3 && b(0) === 0xFF && b(1) === 0xD8 && b(2) === 0xFF) return "image/jpeg";
  if (bytes.length >= 8 && [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A].every((v, i) => b(i) === v)) return "image/png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

/** Ce vede profesorul despre propriul feedback (fără nota internă a administratorului). */
export type OwnFeedback = {id: string; category: FeedbackCategory; body: string; status: FeedbackStatus; images: number; createdAt: string; updatedAt: string};

/** Ce vede administratorul. */
export type AdminFeedback = OwnFeedback & {
  author: string; page: string; platform: FeedbackPlatform; appVersion: string;
  note: string; taskId: string; revision: number; closedAt: string | null;
  imageIds: string[];
};
export type FeedbackCounts = Partial<Record<FeedbackStatus, number>>;
