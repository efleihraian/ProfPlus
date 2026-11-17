export const CLASS_SECTIONS = [
  {id: "teste", documentType: "test", title: "Teste", desc: "Evaluări și teste pentru clasă."},
  {id: "fise", documentType: "worksheet", title: "Fișe de lucru", desc: "Exerciții pentru lucru la clasă."},
  {id: "teorie", documentType: "theory", title: "Fișe de teorie", desc: "Noțiuni și exemple pentru elevi."},
  {id: "planificari", documentType: "planning", title: "Planificări", desc: "Calendarul materiei pe anul școlar."},
  {id: "unitati", documentType: "unit", title: "Unități de învățare", desc: "Obiective și activități pentru o unitate."},
  {id: "proiecte", documentType: "lesson", title: "Proiecte de lecție", desc: "Etapele și activitățile unei lecții."},
  {id: "bareme", documentType: "rubric", title: "Bareme", desc: "Criterii de evaluare și punctaj."},
  {id: "prezentari", documentType: "presentation", title: "Prezentări", desc: "Diapozitive pentru predare."},
  {id: "activitati", documentType: "fun", title: "Fun Prof · jocuri și activități", desc: "Jocuri și materiale interactive."},
] as const;
export type ClassSection = typeof CLASS_SECTIONS[number]["id"];
export const CLASS_OBSERVATIONS = {id: "observatii", title: "Observații", desc: "Notele tale despre lecții, evaluări și organizare."} as const;
export const CLASS_CARDS = [CLASS_OBSERVATIONS, ...CLASS_SECTIONS] as const;
export type ClassCard = typeof CLASS_CARDS[number];
export type ClassCardId = ClassCard["id"];
export const CLASS_SECTION_COLORS: Record<ClassCardId, string> = {
  observatii: "#784F2E",
  teste: "#39614E",
  fise: "#2E596B",
  teorie: "#595784",
  planificari: "#7F445A",
  unitati: "#545931",
  proiecte: "#664970",
  bareme: "#3C587A",
  prezentari: "#8D4B3A",
  activitati: "#27615E",
};
export const CLASS_CARD_ICONS: Record<ClassCardId, string> = {
  planificari: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  proiecte: "M12 6c-3-3-6-3-10-2v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-4-1-7-1-10 2zm0 0v15",
  teste: "M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3M9 2h6v4H9zm-1 12 3 3 5-5",
  fise: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zm0 0v7h7M8 13h8m-8 4h8",
  teorie: "M5 3h13a2 2 0 0 1 2 2v16H6a3 3 0 0 1 0-6h14M6 15V3m4 4h6m-6 4h4",
  unitati: "m12 2 10 5-10 5L2 7zm-10 10 10 5 10-5M2 17l10 5 10-5",
  bareme: "m3 6 2 2 4-4m3 3h9M3 15l2 2 4-4m3 3h9",
  prezentari: "M3 4h18M5 4v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4m-7 13v2m-4 3 4-3 4 3",
  activitati: "m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5zm7 0v4m-2-2h4",
  observatii: "M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-6 4V6a2 2 0 0 1 2-2zm3 6h10m-10 4h6",
};
export const MAX_CLASSES = 30;

export const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"];
export const LETTERS = "ABCDEFGHIJ";
export function parseClassTitle(name: string): {g: number; l: string} | null {
  for (let g = 0; g < ROMAN.length; g++) for (const l of LETTERS) if (classTitle(g, l) === name || ((g===0?"Clasa pregătitoare":g===1?"Clasa I":"Clasa a "+ROMAN[g]+"-a")+" "+l)===name) return {g, l};
  return null;
}

