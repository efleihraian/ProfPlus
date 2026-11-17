export const CLASSROOM_SCOPE = "https://www.googleapis.com/auth/classroom.courses.readonly";
export const CLASSROOM_DETAIL_SCOPES = {
  topics: "https://www.googleapis.com/auth/classroom.topics.readonly",
  materials: "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
  assignments: "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
  students: "https://www.googleapis.com/auth/classroom.rosters.readonly",
} as const;
export const CLASSROOM_SCOPES = [CLASSROOM_SCOPE, ...Object.values(CLASSROOM_DETAIL_SCOPES)];
export const CLASSROOM_DETAIL_COURSES = 30;
export const CLASSROOM_LIST_LIMIT = 50, CLASSROOM_TITLE_LIMIT = 160, CLASSROOM_MAX_STUDENTS = 60;
export const CLASSROOM_CALLBACK_PATH = "/auth/classroom/callback";
export const CLASSROOM_APP_RETURN = "profplus://auth/classroom";
export const CLASSROOM_CODE_PARAM = "gc_code", CLASSROOM_STATE_PARAM = "gc_state", CLASSROOM_ERROR_PARAM = "gc_error";
export const CLASSROOM_MAX_COURSES = 100;
export const CLASSROOM_KIND_PARAM = "gc_kind", CLASSROOM_FILES_PARAM = "gc_files";
export const DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";
export const DRIVE_MAX_FILES = 10, DRIVE_MAX_BYTES = 10 * 1024 * 1024;

const ROMANS = ["XIII", "XII", "XI", "IX", "X", "VIII", "VII", "VI", "IV", "V", "III", "II", "I"];
const ROMAN_VALUE: Record<string, number> = {I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12, XIII: 13};
const LETTER = "[A-J]";
const TAIL = "(?:\\s*-\\s*A(?![A-Z0-9]))?(?:\\s*[-_.]?\\s*(" + LETTER + "))?(?![A-Z0-9])";
const ARABIC = new RegExp("(?<![A-Z0-9/.,])(1[0-3]|[1-9])" + TAIL, "g");
const ROMAN = new RegExp("(?<![A-Z0-9])(" + ROMANS.join("|") + ")" + TAIL, "g");
const PREP = new RegExp("(?:PREGATITOARE|(?<![A-Z0-9])CP(?![A-Z0-9]))(?:\\s*[-_.]?\\s*(" + LETTER + "))?(?![A-Z0-9])", "g");
const NOISE = /(?:SEMESTRUL|SEM\.?|MODULUL|MODUL|GRUPA|GR\.?|PARTEA|LIMBA MODERNA|L)\s*(?:XIII|XII|XI|IX|X|VIII|VII|VI|IV|V|III|II|I|\d+)(?![A-Z0-9])|(?:19|20)\d\d(?:\s*[-/]\s*(?:19|20)?\d\d)?/g;

const plain = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

export type ClassGuess = {g: number | null; l: string | null};

export function guessClass(text: string): ClassGuess {
  const source = plain(text).replace(NOISE, " ");
  let best: ClassGuess = {g: null, l: null}, score = 0;
  const consider = (g: number, l: string | undefined, weight: number) => {
    const s = weight + (l ? 10 : 0);
    if (s > score) { score = s; best = {g, l: l || null}; }
  };
  for (const m of source.matchAll(PREP)) consider(0, m[1], 3);
  for (const m of source.matchAll(ARABIC)) consider(Number(m[1]), m[2], 2);
  for (const m of source.matchAll(ROMAN)) {
    const before = source.slice(Math.max(0, (m.index ?? 0) - 8), m.index ?? 0);
    const marked = /CLASA\s*(?:A\s*)?$/.test(before) || /(?:^|[^A-Z0-9])A\s+$/.test(before) || /-\s*A(?![A-Z0-9])/.test(m[0]);
    if (m[1] === "I" && !marked && !m[2]) continue;
    consider(ROMAN_VALUE[m[1]], m[2], marked ? 3 : 1);
  }
  return best;
}

