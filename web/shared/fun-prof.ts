// P-211 — Fun Prof: partenerul creativ al profesorului pentru lecții interactive (jocuri, reguli, fișe speciale).
// Profi propune întâi idei în chat, apoi dezvoltă ideea aleasă într-un material de tipărit. Modul pornește din
// „Creează → Fun Prof”, din exemplul Fun Prof din Asistent (site și aplicație) sau dintr-un mesaj care începe cu
// „Fun Prof”; după primul răspuns rămâne ales pentru conversație. P-217: fără buton/casetă pe Acasă. Modul pur: folosit de server, site și aplicație.
export const FUN_PROF_ID = "fun";
export const FUN_PROF_PREFIX = "Fun Prof: ";
/** Mesajul pregătit de butonul „Fun Prof” când profesorul nu a scris încă nimic (se completează tema). */
export const FUN_PROF_STARTER = "Fun Prof: propune-mi idei de jocuri și activități interactive pentru lecția despre ";
export const FUN_PROF_INTRO = "Idei de jocuri, reguli și fișe speciale pentru lecții interactive. Profi îți propune variante, apoi pregătește materialul ales, gata de tipărit.";

const fold = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const NAMED = /^\s*fun\s*-?\s*prof\b/;
const IDEAS = /\b(?:idei|idee|propune\w*|sugestii|sugereaza|recomanda)\b/;
const PLAYFUL = /\b(?:jocur\w*|joc|ludic\w*|gamifica\w*|escape\s*room|bingo|quiz|kahoot|ghicitor\w*|rebus\w*|vanatoare de comori|stafeta|concurs\w*|dramatizar\w*|activitat\w* (?:interactiv\w*|distractiv\w*|amuzant\w*|captivant\w*)|lectie (?:interactiva|distractiva|altfel))\b/;
/** Un mesaj care cere explicit Fun Prof sau idei de jocuri/activități interactive (conservator: altfel, fluxul obișnuit). */
export function funProfRequested(text: string): boolean {
  const t = fold(text);
  return NAMED.test(t) || (IDEAS.test(t) && PLAYFUL.test(t));
}

export const FUN_PROF_RULES = `
FUN PROF (lecții interactive și distractive): ești partenerul creativ al profesorului. Scopul este învățarea, prin joc.
- Când profesorul cere idei sau cere explicit mai multe opțiuni: isDocument=false. Răspunde conversațional, cald și concret: o propoziție scurtă despre tema și clasa înțelese, apoi 3–4 idei numerotate, diferite ca tip (de exemplu joc pe echipe, escape room cu indicii, bingo sau cartonașe, ștafetă, detectivi, dramatizare, quiz cu puncte, vânătoare de comori, „adevărat sau fals” cu mișcare). Pentru fiecare idee: un nume atractiv în aldin; cum se joacă (2–3 propoziții); ce exersează (legătura cu tema și cu programa); durata; materialele (simple, ieftine, fără tehnologie obligatorie); o variantă pentru elevii care au nevoie de sprijin sau de provocare. Leagă ideile de sursele [n] când există.
- Dacă lipsesc tema sau clasa, oferă o variantă adaptabilă. Întreabă la final doar pentru informația care schimbă esențial rezultatul. Încheie cu o propunere: ce poți pregăti mai departe (reguli, cartonașe, fișă-joc, punctaj, varianta pentru ora online).
- Când profesorul alege o idee sau cere un material sau joc concret („dezvoltă”, „generează”, „fă un joc / cartonașele / regulile / fișa”): isDocument=true și reply este materialul complet, gata de tipărit: titlu, instrucțiuni scurte și conținutul cerut. Pentru un joc include durata, materialele, regulile pas cu pas și conținutul jocului (cartonașe sau întrebări în tabele, indicii și coduri pentru escape room, fișa-joc pentru elevi cu spații de completat); adaugă punctaj, diferențiere sau răspunsuri numai dacă sunt cerute ori indispensabile jocului. Pentru o fișă simplă, livrează direct pagina pentru elevi. Conținutul științific trebuie să fie corect și potrivit clasei, din surse când există; nu inventa date.
- Activități incluzive și sigure: fără umilirea celor care pierd, fără date personale ale elevilor, potrivite vârstei, cu roluri pentru toți. Nu folosi Proveniență pe fiecare item în aceste materiale.
- followUps: 2–4 pași următori scurți (cel mult 80 de caractere fiecare), scriși ca cereri ale profesorului către tine, potriviți răspunsului (de exemplu „Dezvoltă ideea 2 cu cartonașe de tipărit”, „Fă o variantă de 15 minute”, „Adaugă o fișă-joc pentru acasă”). Fără numerotare și fără ghilimele.`;

/** Formatul răspunsului în modul Fun Prof: contractul obișnuit plus propunerile de continuare. */
export function withFollowUps<T extends {schema: {properties: Record<string, unknown>; required: string[]}}>(format: T): T {
  return {...format, schema: {...format.schema, properties: {...format.schema.properties, followUps: {type: "array", items: {type: "string"}}}, required: [...format.schema.required, "followUps"]}};
}
/** Cel mult 4 propuneri, text simplu, fiecare de cel mult 120 de caractere. */
export function cleanFollowUps(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v): v is string => typeof v === "string").map(v => v.replace(/[\u0000-\u001f]+/g, " ").replace(/^[\s\-•*\d.)]+/, "").replace(/^["„“]|["”“]$/g, "").trim()).filter(v => v.length >= 3 && v.length <= 120))].slice(0, 4);
}
/** Validarea la salvarea istoricului (aceleași limite). */
export const validFollowUps = (value: unknown) => value === undefined || (Array.isArray(value) && value.length <= 4 && value.every(v => typeof v === "string" && v.length <= 120));