export const CLASS_BANNER_OPTIONS = [
  {id: "green", label: "Verde", color: "#28684D"},
  {id: "blue", label: "Albastru", color: "#215F78"},
  {id: "ochre", label: "Arămiu", color: "#8A4D1C"},
  {id: "violet", label: "Violet", color: "#514F91"},
  {id: "rose", label: "Roz închis", color: "#8D3657"},
  {id: "forest", label: "Verde închis", color: "#1B4D36"},
  {id: "teal", label: "Turcoaz", color: "#1D6B68"},
  {id: "indigo", label: "Indigo", color: "#3B4A8C"},
  {id: "plum", label: "Prună", color: "#6A3A6E"},
  {id: "brick", label: "Cărămiziu", color: "#9A3A2B"},
  {id: "olive", label: "Oliv", color: "#56602A"},
  {id: "slate", label: "Ardezie", color: "#3E5160"},
] as const;
export type ClassBannerColor = typeof CLASS_BANNER_OPTIONS[number]["id"];
export const CLASS_BANNER_AUTO_COUNT = 6;
export const isClassBannerColor = (value: unknown): value is ClassBannerColor => CLASS_BANNER_OPTIONS.some(option => option.id === value);

export function classBannerOption(grade: number, letter: string, color?: ClassBannerColor | null): typeof CLASS_BANNER_OPTIONS[number] {
  const selected = CLASS_BANNER_OPTIONS.find(option => option.id === color);
  if (selected) return selected;
  const section = Math.max(0, LETTERS.indexOf(letter.toUpperCase()));
  const count = CLASS_BANNER_AUTO_COUNT;
  return CLASS_BANNER_OPTIONS[((grade + 1 - section) % count + count) % count] ?? CLASS_BANNER_OPTIONS[0];
}

export function classBannerColor(grade: number, letter: string, color?: ClassBannerColor | null): string {
  return classBannerOption(grade, letter, color).color;
}

export function classTitle(g: number, l: string): string {
  return ("Clasa " + ROMAN[g]) + (l ? " " + l : "");
}

export type ClassLevel = "" | "sprijin" | "mediu" | "avansat";
export type ClassSettings = {subject: string; level: ClassLevel; students: number | null; manual: string; preferences: string};
export const CLASS_DIFFICULTY = {sprijin: "usor", mediu: "mediu", avansat: "dificil"} as const;
export type ClassGenerationContext = {title: string; grade: number; settings: ClassSettings; classroom?: ClassroomLink};
export type ClassNote = {id: string; date: string; tag: "lectie" | "evaluare" | "organizare" | "altele"; text: string};
export type ClassroomLink = {courseId: string; name: string; section: string; importedAt: string; topics: string[]; materials: string[]; assignments: string[]};
export const CLASSROOM_LIST_LIMIT = 50, CLASSROOM_TITLE_LIMIT = 160;
export type ClassJournal = {settings: ClassSettings; notes: ClassNote[]; classroom?: ClassroomLink; bannerColor?: ClassBannerColor | null};
export const NOTE_TAGS = [{id: "lectie", label: "Lecție"}, {id: "evaluare", label: "Evaluare"}, {id: "organizare", label: "Organizare"}, {id: "altele", label: "Altele"}] as const;
export const emptyJournal = (): ClassJournal => ({settings: {subject: "", level: "", students: null, manual: "", preferences: ""}, notes: []});
export function filterClassSubjects(subjects: readonly string[], query: string): string[] {
  const normalize = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("ro");
  const words = normalize(query).trim().split(/\s+/);
  return subjects.filter(subject => {
    const name = normalize(subject);
    return words.every(word => name.includes(word));
  });
}

export function classSettingsWithSubject(settings: ClassSettings, profileSubject?: string): ClassSettings {
  const subject = profileSubject?.trim();
  return settings.subject.trim() || !subject || subject === "*" ? settings : {...settings, subject: subject.slice(0, 80)};
}
export function classContext(title: string, s: ClassSettings, classroom?: ClassroomLink): string {
  const parts = [title, s.subject && "disciplina " + s.subject, s.level && "nivel " + (s.level === "sprijin" ? "cu nevoie de sprijin" : s.level), s.students ? s.students + " elevi" : "", s.manual && "manual: " + s.manual].filter(Boolean);
  return parts.join(", ") + (s.preferences ? ". Preferințe: " + s.preferences : "") + classroomContext(classroom);
}
export function classroomContext(classroom?: ClassroomLink): string {
  if (!classroom) return "";
  const list = (label: string, items: string[], max: number) => items.length ? ". " + label + ": " + items.slice(0, max).join("; ") : "";
  return list("Capitole parcurse la clasă (Google Classroom)", classroom.topics, 20) + list("Teme date recent", classroom.assignments, 8);
}
