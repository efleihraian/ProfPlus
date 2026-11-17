export const PLAN_KINDS = ["smalltalk", "quick", "question", "fun", "document", "worksheet", "theory", "planning", "lesson", "presentation", "test", "composed"] as const;
export type PlanKind = typeof PLAN_KINDS[number];
export type GenerationPlan = {kind: PlanKind; grade?: number | null; web?: boolean};
export const PLANS: Record<PlanKind, {label: string; seconds: number}> = {
  smalltalk: {label: "Îți răspund", seconds: 3},
  quick: {label: "Răspund direct, fără căutare în bibliotecă", seconds: 5},
  question: {label: "Caut în surse și îți răspund", seconds: 10},
  fun: {label: "Pregătesc idei de jocuri și activități", seconds: 14},
  document: {label: "Scriu documentul", seconds: 20},
  worksheet: {label: "Scriu fișa de lucru din surse", seconds: 20},
  theory: {label: "Scriu fișa de teorie din manuale", seconds: 18},
  planning: {label: "Scriu planificarea", seconds: 22},
  lesson: {label: "Scriu proiectul de lecție", seconds: 28},
  presentation: {label: "Scriu prezentarea, slide cu slide", seconds: 25},
  test: {label: "Scriu testul și verific fiecare exercițiu", seconds: 35},
  composed: {label: "Aleg exerciții din surse și compun testul", seconds: 50},
};
export const WEB_EXTRA_SECONDS = 14;
export const isPlanKind = (value: unknown): value is PlanKind => typeof value === "string" && (PLAN_KINDS as readonly string[]).includes(value);
export function planFor(f: {light?: "smalltalk" | "quick" | null; fun?: boolean; composed?: boolean; test?: boolean; theory?: boolean; planning?: boolean; lesson?: boolean; presentation?: boolean; exercises?: boolean; document?: boolean}): PlanKind {
  if (f.light === "smalltalk") return "smalltalk";
  if (f.light) return "quick";
  if (f.fun) return "fun";
  if (f.composed) return "composed";
  if (f.test) return "test";
  if (f.theory) return "theory";
  if (f.planning) return "planning";
  if (f.lesson) return "lesson";
  if (f.presentation) return "presentation";
  if (f.exercises) return "worksheet";
  return f.document ? "document" : "question";
}
const GRADES = ["pregătitoare", "I", "a II-a", "a III-a", "a IV-a", "a V-a", "a VI-a", "a VII-a", "a VIII-a", "a IX-a", "a X-a", "a XI-a", "a XII-a", "a XIII-a"];
export function planLabel(plan: GenerationPlan | null): string {
  if (!plan) return "Pregătesc cererea";
  const grade = typeof plan.grade === "number" && GRADES[plan.grade] && !["smalltalk", "quick"].includes(plan.kind) ? " · clasa " + GRADES[plan.grade] : "";
  return (plan.web ? "Caut pe internet informații actuale și îți răspund" : PLANS[plan.kind].label) + grade;
}
export const planSeconds = (plan: GenerationPlan | null): number => (plan ? PLANS[plan.kind].seconds + (plan.web ? WEB_EXTRA_SECONDS : 0) : 6);
export function progressFraction(elapsedMs: number, seconds: number): number {
  const t = Math.max(0, elapsedMs) / 1000 / Math.max(1, seconds);
  return Math.min(0.97, 1 - Math.exp(-2.3 * t));
}
export function remainingText(elapsedMs: number, seconds: number): string {
  const left = seconds - Math.max(0, elapsedMs) / 1000;
  if (left > 12) return "încă ~" + Math.ceil(left / 5) * 5 + " s";
  if (left > 3) return "încă ~" + Math.ceil(left) + " s";
  if (left > -Math.max(8, seconds * 0.5)) return "aproape gata";
  return elapsedMs >= 45000 ? "limita este de aproximativ 6 minute; poți opri oricând" : "durează puțin mai mult decât de obicei";
}
