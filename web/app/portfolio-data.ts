import {useStored} from "./use-stored";

export type PortfolioState = {done: Record<string, boolean>; extra: Record<string, boolean>};
export function usePortfolio() { return useStored<PortfolioState>("portfolio", {done: {}, extra: {}}); }
export function usePortfolioProgress() {
  const [state] = usePortfolio();
  const counted = PORTFOLIO.flatMap(s => s.items).filter(i => !i[3] || state.extra[i[0]]);
  const done = counted.filter(i => state.done[i[0]]).length;
  return {done, total: counted.length, pct: counted.length ? Math.round(done * 100 / counted.length) : 0};
}
export const SECTION_BADGE: Record<string, {bg: string; color: string; glow: string}> = {
  a: {bg: "#E8F3EC", color: "#2F7D5B", glow: "rgba(47,125,91,0.18)"},
  b: {bg: "#DCEBE2", color: "#1B4D36", glow: "rgba(27,77,54,0.2)"},
  c: {bg: "#E3F8EF", color: "#047857", glow: "rgba(16,185,129,0.2)"},
  d: {bg: "#E8F3EC", color: "#2F7D5B", glow: "rgba(47,125,91,0.18)"},
  e: {bg: "#DCEBE2", color: "#1B4D36", glow: "rgba(27,77,54,0.2)"},
};

export type PortfolioItem =[id: string, name: string, desc: string, optional: 0 | 1, generate: 0 | 1, link?: string, linkLabel?: string];
export type PortfolioSection = { id: string; letter: string; title: string; items: PortfolioItem[] };
const EU = 'https://europass.europa.eu/ro';
export const PORTFOLIO: PortfolioSection[] =
[
  { id: 'a', letter: 'A', title: 'Date personale și de identificare profesională', items: [
    ['a1', 'Curriculum vitae (format Europass)', 'Completat, semnat și datat.', 0, 1, EU, 'Editor Europass'],
    ['a2', 'Copie a actului de identitate', 'Document de identificare.', 0, 0],
    ['a3', 'Certificat de naștere / acte de schimbare a numelui', 'Doar dacă este cazul.', 1, 0],
    ['a4', 'Diplome și certificate de studii', 'Liceu pedagogic, postliceal, universitar, postuniversitar sau de conversie, cu foi matricole ori suplimente.', 0, 0],
    ['a5', 'Decizia de numire sau de transfer', 'Actul de încadrare pe post.', 0, 0],
    ['a6', 'Contract individual de muncă și fișa postului', 'Cu toate actele adiționale.', 0, 0],
    ['a7', 'Decizia anuală de încadrare', 'Pentru anul școlar în curs.', 0, 0],
    ['a8', 'Adeverințe de vechime', 'Vechimea în învățământ.', 0, 0],
    ['a9', 'Certificate de definitivat și grade didactice', 'Sau ordinul de acordare a gradului I pe baza doctoratului.', 1, 0],
    ['a10', 'Comunicarea calificativului anual', 'Rezultatul evaluării anuale.', 0, 0],
    ['a11', 'Decizia de acordare a gradației de merit', 'Doar dacă ai primit gradație.', 1, 0]
  ] },
  { id: 'b', letter: 'B', title: 'Activitate specifică normei: predare-învățare-evaluare', items: [
    ['b1', 'Planificări anuale / calendaristice', 'Pentru fiecare disciplină și clasă.', 0, 1],
    ['b2', 'Curriculum la decizia școlii', 'Programa opționalului elaborat în oferta școlii.', 0, 1],
    ['b3', 'Proiecte de lecție / secvențe de instruire', 'Proiecte sau secvențe reprezentative.', 0, 1],
    ['b4', 'Planuri remediale sau de ameliorare', 'Pentru elevii care au nevoie de sprijin.', 0, 1],
    ['b5', 'Planuri de intervenție personalizată (CES)', 'Pentru elevii cu cerințe educaționale speciale.', 0, 1],
    ['b6', 'Fișe de lucru diferențiate / resurse educaționale deschise', 'Materiale folosite la clasă.', 0, 1],
    ['b7', 'Instrumente de evaluare inițială, formativă și sumativă', 'Inclusiv în format digital.', 0, 1],
    ['b8', 'Pregătirea pentru examene și concursuri', 'Dovezi ale implicării în activități de performanță.', 1, 0],
    ['b9', 'Rezultate la evaluări naționale, bacalaureat, certificare', 'Rezultatele elevilor tăi.', 0, 0],
    ['b10', 'Rezultate la concursuri și diplome ale elevilor', 'Diplome obținute de elevii pregătiți de tine.', 0, 0],
    ['b11', 'Evidența progresului elevilor la activitățile remediale', 'Cum au evoluat elevii sprijiniți.', 0, 1]
  ] },
  { id: 'c', letter: 'C', title: 'Activități complementare procesului de învățământ', items: [
    ['c1', 'Comisii, consilii, asociații, comisii de examen și concurs', 'Calitatea deținută (președinte, membru etc.); metodist sau grupuri de lucru, după caz.', 0, 0],
    ['c2', 'Activități extracurriculare', 'Planificare, organizare și participare: culturale, sportive, voluntariat, excursii.', 0, 1],
    ['c3', 'Programe naționale', 'Școala altfel, Masă sănătoasă, Școală după școală, școala de vară.', 0, 1],
    ['c4', 'Promovarea imaginii școlii', 'Oferta educațională, târguri ale educației.', 0, 0]
  ] },
  { id: 'd', letter: 'D', title: 'Activități de management al clasei', items: [
    ['d1', 'Fișe psihopedagogice', 'Pentru cunoașterea elevilor.', 0, 1],
    ['d2', 'Evidența elevilor care necesită sprijin', 'Elevi cu nevoi de sprijin educațional.', 0, 1],
    ['d3', 'Planuri de consiliere pentru elevii cu risc de abandon', 'Avizate de director.', 0, 1],
    ['d4', 'Plan de prevenire a absenteismului', 'Avizat de director.', 0, 1],
    ['d5', 'Analiza progresului clasei', 'Situația și evoluția clasei.', 0, 1],
    ['d6', 'Graficul consultațiilor cu părinții și procesele-verbale', 'Inclusiv ședințele comitetului de părinți.', 0, 1],
    ['d7', 'Informarea despre reguli de conduită și ROI', 'Dovezi ale informării elevilor și părinților, inclusiv despre procedurile de acces.', 0, 0],
    ['d8', 'Informarea părinților despre disciplină și frecvență', 'Situații disciplinare și monitorizarea frecvenței.', 0, 0]
  ] },
  { id: 'e', letter: 'E', title: 'Evoluția în carieră și dezvoltare profesională', items: [
    ['e1', 'Formare continuă și credite profesionale', 'Certificate, atestate, adeverințe ECTS / CTP.', 0, 0],
    ['e2', 'Activitate metodică și științifică', 'Participări și susțineri la cercuri, conferințe, ateliere.', 0, 0],
    ['e3', 'Publicații', 'Copertă și pagini de identificare cu ISBN / ISSN.', 0, 0],
    ['e4', 'Proiecte și programe educaționale', 'Contract sau decizie, produse realizate, rapoarte.', 0, 1],
    ['e5', 'Funcții de conducere, îndrumare și control', 'Mai ales pentru directori și inspectori.', 1, 0]
  ] }
]
;
