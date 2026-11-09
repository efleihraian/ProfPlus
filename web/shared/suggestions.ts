// Sugestiile de pornire din chat, potrivite profilului didactic (disciplina și ciclul). Folosite de site și de aplicația mobilă.
import type {Stage, TeachingProfile} from "./api-types";

export type Suggestion = {label: string; prompt: string};
type Topic = [topic: string, grade: number];

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"];
const gradeText = (grade: number) => (grade === 1 ? "clasa I" : `clasa a ${ROMAN[grade]}-a`);
// O clasă reprezentativă pentru disciplinele fără teme proprii.
const STAGE_GRADE: Record<Stage, number> = {primary: 3, middle: 6, high: 10};

// Teme reale din programă, câte trei pe ciclu, pentru disciplinele cele mai des alese.
const TOPICS: Record<string, Partial<Record<Stage, Topic[]>>> = {
  matematica: {
    primary: [["adunarea și scăderea până la 1000", 3], ["tabla înmulțirii", 2], ["fracții simple", 4]],
    middle: [["criteriile de divizibilitate", 6], ["adunarea fracțiilor", 5], ["aria triunghiului", 7]],
    high: [["funcția de gradul al II-lea", 9], ["progresiile aritmetice", 9], ["limitele de funcții", 11]],
  },
  romana: {
    primary: [["textul narativ", 3], ["părțile de vorbire", 4], ["scrierea unei compuneri", 4]],
    middle: [["caracterizarea personajului", 6], ["părțile de vorbire flexibile", 5], ["textul descriptiv", 5]],
    high: [["romanul interbelic", 11], ["comentariul unei poezii de Eminescu", 10], ["eseul argumentativ", 12]],
  },
  fizica: {
    middle: [["viteza și mișcarea uniformă", 6], ["densitatea corpurilor", 6], ["circuitul electric simplu", 8]],
    high: [["legile lui Newton", 9], ["lucrul mecanic și energia", 9], ["curentul alternativ", 11]],
  },
  chimie: {
    middle: [["structura atomului", 7], ["tabelul periodic", 7], ["reacțiile chimice", 8]],
    high: [["soluțiile și concentrația", 9], ["alcani", 10], ["echilibrul chimic", 11]],
  },
  biologie: {
    middle: [["fotosinteză", 5], ["celulă", 6], ["sistemul digestiv", 7]],
    high: [["diviziunea celulară", 9], ["genetica mendeliană", 12], ["sistemul nervos", 11]],
  },
  istorie: {
    middle: [["Grecia antică", 5], ["Evul Mediu românesc", 6], ["Marea Unire", 8]],
    high: [["revoluțiile moderne", 10], ["România interbelică", 12], ["Războiul Rece", 11]],
  },
  geografie: {
    middle: [["relieful României", 8], ["clima Pământului", 5], ["continente", 6]],
    high: [["resursele naturale", 10], ["populația lumii", 10], ["Uniunea Europeană", 11]],
  },
  informatica: {
    middle: [["algoritmii simpli", 6], ["structurile repetitive", 7], ["siguranța online", 5]],
    high: [["vectorii în C++", 10], ["recursivitate", 11], ["bazele de date", 12]],
  },
  engleza: {
    middle: [["Present Simple și Present Continuous", 5], ["vocabularul despre școală", 5], ["Past Simple", 6]],
    high: [["propozițiile condiționale", 10], ["vorbirea indirectă", 11], ["scrierea unui eseu", 12]],
  },
};
// Învățătorii predau mai multe discipline; temele amestecă matematica, limba română și științele.
const PRIMARY: Topic[] = [["adunarea cu trecere peste ordin", 2], ["textul narativ", 3], ["ciclul de viață al plantelor", 3]];
const DEFAULT: Topic[] = [["adunarea fracțiilor", 5], ["textul narativ", 6], ["fotosinteză", 5]];

const key = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("ro");
function discipline(subject: string) {
  const k = key(subject);
  if (k.includes("matematic")) return "matematica";
  if (k.includes("romana")) return "romana";
  if (k.includes("informatic") || /\btic\b/.test(k)) return "informatica";
  if (k.includes("englez")) return "engleza";
  return ["fizica", "chimie", "biologie", "istorie", "geografie"].find((d) => k.includes(d)) ?? null;
}

const TEMPLATES = [
  (topic: string, grade: string) => `Fă un test de 10 itemi despre ${topic}, ${grade}`,
  (topic: string, grade: string) => `Propune un plan de lecție despre ${topic}, ${grade}`,
  (topic: string, grade: string) => `Creează o fișă de lucru despre ${topic}, ${grade}`,
];
const KINDS = ["Test", "Plan de lecție", "Fișă de lucru"];
const capitalized = (text: string) => text.charAt(0).toLocaleUpperCase("ro") + text.slice(1);

/** Trei sugestii: un test, un plan de lecție și o fișă, pe teme ale disciplinei și ciclurilor din profil. */
export function suggestionsFor(profile: TeachingProfile | null | undefined): Suggestion[] {
  let topics: Topic[] = DEFAULT;
  if (profile?.role === "primary") topics = PRIMARY;
  else if (profile?.stages.length) {
    const own = TOPICS[discipline(profile.subject) ?? ""];
    // Cu mai multe cicluri, sugestiile se împart între ele.
    topics = [0, 1, 2].map((i) => {
      const stage = profile.stages[i % profile.stages.length];
      return own?.[stage]?.[i] ?? [profile.subject.toLocaleLowerCase("ro"), STAGE_GRADE[stage]];
    });
  }
  return topics.map(([topic, grade], i) => ({
    label: `${KINDS[i]}: ${capitalized(topic)}`,
    prompt: TEMPLATES[i](topic, gradeText(grade)),
  }));
}
