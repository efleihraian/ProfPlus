/**
 * Clasele mele (P-081): o clasă este un proiect al contului, cu numele standard al clasei.
 * Documentele încărcate pe secțiuni și jurnalul clasei folosesc grupuri interne derivate pe server
 * din contul verificat și proiect, cu tabelele și operațiile aprobate existente (fără migrare).
 */
import {derivedGroupId, personalLibraryId} from "./personal-library";

export const CLASS_SECTIONS = [
  {id: "planificari", title: "Planificări", desc: "Planificarea anuală și calendaristică a clasei.", prompt: "planificarea calendaristică"},
  {id: "proiecte", title: "Proiecte de lecție", desc: "Lecțiile pregătite pentru această clasă.", prompt: "un proiect de lecție"},
  {id: "teste", title: "Teste și evaluări", desc: "Evaluări inițiale, formative și sumative.", prompt: "un test de evaluare cu barem"},
  {id: "fise", title: "Fișe de lucru", desc: "Fișe diferențiate și resurse pentru clasă.", prompt: "o fișă de lucru"},
] as const;
export type ClassSection = typeof CLASS_SECTIONS[number]["id"];
export const isClassSection = (value: unknown): value is ClassSection => CLASS_SECTIONS.some(s => s.id === value);
export const MAX_CLASSES = 30;
export const JOURNAL_TITLE = "[Jurnalul clasei]";

const ROMAN = ["pregătitoare", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const LETTERS = "ABCDEFGHIJ";
export function classTitle(g: number, l: string): string {
  return (g === 0 ? "Clasa pregătitoare" : g === 1 ? "Clasa I" : "Clasa a " + ROMAN[g] + "-a") + (l ? " " + l : "");
}
export function parseClassTitle(name: string): {g: number; l: string} | null {
  for (let g = 0; g < ROMAN.length; g++) for (const l of LETTERS) if (classTitle(g, l) === name) return {g, l};
  return null;
}
export const validGrade = (g: unknown, l: unknown): g is number => Number.isInteger(g) && (g as number) >= 0 && (g as number) <= 12 && typeof l === "string" && l.length === 1 && LETTERS.includes(l);

export const classJournalId = (user: string, project: string) => derivedGroupId(`profplus:class-journal:v1:${user}:${project}`);
export const classDocumentsId = (user: string, project: string, section: ClassSection) => derivedGroupId(`profplus:class-documents:v1:${user}:${project}:${section}`);
export async function classDocumentGroups(user: string, project: string): Promise<Record<ClassSection, string>> {
  const entries = await Promise.all(CLASS_SECTIONS.map(async s => [s.id, await classDocumentsId(user, project, s.id)] as const));
  return Object.fromEntries(entries) as Record<ClassSection, string>;
}
/** Grupurile interne care nu sunt conversații și nu se afișează în istoric. */
export async function hiddenGroupIds(user: string, projectIds: string[]): Promise<Set<string>> {
  const ids = new Set([await personalLibraryId(user)]);
  for (const project of projectIds) {
    ids.add(await classJournalId(user, project));
    for (const id of Object.values(await classDocumentGroups(user, project))) ids.add(id);
  }
  return ids;
}

export type ClassLevel = "" | "sprijin" | "mediu" | "avansat";
export type ClassSettings = {subject: string; level: ClassLevel; students: number | null; manual: string; preferences: string};
export type ClassNote = {id: string; date: string; tag: "lectie" | "evaluare" | "organizare" | "altele"; text: string};
export type ClassJournal = {settings: ClassSettings; notes: ClassNote[]};
export const NOTE_TAGS = [{id: "lectie", label: "Lecție"}, {id: "evaluare", label: "Evaluare"}, {id: "organizare", label: "Organizare"}, {id: "altele", label: "Altele"}] as const;
export const emptyJournal = (): ClassJournal => ({settings: {subject: "", level: "", students: null, manual: "", preferences: ""}, notes: []});
const text = (v: unknown, max: number) => typeof v === "string" && v.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v);
export function validJournal(value: unknown): ClassJournal | null {
  if (!value || typeof value !== "object") return null;
  const j = value as ClassJournal, s = j.settings;
  if (!s || typeof s !== "object" || !text(s.subject, 80) || !["", "sprijin", "mediu", "avansat"].includes(s.level) || !text(s.manual, 120) || !text(s.preferences, 600)) return null;
  if (s.students !== null && !(Number.isInteger(s.students) && s.students >= 0 && s.students <= 60)) return null;
  if (!Array.isArray(j.notes) || j.notes.length > 200) return null;
  for (const n of j.notes) if (!n || typeof n !== "object" || !text(n.id, 40) || !n.id || !/^\d{4}-\d{2}-\d{2}$/.test(n.date) || !NOTE_TAGS.some(t => t.id === n.tag) || !text(n.text, 1000) || !n.text.trim()) return null;
  return {settings: {subject: s.subject.trim(), level: s.level, students: s.students, manual: s.manual.trim(), preferences: s.preferences.trim()}, notes: j.notes.map(n => ({id: n.id, date: n.date, tag: n.tag, text: n.text.trim()}))};
}
/** Contextul clasei pentru cererile către Plusi: fără date despre elevi, doar setările profesorului. */
export function classContext(title: string, s: ClassSettings): string {
  const parts = [title, s.subject && "disciplina " + s.subject, s.level && "nivel " + (s.level === "sprijin" ? "cu nevoie de sprijin" : s.level), s.students ? s.students + " elevi" : "", s.manual && "manual: " + s.manual].filter(Boolean);
  return parts.join(", ") + (s.preferences ? ". Preferințe: " + s.preferences : "");
}