const SUBJECTS: [RegExp, string][] = [
  [/MATE/, "Matematică"],
  [/ROMANA|\bLLR\b|\bLRO\b/, "Limba și literatura română"],
  [/INFORMATIC|\bINFO\b|\bTIC\b/, "Informatică și TIC"],
  [/FIZIC/, "Fizică"],
  [/CHIMI/, "Chimie"],
  [/BIOLOG|\bBIO\b/, "Biologie"],
  [/GEOGRAF|\bGEO\b/, "Geografie"],
  [/ISTORI/, "Istorie"],
  [/ENGLEZ/, "Limba engleză"],
  [/FRANCEZ/, "Limba franceză"],
  [/GERMAN/, "Limba germană"],
  [/SPANIOL/, "Limba spaniolă"],
  [/LATIN/, "Limba latină"],
  [/EDUCATIE FIZICA|\bSPORT\b|\bEFS\b/, "Educație fizică și sport"],
  [/EDUCATIE MUZICALA|MUZIC/, "Educație muzicală"],
  [/EDUCATIE PLASTICA|DESEN|ARTE/, "Educație plastică"],
  [/EDUCATIE TEHNOLOGICA|TEHNOLOG/, "Educație tehnologică"],
  [/EDUCATIE SOCIALA|CIVIC/, "Educație socială"],
  [/RELIGI/, "Religie"],
  [/LOGICA/, "Logică"],
  [/PSIHOLOG/, "Psihologie"],
  [/ECONOMI/, "Economie"],
  [/FILOSOFI|FILOZOFI/, "Filosofie"],
  [/SOCIOLOG/, "Sociologie"],
  [/CONSILIERE|DIRIGEN/, "Consiliere și dezvoltare personală"],
  [/STIINTE/, "Științe"],
];
export function guessSubject(text: string): string {
  const source = plain(text);
  return SUBJECTS.find(([pattern]) => pattern.test(source))?.[1] ?? "";
}

export type ClassroomCourse = {id: string; name: string; section: string; g: number | null; l: string | null; subject: string; students: number | null; topics: string[]; materials: string[]; assignments: string[]};
export type CourseDetails = {students: number | null; topics: string[]; materials: string[]; assignments: string[]};
export const emptyDetails = (): CourseDetails => ({students: null, topics: [], materials: [], assignments: []});

const clean = (value: unknown, max: number) => typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";

export function titles(raw: unknown, key: "name" | "title"): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    const title = item && typeof item === "object" ? clean((item as Record<string, unknown>)[key], CLASSROOM_TITLE_LIMIT) : "";
    if (title && !out.includes(title)) out.push(title);
    if (out.length >= CLASSROOM_LIST_LIMIT) break;
  }
  return out;
}

export function mapCourses(raw: unknown): ClassroomCourse[] {
  if (!Array.isArray(raw)) return [];
  const out: ClassroomCourse[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const c = item as {id?: unknown; name?: unknown; section?: unknown; courseState?: unknown};
    if (c.courseState !== undefined && c.courseState !== "ACTIVE") continue;
    const name = clean(c.name, 100), section = clean(c.section, 60);
    if (!name || typeof c.id !== "string" || !/^[0-9]{1,32}$/.test(c.id)) continue;
    const candidates = [guessClass(name), guessClass(section), guessClass(name + " " + section)];
    const guess = candidates.find(c => c.g !== null && c.l) ?? candidates.find(c => c.g !== null) ?? candidates[0];
    out.push({id: c.id, name, section, g: guess.g, l: guess.l, subject: guessSubject(name) || guessSubject(section), ...emptyDetails()});
    if (out.length >= CLASSROOM_MAX_COURSES) break;
  }
  return out;
}

