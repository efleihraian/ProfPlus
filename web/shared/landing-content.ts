export const LANDING_COMPARE: {feature: string; detail: string; them: string | false; us: string}[] = [
  {feature: "Surse pe care le poți verifica", detail: "Manuale, culegeri, subiecte EN și Bac", them: "Fără sursă sau greu de verificat", us: "Sursa și pagina, la fiecare pasaj folosit"},
  {feature: "Pe clasa și disciplina ta", detail: "Clasă, temă, dificultate", them: "Depinde de cum scrii cererea", us: "Alegi clasa, tema și dificultatea"},
  {feature: "Gata de printat", detail: "Teste cu barem, fișe, planificări, prezentări", them: "Formatare făcută de mână", us: "Editor și export PDF, Word, LaTeX, PowerPoint"},
  {feature: "Portofoliul profesional", detail: "Structura-cadru OMEC 3.858/2026", them: false, us: "Documentele pe secțiuni, cu opis automat"},
  {feature: "Clasele tale", detail: "Documente și conversații pe fiecare clasă", them: "Reiei contextul de fiecare dată", us: "Profi folosește clasa când generează"},
  {feature: "Documentele tale", detail: "Fișierele încărcate ca surse", them: "Termenii diferă de la un serviciu la altul", us: "Private, folosite numai în conversațiile tale"},
];

export const LANDING_PORTFOLIO = [
  {letter: "A", title: "Date personale și de identificare profesională", done: 6, total: 8},
  {letter: "B", title: "Activitate specifică normei: predare, învățare, evaluare", done: 3, total: 10},
  {letter: "C", title: "Activități complementare procesului de învățământ", done: 1, total: 4},
  {letter: "D", title: "Activități de management al clasei", done: 0, total: 8},
  {letter: "E", title: "Evoluția în carieră și dezvoltare profesională", done: 2, total: 4},
];

export const LANDING_CLASSES = [
  {grade: 5, letter: "A", color: "green"},
  {grade: 7, letter: "B", color: "blue"},
  {grade: 8, letter: "A", color: "violet"},
  {grade: 9, letter: "C", color: "ochre"},
] as const;

export const LANDING_SECTIONS = {
  hero: {
    title: "Lecția gata. Portofoliul în ordine.",
    description: "Profi, foca-mascotă a ProfPlus, îți pregătește teste, fișe și planificări din manualele școlare, pe măsura clasei tale. Tu verifici materialele înainte de a le folosi.",
  },
  documents: {
    title: "Din conversație, direct pe hârtie",
    description: "Proiecte de lecție, planificări, unități de învățare, teste și prezentări, la orice disciplină. Le corectezi în editor și le exporți în Word, PDF, LaTeX sau PowerPoint.",
  },
  portfolio: {
    title: "Documentele cerute de lege, într-un singur loc",
    description: "Din anul școlar 2026-2027, OMEC nr. 3.858/2026 cere fiecărui profesor un portofoliu profesional. Contează la definitivat, grade didactice, evaluarea anuală, inspecții și gradația de merit.",
  },
  classes: {
    title: "Fiecare clasă, cu dosarul ei",
    description: "În „Clasele mele” îi spui lui Profi o singură dată cum e clasa. Tot ce generezi pentru ea se potrivește și rămâne salvat acolo.",
  },
  comparison: {
    title: "De ce nu un chatbot oarecare?",
    description: "Un chatbot obișnuit nu știe ce manual folosești, ce cere programa sau ce ai în portofoliu. Profi știe, așa că nu o iei de la capăt la fiecare cerere.",
  },
} as const;
