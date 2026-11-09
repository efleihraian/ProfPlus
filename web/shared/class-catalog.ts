// Clasele profesorului: secțiunile, numele standard și contextul trimis lui Profi.
// Comun site-ului (web/lib/class-workspace.ts îl reexportă) și aplicației mobile; fișierul nu importă nimic.

export const CLASS_SECTIONS = [
  {id: "planificari", title: "Planificări", desc: "Planificarea anuală și calendaristică a clasei.", prompt: "planificarea calendaristică"},
  {id: "proiecte", title: "Proiecte de lecție", desc: "Lecțiile pregătite pentru această clasă.", prompt: "un proiect de lecție"},
  {id: "teste", title: "Teste și evaluări", desc: "Evaluări inițiale, formative și sumative.", prompt: "un test de evaluare cu barem"},
  {id: "fise", title: "Fișe de lucru", desc: "Fișe diferențiate și resurse pentru clasă.", prompt: "o fișă de lucru"},
] as const;
export type ClassSection = typeof CLASS_SECTIONS[number]["id"];
export const MAX_CLASSES = 30;

export const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"];
export const LETTERS = "ABCDEFGHIJ";
export function classTitle(g: number, l: string): string {
  return ("Clasa " + ROMAN[g]) + (l ? " " + l : "");
}

export type ClassLevel = "" | "sprijin" | "mediu" | "avansat";
export type ClassSettings = {subject: string; level: ClassLevel; students: number | null; manual: string; preferences: string};
export type ClassNote = {id: string; date: string; tag: "lectie" | "evaluare" | "organizare" | "altele"; text: string};
export type ClassJournal = {settings: ClassSettings; notes: ClassNote[]};
export const NOTE_TAGS = [{id: "lectie", label: "Lecție"}, {id: "evaluare", label: "Evaluare"}, {id: "organizare", label: "Organizare"}, {id: "altele", label: "Altele"}] as const;
export const emptyJournal = (): ClassJournal => ({settings: {subject: "", level: "", students: null, manual: "", preferences: ""}, notes: []});
/** Contextul clasei pentru cererile către Profi: fără date despre elevi, doar setările profesorului. */
export function classContext(title: string, s: ClassSettings): string {
  const parts = [title, s.subject && "disciplina " + s.subject, s.level && "nivel " + (s.level === "sprijin" ? "cu nevoie de sprijin" : s.level), s.students ? s.students + " elevi" : "", s.manual && "manual: " + s.manual].filter(Boolean);
  return parts.join(", ") + (s.preferences ? ". Preferințe: " + s.preferences : "");
}