export function courseSummary(c: CourseDetails): string {
  const count = (n: number, one: string, many: string) => n ? n + " " + (n === 1 ? one : many) : "";
  return [c.students !== null ? count(c.students, "elev", "elevi") : "", count(c.topics.length, "capitol", "capitole"), count(c.materials.length, "material", "materiale"), count(c.assignments.length, "temă", "teme")].filter(Boolean).join(" · ");
}

type Settings = {subject: string; level: string; students: number | null; manual: string; preferences: string};
type Journal<S extends Settings, N> = {settings: S; notes: N[]; classroom?: unknown};
export function journalWithImport<S extends Settings, N>(journal: Journal<S, N>, course: ClassroomCourse & {subject: string}, today: string) {
  const subject = journal.settings.subject || course.subject.trim().slice(0, 80);
  const students = course.students !== null ? Math.min(course.students, CLASSROOM_MAX_STUDENTS) : journal.settings.students;
  return {...journal, settings: {...journal.settings, subject, students}, classroom: {courseId: course.id, name: course.name, section: course.section, importedAt: today, topics: course.topics, materials: course.materials, assignments: course.assignments}};
}

export type ImportChoice = {selected: boolean; g: number | null; l: string | null};
export type ImportStatus = "ready" | "update" | "existing" | "duplicate" | "incomplete" | "over-limit" | "skipped";

export function importPlan(choices: ImportChoice[], existing: {g: number; l: string}[], maxClasses: number): ImportStatus[] {
  const taken = new Set<string>();
  let free = Math.max(0, maxClasses - existing.length);
  return choices.map(choice => {
    if (choice.g === null || !choice.l) return choice.selected ? "incomplete" : "skipped";
    const key = choice.g + ":" + choice.l, owned = existing.some(c => c.g === choice.g && c.l === choice.l);
    if (!choice.selected) return owned ? "existing" : "skipped";
    if (taken.has(key)) return "duplicate";
    if (owned) { taken.add(key); return "update"; }
    if (free <= 0) return "over-limit";
    taken.add(key); free--;
    return "ready";
  });
}
export const IMPORT_STATUS_LABEL: Record<ImportStatus, string> = {
  ready: "Se va adăuga",
  update: "Clasa există: se actualizează cu datele din Classroom",
  existing: "Deja în lista ta; bifează ca să o actualizezi",
  duplicate: "Aceeași clasă este aleasă mai sus",
  incomplete: "Alege clasa și litera",
  "over-limit": "Peste limita de clase a contului",
  skipped: "Nu se importă",
};
export const importLabel = (status: ImportStatus, choice: ImportChoice) => status === "skipped" && (choice.g === null || !choice.l) ? "Alege clasa și litera ca să îl imporți" : IMPORT_STATUS_LABEL[status];

const DRIVE_TYPES: Record<string, string> = {
  "application/pdf": "pdf", "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "text/plain": "txt", "text/markdown": "md", "text/html": "html",
};
const DRIVE_EXPORTS: Record<string, [string, string]> = {
  "application/vnd.google-apps.document": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  "application/vnd.google-apps.presentation": ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
  "application/vnd.google-apps.spreadsheet": ["application/pdf", "pdf"],
};
export const DRIVE_PICKER_TYPES = [...Object.keys(DRIVE_TYPES), ...Object.keys(DRIVE_EXPORTS)];
export type DriveTarget = {name: string; exportMime: string | null};
export function driveTarget(name: unknown, mimeType: unknown): DriveTarget | null {
  if (typeof mimeType !== "string") return null;
  const exported = DRIVE_EXPORTS[mimeType], ext = exported?.[1] ?? DRIVE_TYPES[mimeType];
  if (!ext) return null;
  const base = clean(name, 170).replace(/[/\\]/g, "_") || "Document";
  return {name: base.toLowerCase().endsWith("." + ext) ? base : base + "." + ext, exportMime: exported?.[0] ?? null};
}
export type DriveImportResult = {name: string; ok: boolean; message: string};
