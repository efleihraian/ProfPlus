import {createApiClient} from "../../../web/shared/api-client";
import {librarySearchParams, type LibrarySearch, type PublicLibraryResults} from '../../../web/shared/public-library';
import {logRequest} from "./log";
import type {InterfacePreferences} from '../../../web/lib/interface-preferences';
import {supabase} from "./supabase";

export {ApiError} from "../../../web/shared/api-client";
export {funProfSuggestion, suggestionsFor} from "../../../web/shared/suggestions";
export {appOAuthEntry} from "../../../web/shared/app-oauth";
export {GRADATION, GRADATION_INFO, PORTFOLIO, PORTFOLIO_INFO, type PortfolioItem, type PortfolioSection} from "../../../web/shared/portfolio-catalog";
export {CLASS_CARD_ICONS, CLASS_CARDS, CLASS_DIFFICULTY, CLASS_SECTIONS, LETTERS, MAX_CLASSES, NOTE_TAGS, ROMAN, classContext, classSettingsWithSubject, classTitle, emptyJournal, filterClassSubjects, type ClassCard, type ClassCardId, type ClassSection, type ClassJournal, type ClassLevel, type ClassNote, type ClassSettings} from "../../../web/shared/class-catalog";
export {CLASSROOM_APP_RETURN, CLASSROOM_CODE_PARAM, CLASSROOM_ERROR_PARAM, CLASSROOM_FILES_PARAM, CLASSROOM_STATE_PARAM, type DriveImportResult, courseSummary, importLabel, importPlan, journalWithImport, type ClassroomCourse, type ImportChoice} from "../../../web/shared/classroom-import";
export {TEACHING_STAGES} from "../../../web/shared/teaching";
export {PROGRESS_STEPS, elapsed, type ChatStage, type ProgressStage} from "../../../web/shared/chat-progress";
export {isPlanKind, planLabel, planSeconds, progressFraction, remainingText, type GenerationPlan} from "../../../web/shared/generation-plan";
export type {AccountResponse, AccountUpdate, Stage, TeachingProfile, ChatDocument, ChatMessage, ClassDetail, ChatSource, GeneratedDocument, HistoryChat, LibraryItem, OwnedClass, PortfolioFile, SavedChat} from "../../../web/shared/api-types";

export const api = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  getToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
  timeoutMs: 20_000,
  onRequestEnd: logRequest,
});

const publicClient = createApiClient({baseUrl:process.env.EXPO_PUBLIC_API_URL ?? '',timeoutMs:8000});
export const searchPublicLibrary = (filters:LibrarySearch,signal?:AbortSignal) =>
  publicClient.request<PublicLibraryResults>('/api/public-library?'+librarySearchParams(filters),{signal});

export function mobilePreferences(userId: string) {
  const client = createApiClient({
    baseUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
    timeoutMs: 12_000,
    getToken: async () => {
      const {data: {session}} = await supabase.auth.getSession();
      if (!session || session.user.id !== userId) throw new Error('SESSION_CHANGED');
      return session.access_token;
    },
  });
  const path = '/api/account/preferences';
  type Payload = {userId: string; preferences: InterfacePreferences | null};
  return {
    read: (signal: AbortSignal) => client.request<Payload>(path, {signal}),
    save: (preferences: InterfacePreferences, signal: AbortSignal) => client.request<Payload>(path, {
      method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(preferences), signal,
    }),
  };
}
