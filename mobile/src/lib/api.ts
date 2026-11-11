// Clientul API al aplicației mobile: același contract ca site-ul (web/shared), deci aceleași rute și aceleași tipuri.
import {createApiClient} from "../../../web/shared/api-client";
import {logRequest} from "./log";
import {supabase} from "./supabase";

export {ApiError} from "../../../web/shared/api-client";
export {funProfSuggestion, suggestionsFor} from "../../../web/shared/suggestions";
export {appOAuthEntry} from "../../../web/shared/app-oauth";
export {GRADATION, PORTFOLIO, type PortfolioItem, type PortfolioSection} from "../../../web/shared/portfolio-catalog";
export {CLASS_SECTIONS, LETTERS, MAX_CLASSES, NOTE_TAGS, ROMAN, classContext, classTitle, type ClassJournal, type ClassLevel, type ClassNote, type ClassSettings} from "../../../web/shared/class-catalog";
export {TEACHING_STAGES} from "../../../web/shared/teaching";
export {PROGRESS_STEPS, elapsed, type ChatStage, type ProgressStage} from "../../../web/shared/chat-progress";
export type {AccountResponse, AccountUpdate, Stage, TeachingProfile, ChatDocument, ChatMessage, ClassDetail, ChatSource, GeneratedDocument, HistoryChat, LibraryItem, OwnedClass, PortfolioFile, SavedChat} from "../../../web/shared/api-types";

export const api = createApiClient({
  // Adresa serverului ProfPlus, din mobile/.env.local (EXPO_PUBLIC_API_URL).
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  // Tokenul de acces Supabase al utilizatorului conectat; serverul îl verifică la fiecare cerere.
  getToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
  // Pe telefon conexiunea poate cădea; nicio cerere nu rămâne agățată (chatul are limita lui, mai lungă).
  timeoutMs: 20_000,
  // Eșecurile și cererile lente ajung în jurnal (lib/log.ts), fără conținut sau tokenuri.
  onRequestEnd: logRequest,
});
