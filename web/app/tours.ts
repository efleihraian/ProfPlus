import type {TourStep} from "./plusi-tour";
/** Pașii turului ghidat de Plusi pentru fiecare pagină. Pașii fără element vizibil sunt săriți automat. */
export const TOURS: Record<string, TourStep[]> = {
  acasa: [
    {target: ".shell-tabs", title: "Bine ai venit în ProfPlus!", text: "Sunt Plusi și te plimb puțin prin aplicație. De aici treci între Acasă, Asistentul virtual, Documentele personale și Clasele tale."},
    {target: '[aria-labelledby="ai-home-titlu"]', title: "Întreabă-mă orice", text: "Scrie aici o întrebare despre o lecție, un test sau o fișă. Te duc direct în Asistent și îți răspund din manuale, cu surse."},
    {target: "main .plusi-button", title: "Eu sunt Plusi", text: "Mă poți atinge oricând: sar, salut sau mă scufund. Te ajut pe fiecare pagină."},
    {target: '[aria-labelledby="docs-home-titlu"]', title: "Portofoliul profesional", text: "Vezi cât din portofoliul obligatoriu ai completat și mergi direct la documentele care lipsesc."},
    {target: "#stiri", title: "Știri pentru tine", text: "Aici apar știrile importante și cele care te privesc după profilul tău: disciplina, ciclul, olimpiadele. Lista completă e la „Toate știrile”."},
    {target: ".shell-login", title: "Contul tău", text: "În cont îți completezi profilul didactic, îți adaugi biblioteca personală și alegi aspectul (luminos sau întunecat)."},
  ],
  asistent: [
    {target: ".shell-assistant .composer", title: "Scrie-mi aici", text: "Cere o explicație, un test, o fișă sau o planificare. Când e un document, îl deschizi în editor și îl exporți în PDF sau Word."},
    {target: ".shell-assistant .composer .attach", title: "Adaugă documente", text: "Atașează un document la conversație și îl folosesc ca sursă. Pe cele folosite des pune-le în biblioteca personală, din Cont."},
    {target: ".shell-assistant .chat-selection", title: "Alege sursele", text: "Eu aleg automat manualele potrivite profilului tău. Le poți schimba aici și poți stabili câte exerciții și de ce tip vrei."},
    {target: ".shell-assistant .sidebar", title: "Conversațiile tale", text: "Istoricul și proiectele rămân în cont. Clasele tale apar aici ca proiecte, cu conversațiile lor."},
  ],
  documente: [
    {target: '[data-tour="docs-progress"]', title: "Progresul portofoliului", text: "Bara numără documentele obligatorii din structura-cadru, plus cele „după caz” pe care le adaugi tu."},
    {target: ".shell main section", title: "Secțiunile portofoliului", text: "Portofoliul are cinci secțiuni. Deschide una ca să vezi ce documente îți trebuie și ce lipsește."},
    {target: '[data-tour="docs-generate"]', title: "Generează cu mine", text: "La documentele pe care le poți redacta, te ajut eu: apeși „Generează cu Plusi” și pregătim împreună ciorna."},
    {target: '[data-tour="docs-export"]', title: "Opis și export", text: "Descarci opisul la zi sau tot portofoliul, ordonat pe secțiuni."},
    {target: ".float-plusi", title: "Ajutor oricând", text: "Dacă te încurci, apasă pe mine în colț: îți explic sau te duc în Asistent."},
  ],
  clase: [
    {target: ".classes-actions", title: "Clasele tale", text: "Adaugă clasele la care predai. Fiecare are documentele, observațiile și setările ei."},
    {target: ".classes-grid .class-card, .classes-empty", title: "Deschide o clasă", text: "Apasă pe o clasă ca să generezi și să încarci planificări, proiecte de lecție, teste și fișe pentru ea."},
    {target: ".float-plusi", title: "Sunt aici dacă ai nevoie", text: "Mă găsești mereu în colț pentru întrebări despre ProfPlus."},
  ],
  clasa: [
    {target: ".pp-segment", title: "Totul despre clasă", text: "Comuți între documentele clasei, observațiile tale și personalizări."},
    {target: ".class-topic", title: "Spune-mi tema", text: "Scrie tema sau detaliile, apoi alege ce generăm. Țin cont și de nivelul și preferințele clasei."},
    {target: ".class-section", title: "Generează sau încarcă", text: "În fiecare secțiune generezi cu mine sau încarci documentele tale. Cele încărcate le folosesc în conversațiile acestei clase."},
  ],
  cont: [
    {target: ".account-nav", title: "Setările contului", text: "De aici gestionezi profilul, biblioteca personală, securitatea și aspectul."},
    {target: '[data-tour="account-profile"]', title: "Profilul didactic", text: "Disciplina și ciclurile tale mă ajută să aleg manualele, sursele și știrile potrivite."},
    {target: '[data-tour="account-library"]', title: "Biblioteca personală", text: "Pune aici documentele folosite des; le consult automat în toate conversațiile."},
    {target: '[data-tour="account-preferences"]', title: "Aspect", text: "Alege modul luminos sau întunecat. Turul ghidat îl poți relua tot de aici."},
  ],
};
