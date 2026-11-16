import type {ExerciseOptions} from '../../../web/lib/exercise-options';
// Setările pentru următorul mesaj din chat, aceleași ca pe site (web/lib/composer-tools.ts, web/lib/difficulty.ts).
// web/tests/mobile-chat-options.mjs verifică să rămână identice cu cele de acolo.
export const DOCUMENT_TYPES = [
  { id: 'test', label: 'Test' },
  { id: 'worksheet', label: 'Fișă de lucru' },
  { id: 'theory', label: 'Fișă de teorie' },
  { id: 'planning', label: 'Planificare' },
  { id: 'unit', label: 'Unitate de învățare' },
  { id: 'lesson', label: 'Proiect de lecție' },
  { id: 'rubric', label: 'Barem' },
  { id: 'presentation', label: 'Prezentare' },
  { id: 'fun', label: 'Fun Prof · jocuri și activități' },
] as const;
export const DIFFICULTIES = [
  { id: 'usor', label: 'Ușor' },
  { id: 'mediu', label: 'Mediu' },
  { id: 'dificil', label: 'Dificil' },
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number]['id'];
export type Difficulty = (typeof DIFFICULTIES)[number]['id'];
export type ChatSelection = {
  mode?: 'automatic' | 'manual';
  manualIds: string[];
  documentIds: string[];
  documentType?: string;
  difficulty?: Difficulty;
  answerKey?: boolean;
  exerciseOptions?: ExerciseOptions;
  grade?: number;
  extraManualIds?: string[];
  extraDocumentIds?: string[];
};

export const AUTOMATIC: ChatSelection = { mode: 'automatic', manualIds: [], documentIds: [] };
export const MAX_EXTRA_SOURCES = 50;

/** Conversațiile vechi pot avea `selection` nul; alegerile făcute pe site rămân neschimbate. */
export const asSelection = (value: unknown): ChatSelection => (value && typeof value === 'object' ? (value as ChatSelection) : AUTOMATIC);

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const searchable = fold;

const isAssessmentText = (text: string) => /\b(?:test(?:e(?:le)?|ul)?|exerciti\w*|fisa|fise|problem(?:a|e)(?:le)?|item(?:i|ul)?|sarcin(?:a|i)(?:le)?|calcule)\b/.test(fold(text));

/** Dificultatea și baremul au sens doar la teste și fișe: alese explicit sau numite în mesaj. */
export function assessmentSettingsVisible(type: string | undefined, draft: string) {
  return type ? type === 'test' || type === 'worksheet' : isAssessmentText(draft);
}

export function toggleExtra(selection: ChatSelection, item: { id: string; kind: 'manual' | 'document' }, add: boolean): ChatSelection {
  const field = item.kind === 'manual' ? 'extraManualIds' : 'extraDocumentIds';
  const current = selection[field] ?? [];
  return { ...selection, mode: 'automatic', [field]: add ? [...new Set([...current, item.id])].slice(0, MAX_EXTRA_SOURCES) : current.filter((id) => id !== item.id) };
}

/** Old preferences keep their total; numeric adaptations join generated exercises. */
export const exerciseCounts = (selection: ChatSelection) => {
  const counts = selection.exerciseOptions?.counts ?? {original:3,copied:3,numbers:0};
  return {original:counts.original+counts.numbers,copied:counts.copied,numbers:0};
};
export function setExerciseCount(selection: ChatSelection, kind: 'original' | 'copied', value: number): ChatSelection {
  const counts = exerciseCounts(selection);
  const other = kind === 'original' ? 'copied' : 'original';
  counts[kind] = Math.max(0, Math.min(30 - counts[other], Math.floor(value)));
  const total = counts.original + counts.copied;
  if (!total) return selection;
  const options = selection.exerciseOptions;
  return {...selection, exerciseOptions:{...options,total,counts,...(options?.subpoints ? {subpoints:options.subpoints.filter(rule=>rule.exercise<=total)} : {})}};
}
