# Starea proiectului

## P-075 — Testele furnizate pentru clasa V — 2026-10-14

Responsabil Marcos Soames, issue #19. Două referințe structurale anonimizate R1/R2 pentru numere naturale și puteri în registrul comun, selectate după clasa V. Aspect de două pagini A4 portret, punctaj 30/30/30 + 10 din oficiu, bonus separat, gradație pedagogică și notația numeralelor din cifre. Modelele personale potrivite păstrează prioritatea. Publicarea automată pe GitHub reconfirmată în AGENTS.md. Originalele PDF nu intră în Git. GitHub: commit 1b8dbe9 confirmat pe main; teste relevante/TypeScript/build și scanner fără detecții, 8 high toolchain existente / zero producție; detalii în WORKLOG; cererea curentă privește GitHub, fără declararea unei noi publicări Sites.


## P-074 — Interfața ProfPlus după designul de referință — 2026-10-13

Cerere explicită a titularului, direct pe main. Designul din `docs/design/` (antet cu 4 tab-uri, mascota Plusi, Acasă, Documente personale, Clasele mele, Plusi plutitor) aplicat în `web/app`; chatul existent rămâne în tabul „Asistent virtual”, restilizat, fără schimbări de logică de cont, istoric sau bibliotecă. Tema implicită devine luminoasă, paleta verde/crem, font Roboto găzduit local (CSP neschimbat). Mesajele din Acasă și „Generează cu Plusi” se trimit automat în asistent. Portofoliul și clasele sunt păstrate doar în browser (`localStorage`, chei `profplus-*`, șterse la delogare); încărcarea, opisul, exportul și meniurile clasei nu sunt încă legate la server. TypeScript/build trecute, lint fără erori noi, verificare în browser la 1440 px și lățime îngustă. [Design](docs/design/README.md).

## P-073 — Toate lucrările pe main — 2026-10-12

Responsabil Marcos Soames, issue #18, cerere explicită a titularului. Inventar complet al worktree-urilor, integrarea istoricului 8977bda/2fdfbc2 și verificarea modificărilor locale față de main. Codul/testele/schemele rămân identice cu P-072; istoricul lipsă și rezumatul operațional sunt integrate. 61 teste Python și suite web relevante trecute, scanner fără detecții; 8 high toolchain existente, zero producție. Import paused; Site privat P-072 păstrat. [Dovezi și limite](docs/MAIN_CONSOLIDATION.md).


## P-072 — Manuale întâi, teste revizuite și planificări în șablon — 2026-10-12

Responsabil Marcos Soames, issue #17. Recuperare separată a manualelor, respectarea selecției/priorităților, structuri implicite P-070 și modele personale prioritare. Revizie AI a testelor și control al antetului/coloanelor planificării, cu o corectare și refuzul salvării când șablonul rămâne invalid. TypeScript/build și verificări relevante trecute; livrarea se confirmă separat. Importul este oprit la cererea titularului; materialele locale au fost eliminate, checkpointurile păstrate. [Detalii și limite](docs/TEST_GENERATION.md).


## P-071 — Curățarea bibliotecii păstrând suportul didactic — 2026-10-11

Responsabil Marcos Soames, issue #16. Filtrul păstrează materie, bareme și documente utile pentru planificări/lecții; exclude formularele administrative și navigarea duplicată. Cazurile ambigue rămân păstrate. 61 teste offline trecute; aplicare la importul operațional sub checkpoint lock, fără reset sau întreruperea uploadurilor. Importul integral rămâne IN PROGRESS. [Detalii și limite](docs/COMPETITION_IMPORT.md#p-071--scopul-bibliotecii-2026-10-11).


## P-070 — Modelele comune ale titularului — DONE, 2026-10-11

Cele zece exemple furnizate au fost analizate și distilate în referințe structurale anonimizate: planificări și proiectări de unități V/VI/VII, două teste, barem și fișă recapitulativă. Alegere după tip/clasă, modele personale prioritare, noul tip „Proiectarea unității de învățare”. Regula matematică 2 ore algebră + 2 geometrie în aceeași săptămână păstrează cele șase coloane și sincronizează duratele unităților. Fără originale sau identități în Git, fără fine-tuning. TypeScript/build, testele de modele/cont/izolare și probele AI focalizate trecute; publicare privată succeeded la 11:53 UTC, cod pe main la 214c40d. [Detalii](docs/REFERENCE_MODELS.md).


## P-069 — Editor LaTeX — DONE, 2026-10-11

Sursă LaTeX editabilă cu previzualizare simplificată și export `.tex` pentru Overleaf. Salvare exactă în conversație, conversie vizuală explicită, proveniență reversibilă. Compilarea TeX completă rămâne în Overleaf; PDF/Word din aplicație sunt simplificate. Verificări trecute; cod pe main la f1f7659, site privat publicat cu succes la 11:27 UTC, localhost:3000 actualizat. CI păstrează controlul auditului cu cele opt alerte toolchain preexistente. [Comportament și limite](docs/DOCUMENT_EDITOR.md).


## P-068 — Modele personale de documente — DONE (suport inițial; exemple comune în P-070), 2026-10-11

Responsabil: Marcos Soames, la cererea titularului. Modele private pentru test, barem, planificare, proiect de lecție și fișă; marcarea din bibliotecă și folosirea în toate conversațiile după tip/materie/ciclu. Modelele personale au prioritate pentru fiecare tip; registrul comun primește doar exemplele titularului aprobate și anonimizate. Registrul era gol la livrarea P-068; exemplele primite ulterior sunt integrate în P-070. Stilul standard a devenit sobru, fără introduceri și ornamente automate. [Comportament, verificări și limite](docs/DOCUMENT_MODELS.md). P-065 și P-067 sunt integrate pe main la `08642f9`; de acum livrare direct pe main fără PR, conform instrucțiunii explicite din 2026-10-11. Importul bibliotecii este separat. Publicare privată confirmată la 10:50 UTC, cod pe main la 25bce36; localhost:3000 actualizat. CI: build/teste/scannere trecute, audit blocat de cele opt alerte toolchain existente.


## P-067 — Surse prioritare și copie pentru elevi — DONE, 2026-10-11

Responsabil uman: Marcos Soames; cerere directă a titularului. Toate materialele potrivite pot rămâne selectate; steaua marchează maximum 10 surse comune și 10 documente proprii prioritare pentru enunț. Copia pentru elevi ascunde proveniența, citările și referințele la un singur click, inclusiv în PDF/Word. Formulele, variantele și spațierea sunt formatate. Implementare izolată în `feat/P-067-teacher-test-controls`, dependentă de P-065/PR #13 pentru păstrarea corecției bibliotecii deja publicate. [Dovezi și limite](docs/TEACHER_TEST_CONTROLS.md). Site privat publicat cu succes la 10:18 UTC; implementarea este disponibilă și pe localhost:3000. Importul bibliotecii rămâne separat în curs.


## P-065 — 2026-10-11

Corecția P-065 este verificată local: biblioteca se încarcă în 2,74–4,76 s cold și 0,04 s warm; 4.663 materiale în fotografia curentă. Publicat cu succes pe site-ul privat existent. Integrată în main conform cererii explicite din 2026-10-11. [Dovezi și limite](docs/LIBRARY_LOADING.md).

## P-063 — renunțare la materialele cu erori, 2026-10-10

Titularul a autorizat omiterea materialelor cu erori: referință verificată în Supabase înainte de eliminarea cache-ului local, fără redescărcare automată. Cele 10 PDF-uri rămase după erori (394.205.365 bytes) au fost eliminate. Importul valid al concursurilor continuă; companionul păstrează și linkurile pentru erorile lui. [Flux, dovezi și limite](docs/FAILED_MATERIALS.md).


## P-062 — 2026-10-09

Implementată omiterea originalelor peste 50 MB cu sursa păstrată; reluat importul concursurilor și continuat transferul manualelor. Codul, testele, curățarea verificată și publicarea sunt documentate în [IMPORT_CONTINUATION.md](docs/IMPORT_CONTINUATION.md). Transferul întregii biblioteci rămâne **IN PROGRESS**, separat de livrarea codului; nu sunt declarate toate originalele în cloud.


Ultima actualizare: 2026-10-05
Versiune locală: 0.9.5; publicată privat: 0.9.2
Etapă: pilot local cu Google/Apple, profil didactic și ștergere cont

## Import manuale în curs — 0.9.5

- Importul general a fost reluat la cererea utilizatorului: matematică → fizică → informatică/TIC → celelalte materii; text mai întâi, apoi OCR. Coada rulează local, cu raport pe manual și verificări periodice în chat. Cele 1.349 volume sunt inventarul, nu numărul indexat. [Flux](docs/MANUAL_IMPORT.md), [stare datată](catalog/manual-import-status.json).
- Fotografie 2026-10-05T14:58:04Z: 214/1.349 volume indexate; matematică 89/113 (24 OCR), fizică 35/36 (1 OCR), informatică/TIC 51/52 (1 OCR), celelalte materii 39/1.148 (11 OCR). Alte 3 volume sunt în indexare și 1.095 așteaptă. Nu este raport final; OCR nu a început.
- Import reluabil în indexul existent, minimum 90% pagini cu text pentru volume noi, PDF-uri procesate separat cu timeout, retry limitat, oprire la acces/cotă/spațiu, fără documente ori secrete în Git.
- Contorul bibliotecii acoperă toate manualele indexate, nu doar pilotul clasa V. TypeScript/build, teste Auth/API, șapte teste import offline și test bibliotecă paginată trecute. Căutare reală matematică clasa VIII verificată pentru UID și pagini; formulele și calitatea pedagogică nu sunt certificate.

## Finalizat

- 0.9.4 local: profil unificat (nume, activitate didactică, o singură salvare) și selecție dinamică a tuturor materialelor indexate potrivite profilului, inclusiv documente proprii din alte conversații; categorii manual/culegere/olimpiadă/concurs/document, încadrare editabilă și selecție personalizată păstrată. Detalii în docs/LIBRARY.md.
- Cerințe permanente de securitate în AGENTS și docs/SECURITY_REQUIREMENTS.md; verificare Git/client, CI periodic, remedieri de autorizare/CSRF/DTO/headers și actualizări Next/React. Raportul docs/SECURITY_REVIEW.md păstrează lipsurile și cele 19 alerte npm rămase (0 critice, 12 high, 7 moderate).

- 0.9.3 local: delogare vizibilă, profil didactic la prima conectare și editabil ulterior, preselecție bibliotecă după disciplină/cicluri, ștergere confirmată a contului Supabase și datelor sale active. Fluxul poate fi reluat după erori de furnizor și blochează accesul cât timp ștergerea este incompletă. Autorizarea Apple se oprește separat, fără să condiționeze ștergerea datelor ProfPlus. Detalii și limite în docs/ACCOUNT_LIFECYCLE.md.

- 0.9.2: rebranding ProfPlus implementat; repository privat și nume afișat organizație actualizate. Configurația Supabase/Apple inspectată; raport în docs/AUTH_CONFIGURATION_REVIEW.md. Activarea loginurilor externe rămâne P-033.

- 0.9.1: conectare Google/Apple în interfață; fluxurile de e-mail ascunse și blocate implicit pe server. Configurarea efectivă a providerilor și găzduirii independente rămâne în P-033. Resend amânat până la domeniu.

- Cont și setări: profil curent, conectare/securitate, temă, memorare și resetare preferințe locale. Integrare Supabase pregătită pentru Google/Apple/e-mail, verificare adresă și recuperare parolă; activarea externă rămâne în P-033. Pilotul păstrează identitatea ChatGPT.

- Mod întunecat/luminos activabil din antet; alegerea se păstrează local, implicit tema sistemului.

- Cerințele permanente pentru web/Android/iOS înregistrate și incluse în regulile de dezvoltare; implementarea integrală urmărită în P-027–P-030.

- Paletă unitară albastru / emerald, fundal #F8FAFC și text #0F172A în toate suprafețele aplicației.

- Editorul documentului centrat în pagină, cu margini egale și lățime limitată pe desktop.

- Documente generate de AI: deschidere automată în dialog, editare directă cu formatare, salvare și redeschidere din conversație, export PDF A4 și Word editabil.

- Mutare în proiect din dialog cu listă lizibilă; ștergere conversații și proiecte cu confirmare. Conversațiile se păstrează la ștergerea proiectului; documentele se păstrează în bibliotecă la ștergerea chatului.

- Navigare doar în stânga pentru proiecte și istoric; proiecte expandabile, căutare și meniu contextual de mutare. Pe mobil, panou lateral cu fundal și închidere prin Escape.

- Proiecte, istoric în cont, căutare după titlu, redeschidere și mutarea conversațiilor. Mesaje, citări și selecții salvate în D1.

- Repository privat în organizația GitHub ProfOS-Edu și evidența lucrărilor/versiunilor.
- Invitațiile colegilor așteaptă username-urile GitHub.
- Pilot: 9 manuale de matematică de clasa V, 2.020 pagini PDF, 1.995 pagini cu text extras.
- Căutare prioritară în documentele profesorului și manuale; completare prin căutare web când informațiile lipsesc.
- Surse distincte și citări accesibile: documente proprii, manuale, internet.
- Încărcare, indexare, listare, descărcare și ștergere documente direct în chat.
- Metadate D1, originale R2 și indexuri OpenAI separate pentru documente; verificarea utilizatorului și conversației pe server.
- Limită 10 MB/fișier, 10 documente/conversație și 50/cont.
- Versiune publicată privat, confirmată de Sites.

- Bibliotecă pentru catalogul comun, manualele indexate, documentele profesorului din toate conversațiile și sursele web citate.
- Căutare, filtre, selecție pentru RAG și linkuri la originale. Serverul verifică starea și accesul.

## Verificare

0.9.4 local: TypeScript/build și suitele de profil/Auth/API trecute cu furnizor simulat. UI profil comun și salvare/reload, alias vechi, formular de clasificare și filtru Concurs, 390px fără overflow. Toate categoriile, indexare nouă, filtre, mod automat/personalizat, etichete private, ownership, CSRF, ștergerea etichetelor, răspunsuri minime și security headers. Scanarea secretelor în cod/istoric Git accesibil/build client nu a găsit potriviri; limitele scannerului sunt documentate. Fără ștergere reală sau publicare online.

0.9.3 local: TypeScript/build, teste de profil/preselecție și ambele suite Auth cu furnizor simulat trecute. Ștergere API cu cont fictiv, confirmare, autentificare recentă, eroare/reluare, invalidarea sesiunii, eliminarea D1/R2 și păstrarea datelor altui cont. Pipeline-ul de ștergere verifică ordinea și proprietarul prin adaptoare simulate; nu a fost șters contul real. Accesul administrativ Supabase existent verificat doar prin citire. UI local: învățător/profesor, validări, dialog anulabil, desktop și 390px fără depășire orizontală. Nicio publicare online.

0.9.2: publicare privată ProfPlus confirmată de Sites. TypeScript și build trecute; browser local pentru branding, pagina contului și tema persistentă după reload. GitHub repository privat redenumit, Supabase recunoaște noul nume; App ID Apple redenumit vizual cu salvare confirmată. Browser live confirmă noul nume și accesul la istoricul/documentul existent. Configurația externă inspectată, fără test real Google/Apple. Raportul diferențiază configurarea existentă de pașii nefinalizați.

0.9.1: publicare privată confirmată de Sites. TypeScript/build și teste Auth simulate trecute în ambele moduri. Modul social refuză toate operațiile de e-mail și token hash fără apeluri către furnizor; PKCE Google/Apple verificat. UI verificat pentru lipsa formularelor de e-mail, inclusiv acces direct la vechea pagină register. Nu sunt configurate loginuri externe reale.

0.9.0: publicare privată confirmată de Sites. TypeScript și build trecute. API Sites: identitate, protecție acces, origine și izolare istoric verificate. Teste cu Auth simulat pentru verificarea e-mailului, cookie-uri HttpOnly/Lax, login/register/logout, profil/e-mail, recuperare parolă, OAuth PKCE, redirect sigur și sesiune falsificată. UI verificat desktop și 390px, temă persistentă/opțională. Loginurile reale Google/Apple și livrarea Resend nu sunt încă testate/configurate.

0.8.3: build, comutare luminos/întunecat, persistență după reload, Enter și verificare vizuală desktop trecute. Contrastul perechilor principale depășește 4,5:1. Publicare privată confirmată.

0.8.2: build și verificare vizuală desktop pentru paleta globală trecute; culorile calculate confirmă exact cele patru valori cerute. Publicare privată confirmată.

0.8.1: build trecut, centrarea editorului verificată vizual în browser local pe desktop; publicare privată confirmată.

0.8.0: TypeScript și build trecute; trei apeluri AI reale verifică document vs explicație, persistență/editare/izolare/validare. Exporturi verificate pentru diacritice, tabele, editări și PDF de 4 pagini, prima pagină inspectată vizual. Interfață locală: generare cu deschidere automată, deschidere, editare, salvare, previzualizare și meniu/export PDF verificate. Publicarea privată 0.8.0 confirmată de Sites.

0.7.0: TypeScript, lint fișiere modificate și build trecute; ștergere testată local cu izolare, păstrarea conversațiilor/documentelor și respingerea salvărilor vechi. Publicare privată confirmată.

Layout 0.7.0: TypeScript, lint fișiere modificate și build trecute; publicare privată confirmată. QA vizual în browser indisponibil.

Istoric: CRUD și mutare, recuperare transcript/citări/selecție, izolare conturi, conflict de revizie; răspuns OpenAI real salvat pe server și recuperat la redeschidere. TypeScript, lint fișiere modificate și build trecute; publicare 0.7.0 confirmată. Vezi docs/HISTORY.md.

TypeScript și build trecute. Teste reale: TXT/PDF/DOCX, răspuns din document, răspuns din manual, răspuns web și mixt, validări, izolare între identități locale, ștergerea completă a documentelor de test. Vezi docs/HYBRID_EVALUATION.md. QA în browser nu a fost disponibil. Biblioteca: catalog complet, selecție doar Intuitext, respingere neindexat, document din altă conversație cu citare, izolare între utilizatori și ștergere test — vezi docs/LIBRARY.md.

## Urmează și limite

- P-033 în lucru: Google activ în Supabase și callback Google corectat; Email dezactivat. Apple activ în Supabase cu cheia nouă salvată local și secret semnat. Aplicația locală localhost:3000 configurată; redirecturi oficiale Google/Apple verificate. Google și Apple confirmate pe același cont Supabase după loginurile titularului; sesiune validă după reload. Logout și izolare verificate cu furnizor simulat; probele reale cu conturi distincte, refresh la expirare și Apple relay rămân de verificat; site-ul găzduit nu a fost modificat.

- Evaluare preliminară DPIA și inventar în docs/DPIA.md; P-034 urmărește finalizarea și aprobarea. Conformitatea GDPR integrală nu este încă demonstrată.

- P-033: domeniu/găzduire cu autentificare proprie, Supabase, Resend, Google Cloud și Apple Developer; verificări reale și migrare controlată a identității înainte de activare. Vezi docs/ACCOUNT_SETUP.md.

- Politici și informații reale despre operator; audit de consimțământ/date/terți, accesibilitate și flux complet de solicitare a ștergerii. Lista înregistrată nu certifică implementarea sau conformitatea juridică.

- Evaluare pedagogică și calitatea căutării, inclusiv cazul istoric despre triunghiuri.
- Verificarea anonimizării interogărilor web, formulelor și scanărilor; DOC/PPTX/HTML nu au încă probe reale.
- Consum controlat și aplicații mobile.
- Importul general este în curs; OCR, erorile individuale și verificarea calității rămân distincte de indexarea reușită. Starea curentă în docs/MANUAL_IMPORT.md și raport.

Documentele sunt păstrate până la ștergere; „Conversație nouă” creează un chat separat; mesajele și documentele vechi rămân accesibile în istoric. Fișierele și metadatele sunt stocate pe server, identificatorul conversației în browser. Site-ul rămâne privat: https://profos-chat.cosminsoames.chatgpt.site.

P-037 implementat local: asocierea Google/Apple afișată din identitățile Supabase verificate, cu mesaj explicit de conectare. Salvarea profilului real reușită; build/TypeScript/suite Auth trecute. Nicio publicare online în această sarcină.


## Prioritate actualizată — 2026-10-05

La cererea utilizatorului, coada a fost reluată din checkpoint cu OCR înaintea continuării textului. Procesul este activ în ocr_matematica. După OCR-ul cunoscut, fiecare grupă continuă text → OCR. Nu este raport de finalizare.


## Chat vizitator — local

P-050: conversație AI fără login, mesaje în memoria paginii, fără istoric sau documente private. Limite agregate server-side pentru pilot. Site-ul online nu a fost republicat.


## P-051 — Bibliotecă și atașamente pentru toți

Local: catalog comun public și selecție surse indexate fără login. Vizitatori: trei fișiere temporare/10 MB total în memoria paginii; dispar la reload/conversație nouă, fără salvare în biblioteca contului.


Actualizare P-048 — 2026-10-05: la ultima cerere a utilizatorului, importul text pentru toate materiile precede OCR-ul. Coada reluată din checkpoint; confirmată activă în text_alte_materii, 243 indexate la verificare. Extracția OCR întreruptă este marcată needs_ocr, fără a declara succes. Șapte teste offline trecute; fără publicare online.


P-048 — 2026-10-05, ultima instrucțiune: import normal fără programare recurentă, apoi oprire înainte de OCR (awaiting_ocr). Controller înlocuit fără oprirea importului copil; progres păstrat. Șapte teste offline trecute. Automatizarea confirmată absentă; fără notificare proactivă garantată după închiderea turei. OCR necesită etapă ulterioară.


P-048 — ultima cerere 2026-10-05: import integral și OCR automat la final, fără scheduled task; înlocuiește oprirea înainte de OCR. Controller actualizat păstrând importul copil activ. Erori curente agregate: ConnectionError/API_NETWORK_ERROR/JSONDecodeError; reluările text limitate existente le vor reîncerca. Nu sunt volume finalizate și nu este promis succes pentru linkuri sau OCR indisponibile. Șapte teste offline trecute.


## Colaborarea echipei

P-052 în review, PR #1; regulile nu sunt încă integrate. Protecția main indisponibilă pe configurația actuală. P-053 corectează testele bibliotecii publice și ale antetului Origin absent; verificările locale trecute, CI remote de confirmat. Modificările locale și importul sunt păstrate; actualizarea folderului principal necesită predare controlată.

## 2026-10-06 — Remediere dependențe P-046

Checkout separat, fără modificarea serverului principal sau a OCR-ului. Cloudflare/Vite/Vinext/Wrangler și plugin RSC actualizate cu peer dependencies compatibile; override-uri pentru sharp, image-size, undici, ws, source-map-js, esbuild și fflate. Audit nou: 8 high, 0 moderate/critical; toate cele opt sunt aceeași vulnerabilitate braces și lanțurile dependente. Nu există versiune upstream reparată. TypeScript/build și suite locale de cont/guest/bibliotecă trecute; CI Linux 37486031167: toate verificările trecute, cu excepția auditului npm (8 high din braces). Auditul high rămâne blocant; P-046 nu este finalizat.

P-054 în review: proveniență per exercițiu în instrucțiunile AI; metadate disponibile, lipsuri explicite. Nu certifică automat egalitatea textuală sau respectarea drepturilor pentru fiecare răspuns; necesită evaluare reală.

## P-052 — Proveniența exercițiilor — 2026-10-08

Implementat local: instrucțiune comună tuturor etapelor AI pentru fiecare exercițiu din teste/fișe: preluat integral numai cu enunț complet identic, adaptat/inspirat cu exercițiu-sursă identificabil, altfel original ProfPlus. Titlu/tip/editură/organizator/pagină PDF vs tipărită/număr/an/ediție/etapă numai din dovezi; lipsurile explicit neprecizate. Editura și clasa sunt transmise în context; referințele citate sunt incluse de server în conținutul documentului pentru salvare/export, fără URL privat permanent.

Verificări: test API cu AI simulat pentru instrucțiuni, context și referințe în document; regresie guest/fișiere temporare; TypeScript și build trecute. Nu s-a evaluat un răspuns AI real, fidelitatea 100% nu este certificată automat; etichetele per exercițiu depind de respectarea instrucțiunilor de către model. Fără publicare online sau modificarea documentelor existente.


## P-053 — Export cu sursa simplificată — DONE (local), 2026-10-08

Meniul Export oferă opțiunea „Doar sursa, fără detalii de proveniență”, implicit dezactivată, comună PDF/Word. În copia exportată liniile de proveniență devin „Sursă: …”; etichetele preluat integral/adaptat/inspirat, original ProfPlus și metadatele explicit neprecizate sunt eliminate. Sursele bibliografice disponibile, referințele și enunțurile rămân; editorul/salvarea nu sunt modificate. Transformarea se aplică liniilor etichetate, nu textului arbitrar al exercițiilor; formatele nestandard editate manual pot necesita verificare. Test de transformare pentru diacritice/Markdown, originale, conservare enunțuri/referințe și idempotență trecut; TypeScript/build verificate separat. Fără publicare sau schimbări de date/furnizori.


## P-055 — Publicare surse exerciții și export — 2026-10-08

Responsabil: Marcos/Cosmin, la cererea explicită de publicare. Sites a confirmat publicarea privată reușită a surselor per exercițiu, referințelor în document și opțiunii PDF/Word „Doar sursa”. Site: https://profos-chat.cosminsoames.chatgpt.site ; source commit 062b8e0912107ee56627ff94463e859aa3908ac7 ; deployment appgdep_6ac77ef7640c8191b3325c7ff8a18298. Aplicat pe sursa online 0.9.2 pentru a păstra funcțiile/autentificarea existente, fără a publica celelalte funcții locale. Next/React/RSC actualizate la versiunile deja verificate local; build, TypeScript, transformare export și două suite Auth cu provider simulat trecute. Audit online: 28 alerte (0 critice, 20 high, 7 moderate, 1 low), fără certificare de producție. Nu s-a publicat Android/iOS: aplicațiile sunt planificate.

GitHub: branch feature/P-055-source-only-export pornește din main actualizat și păstrează implementarea P-054 deja integrată, completând-o cu exportul și referințele. Verificări izolate: proveniență API cu AI simulat, transformare export, regresie guest, TypeScript/build. Integrarea în main așteaptă review uman independent și controalele cerute în docs/TEAM_WORKFLOW.md. Regula permanentă de publicare este în AGENTS.md; nu înlocuiește review-ul sau controalele CI.

## P-057 — Supabase activat, materiale locale transferate — IN REVIEW, 2026-10-09

Responsabil: Marcos/Cosmin, la cererea explicită a titularului. Conectorul Supabase reconectat; proiectul ProfPlus activ/sănătos, regiunea eu-west-1. Schema PostgreSQL/RLS și operațiile server parametrizate au fost aplicate și verificate real. Materialele găsite pe disc în importurile manuale/olimpiade și inventarul Word au fost transferate, recitite și verificate SHA-256/dimensiune, cu evidență în Storage și PostgreSQL, apoi eliminate local. La finalul transferului: 1.973 obiecte private de bibliotecă, 456.309.261 bytes (inclusiv versiuni de text), zero PDF/text/original restant în directoarele de materiale locale. Numerele cresc odată cu importul reluat. Ultimul PDF de 41.792.961 bytes a trecut prin upload TUS reluabil de 6 MB, apoi verificare completă.

Cutover confirmat: cele patru conversații complete ale site-ului și conversația locală au fost copiate fără trunchiere și verificate rând cu rând. DATA_BACKEND=supabase activ pe site și local; vechiul istoric local a fost eliminat numai după verificare și backup cloud. Capabilitatea temporară de migrare este dezactivată (403), secretele temporare/lock-ul eliminate. Originalele private viitoare merg în profplus-private-documents; datele generate/istoricul/metadatele merg în PostgreSQL. Copiile cloud de rollback se păstrează; vechea sursă D1/R2 a site-ului este păstrată pentru rollback, nu mai este destinația de scriere.

Sites: source 5acc6c0da55ff09599bd3d9e258002ecc873f4b0; deployment appgdep_6ac89dab548c8191ba714e4e4543827b reușit, env revision 4; https://profos-chat.cosminsoames.chatgpt.site. Audiență privată păstrată. Localhost:3000 HTTP 200, proces local 96820. Import olimpiade reluat cu cloud retention, controller 97599; este P-056 și nu se declară arhiva completă indexată. SQLite/checkpointurile/cache-ul folosite de procese, configurațiile, cheile OAuth și modelele OCR sunt necesare și rămân; sources/ sincronizat nu se modifică. Curățate numai copii temporare/cach-uri descărcate create pentru această lucrare.

Verificări: opt teste transfer/ștergere/TUS/restaurare, 11 import olimpiade, șapte import manuale; toate cele 43 operații PostgreSQL WASM, verificare Supabase reală cu fixture-uri rollbackate, service RPC HTTP 200, restaurare reală inventar Word, TypeScript/build curat pe lockfile și suite de cont/guest/bibliotecă/adaptor. Scanner Git/build fără potriviri. Audit npm producție 0; complet 8 high existente din braces fără remediere upstream, controlul CI păstrat. Advisors: avertisment Auth parole compromise dezactivat; info RLS fără politici publice intenționat și index încă nefolosit. Nu reprezintă audit complet sau aprobare generală de producție. GitHub: branch feature/P-057-supabase-storage; PR necesită review uman independent, fără auto-merge. Flux, restaurare și limite: docs/CLOUD_STORAGE.md.

GitHub P-057: commit 8b0e602, branch publicat, PR #6 https://github.com/ProfOS-Edu/ProfPlus/pull/6 (draft; review independent cerut lui bogdan-25). Migrațiile create prin CLI au fost aliniate la versiunile efectiv returnate de Supabase: 20261009074150 și 20261009074413; nu se reaplică o schemă deja instalată.

## 2026-10-09 — Consolidarea copiei locale

Codul complet cloud și importul olimpiadelor sunt reunite în checkout-ul operațional. Starea importului a fost transferată fără pierderi și checkpointul verificat în Supabase; importul a fost reluat din copia principală. Copiile suplimentare publicate și dependențele temporare sunt eliminate, iar configurația necesară este păstrată protejat. Vezi docs/LOCAL_WORKSPACE.md.

## 2026-10-09 — P-059: starea bibliotecii

Manualele clasa I din captura utilizatorului sunt indexate; citirea stării se întrerupea și toate cele 1.349 intrări apăreau catalog. Remediere: deadline 120 secunde, cache 5 minute/deduplicare și unknown după eșec. Local real: șase exemple ready, fără warnings, apel cache 0,03 secunde. 1.303/1.349 manuale indexate; 46 lipsesc din index (18 OCR, 28 eșecuri, fotografie de import 2026-10-06), separat de concursurile încă în curs.

Publicare P-059 confirmată: Sites versiunea 18, sursă 9ac255bf57128faa03c697b23228a659a18d1e04, deployment appgdep_6ac8bea0f46881919c77c77f5542af83 reușit, audiență privată păstrată. API online după publicare: HTTP 200 în 42,92 secunde, warnings goale, cele șase exemple ready; 46 catalog, restul ready include concursurile în curs. Scanner Git/client: 1.141 fișiere/bloburi, fără detecții. PR https://github.com/ProfOS-Edu/ProfPlus/pull/7, review bogdan-25 solicitat, dependent de PR #6; fără merge automat.

## P-060 — Pro, recuperarea originalelor și protecții — IN PROGRESS, 2026-10-09

Responsabil: Marcos/Cosmin, la cererea titularului. Organizația Supabase verificată Pro; plafonul de cheltuieli și limita globală de 50 MB sunt păstrate la cererea ulterioară explicită. Originalele se recuperează separat de index: scripts/recover_manual_originals.py, ordine echilibrată pe disciplină/clasă, SHA-256 și catalog confirmate înainte de ștergerea locală, raport și listă CSV a celor rămase. Transferul este în curs, nu complet. Fotografie live 13:04 UTC: 77 originale manuale, Storage 2.576.895.854 bytes, PostgreSQL 39.933.619 bytes. Biblioteca are prag operațional 75 GB pentru a păstra spațiu din cele 100 GB Pro; nu este o rezervare impusă de furnizor. Conturile/conversațiile rămân PostgreSQL; uploadurile profesorilor au limita existentă 10 MB. Indexul AI existent este separat, 1.303 manuale confirmate la început; OCR și retry se execută cu raport, fără etichetare falsă ready.

Protecții live verificate: parole compromise blocate, schimbare sigură/reautentificare și parola curentă; provider Email rămâne dezactivat. Sesiune unică, maxim 168 ore, inactivitate 24 ore, JWT 3600 secunde, detectarea reutilizării refresh activă (10 secunde). SSL obligatoriu, conexiuni externe directe PostgreSQL/pooler refuzate, jurnalizare conexiuni/deconectări activă. SQL administrativ și REST verificate după restricții; nicio tabelă publică fără RLS, buckets private. Advisors nu mai raportează leaked_password_protection; cele patru INFO pentru tabele server-only fără politici sunt intenționate. Backupuri zilnice DB disponibile, 7 zile pe Pro; nu includ obiectele Storage. PITR și add-onuri plătite nu sunt activate.

Google: App name ProfPlus este deja salvat; Testing, branding neverificat și fără domeniu propriu (confirmat de titular). Numele/adresa afișate în Google nu sunt declarate remediate; verificarea necesită domeniu și pagini publice reale. Selecția automată include toate categoriile ready și normalizează Informatică/TIC, română și limbi moderne; clasele numerice/range și stages gol sunt tratate. Private Sites versiune 19 publicată: sursă 25555dddae697eda00e584971a6462e77bb79ac9, deployment appgdep_6ac8e52c7f708191b61759fb3091b427 succeeded; audiență păstrată. Teste TypeScript/build, profil/cont/bibliotecă și scanner fără detecții; testele Python includ limite, retry 544/413, transfer verificat și lipsa accesului cloud al fixture-urilor. Nu reprezintă audit complet sau aprobare generală de producție.

P-060 GitHub: PR #8 https://github.com/ProfOS-Edu/ProfPlus/pull/8, review bogdan-25 solicitat, dependent de PR #6. CI run 37935131688: contractele de import și secrets trecute; build/TypeScript/suite cont/bibliotecă trecute în job, controlul npm audit a eșuat pe cele 8 high existente din braces și dependențele de dezvoltare. Controlul nu a fost dezactivat și PR-ul nu este auto-merged. Local: 37 teste Python trecute. Transferul originalelor și OCR pentru candidații noi rămân procese active, nu milestone complet.

P-060, verificare 2026-10-09T13:26Z: OCR suplimentar încheiat, 1.318 manuale indexed, 18 needs_ocr și 13 failed; indexul nu se confundă cu originalele PDF. Recuperarea originalelor rămâne activă. Selecția profilului tratează și engleză intensiv / germană nivel A2.1, cu teste de excludere a limbilor diferite. Sites versiunea 20 publicată privat: source 0f0abe0a59ef8b5796bfb8294189ecd0bda5c4e7, deployment appgdep_6ac8eb4e62e081919cc728945d735732 succeeded, env revision 4. TypeScript, profil/cont și build trecute; scanner Git/client: 1.188 fișiere/bloburi, fără detecții.

P-060, continuare 13:29Z: procesele proprii de recuperare au fost repornite controlat cu șase lucrători, fără oprirea altor importuri și fără ștergerea originalelor păstrate. Transferurile cloud deja finalizate sunt recunoscute din catalog; o reluare verifică limita și pentru PDF-uri locale și evită redescărcarea celor prea mari la aceeași sursă. Viitoarele opriri SIGTERM/SIGINT încheie transferurile începute înainte de raport. Cele 39 teste offline de recuperare/cloud/manuale/concursuri au trecut; sursele temporar inaccesibile au retry limitat.


## Istoric P-056 integrat — fotografii datate, înlocuite de notele ulterioare


## P-056 — Import olimpiade și concursuri — IN PROGRESS, 2026-10-08

Responsabil: Marcos/Cosmin; cerere explicită de indexare a documentelor din cele 15 arhive enumerate în Word-ul furnizat. Import separat și reluabil în indexul comun existent, fără mutarea/resetarea/opririle cozii de manuale. Catalogul surselor publice este în catalog/competition-archives.json; raportul datat în catalog/competition-import-status.json. Fișierul Word original nu este copiat în Git și nu se modifică.

Descoperire paginată a linkurilor relevante, descărcări HTTPS cu verificare adresă publică și redirecturi, limite de fișier/spațiu, ZIP/RAR/TAR numai în memorie/fără extracție pe disc, limite de expansiune, PDF text/OCR și DOC/DOCX. Rezultatele/clasamentele/listările de participanți sunt excluse prin indicii URL/text; această filtrare nu certifică absența tuturor datelor personale. Documentele primesc tip olimpiadă/concurs, materie/clasă/ciclu unde identificabile, origine și membru al arhivei. Pentru DOC/DOCX/HTML, citarea este pe fragment, fără pagină PDF inventată. Ani numai din text disponibil. Deducerea automată necesită verificare pedagogică.

Dinamica bibliotecii/RAG citește metadatele publice ale materialelor comune din index și validează separat UID/categorie/URL; documentele private rămân în indexuri cu ownership. Materialele noi apar fără reconstruirea manifestului la fiecare upload. Nu se expun cheia, ID-urile interne de fișiere/index sau textele în rapoartele publice.

Verificări: șapte teste offline pentru URL/private/ZIP/expansiune/clasificare/DOCX, test DTO public cu categorii/URL/fragment/minimizare, TypeScript/build pe main actualizat. Procesul este activ în /Users/marcos/dev/profplus-P-056-import/data/competitions, control nescheduled run_competition_import.py, log/checkpoint local, trei indexări concurente. Mac-ul trebuie să rămână pornit și conectat; după întrerupere se reia aceeași coadă. Raportul nu este final; IN PROGRESS până la epuizarea linkurilor relevante, clasificarea lipsurilor și verificarea căutării remote. Unele linkuri inițiale au 404/406. Drepturile de utilizare extinsă și calitatea OCR/formulelor nu sunt certificate.


P-056 — Publicare privată confirmată 2026-10-08: source c5b7d9a4cb613cf2bb826d92ff1dd6142de1ce1b, deployment appgdep_6ac783c7b3708191a76ea77d30ed3905, https://profos-chat.cosminsoames.chatgpt.site. Biblioteca/RAG citesc dinamic UID/categorie/origine/ciclu/clasă/locator din fișierele comune, astfel încât importurile ulterioare apar fără o nouă publicare. 134 documente confirmate la fotografia 11:51:58Z; importul rămâne în curs. Căutare reală filtrată competition a returnat trei bareme COMPER cu UID, origine publică și PAGE:1. Build/TypeScript/DTO public și două suite Auth simulate au trecut și pe sursa Sites.


P-056 — Fotografie 2026-10-08T12:02:15Z: 286 documente confirmate indexed, 52 extrase în așteptare, 4 documente cu lipsuri; 4174 URL-uri încă de verificat. Nu este raport final. Scanner Git/client fără detecții; DTO/RAG/availa­bility/guest, TypeScript/build și teste import trecute. Auditul dependențelor din main rămâne separat în raportul P-046; controalele CI nu sunt ocolite.

P-056, 2026-10-09: 578 documente confirmate indexed la verificarea 05:24 UTC; raport intermediar, arhivele continuă să fie parcurse. Remediere a păstrării paginilor în fragmente: blocuri cu marcaje repetate, înlocuire confirmată înainte de curățarea fișierului precedent, reluare sigură a curățării. 11 teste import și suitele DTO/RAG/bibliotecă au trecut. Procesul durabil rămâne activ în checkout-ul P-056; copia operațională a manualelor nu este sincronizată forțat.

Acces local, 2026-10-09: localhost:3000 nu avea server activ. Repornit procesul local din copia operațională, PID 90253, log exclus din Git în web/.sites-runtime/local-server.log. GET / confirmat HTTP 200, pagina ProfPlus verificată în browser. Nu s-a schimbat codul pentru repornire.

P-056, 2026-10-09: importul s-a oprit controlat la 578 fișiere confirmate din cauza DISK_SPACE_LOW. Eliminarea exclusivă a dependențelor regenerabile din cele două checkout-uri create pentru această sarcină a eliberat aproximativ 2 GB; originalele, checkpointurile, configurația și copia operațională au fost păstrate. Reluat cu controller PID 90588 și protecție de somn inactiv. La reluare sunt rezolvate întâi indexările/migrarea paginilor, apoi descoperirea. Raportul DISK_SPACE_LOW este istoric; starea curentă se citește din run.json.

## Note operaționale locale păstrate la consolidarea P-061

## Acces vizitator — corecție locală din 2026-10-05

Pagina chat `/` nu mai redirecționează automat spre login sau profil didactic. Invitație explicită la conectare pentru acțiunile protejate; fără schimbarea securității API-urilor sau creare automată de conturi anonime. TypeScript/build, browser fără sesiune (încărcare, reload, trimitere fără redirecționare) și refuzul API 401 verificate. Accesul după abonament va fi definit ulterior. P-049; fără publicare online.

## 2026-10-09 — Verificare inventar cloud și izolarea testelor

Verificare live: originalele nu sunt încă complete; 7 originale manuale și 828 originale concursuri/olimpiade, texte pentru 1.303 manuale indexate și 1.391 documente de concurs indexate. Un artifact sintetic de 7 bytes a fost identificat prin archiveId=test, example.org și SHA-256 exact al fixture-ului, apoi eliminat din Storage și catalog. Testele de concurs dezactivează explicit cloud_active, la fel ca testele de manuale, fără a depinde de configurația checkout-ului. Niciun material real eliminat. Importul concursurilor s-a oprit la un PDF de 57.946.349 bytes, SUPABASE_RESUMABLE_CREATE_413; originalul este păstrat local. Nu se declară transferul complet sau import activ după acest blocaj.

## P-061 — Consolidarea pentru colaborare — DONE, 2026-10-09

Responsabil Marcos/Cosmin, cerere explicită a titularului: întregul cod în main. Reunite istoricul P-056 și ramura P-057/P-059/P-060; conflictele păstrează marcajele paginilor, retenția/restaurarea cloud, izolarea fixture-urilor și cache-ul/starea corectă a bibliotecii. Include modificarea locală de stil pentru linkurile navigației, note operaționale și rapoarte datate. Ghid de pornire și exemple fără chei pentru colaboratori. Importul originalelor rămâne activ și nu este confundat cu publicarea codului. Verificările și integrarea sunt confirmate în nota finală P-061 de mai jos.

P-061, verificare 2026-10-09: instalare curată Node 22.20.0 cu lockfile, TypeScript/build și suite cont (ambele moduri), guest, bibliotecă/cache, DTO/RAG comun, adaptor cloud, proveniență/export trecute. Cele 39 teste offline Python au trecut. Scanner Git/client: 1.210 fișiere/bloburi fără detecții; linkurile ghidului verificate. Audit npm complet: 8 high existente în braces/toolchain; fără alerte noi, controlul păstrat, fără afirmație CI integral verde. Nu există diferențe de cod operațional neincluse; singurele schimbări suplimentare de configurare sunt exemplele goale și excluderile Git. Importul manualelor continuă din copia operațională, fără mutare/reset/sincronizare forțată.

P-061: publicare privată Sites versiunea 21 confirmată succeeded, source 502d1a02cb13287f7a44d56ba94552361df0b9d4, deployment appgdep_6ac8f0fc024c8191a27ea319134e3154, env revision 4. Sursa web diferă de Sites 20 numai prin stilul local existent și configurația exemplu/excluderea aferentă. Scanner cu valorile locale comparate în memorie: 1.229 fișiere/bloburi, fără detecții. Runtime-ul și audiența rămân cele existente. PR #9: https://github.com/ProfOS-Edu/ProfPlus/pull/9, integrare explicit cerută în main, incluzând istoriile #5/#6 și #7/#8.

P-061 — integrare confirmată 2026-10-09 16:52 Europe/Bucharest: PR #9 MERGED, commit de integrare main d69d0b928caf96e1595a677e11719212e0e1d1ae. Istoriile P-056 (446e996) și P-057/P-060 (ab6dcd4) sunt strămoși confirmați ai main; PR #5/#6 s-au închis prin integrare, #7/#8 erau deja incluse. Inventarul codului operațional nu are fișiere lipsă. Ghid și exemple fără chei incluse; fără publicarea materialelor/datei private sau modificarea accesului.

CI run 37939471661: import și secrets trecute; instalarea, TypeScript, build, scanner client și suitele de cont/guest/bibliotecă trecute. Pasul npm audit a eșuat exclusiv pe cele 8 high existente din uneltele de dezvoltare (P-046), fără alertă nouă sau dezactivarea controlului. Consolidarea în main este cererea explicită a titularului, nu aprobare de producție ori eliminare a regulii PR/review pentru lucrări ulterioare. Publicarea privată Sites 21 succeeded, sursă 502d1a02cb13287f7a44d56ba94552361df0b9d4; toate sursele web versionate se potrivesc cu această sursă publicată. Importul manualelor rămâne activ în checkout-ul operațional; acesta nu este resetat sau sincronizat forțat.

## Publicare P-062 confirmată

PR #10 integrat în main la 14:36 UTC: merge `869a20747e721d776b692db1081971b056d282b3`, cod `980b88a0d7113b8585aa60583a0180acd52019b3`. Site-ul privat este publicat cu succes (dovezi în IMPORT_CONTINUATION.md). CI verifică acum și companionul de referințe și recuperarea originalelor concursurilor; toate cele 49 teste au fost executate local. Livrarea codului este **DONE**; importul datelor rămâne **IN PROGRESS**. Instrucțiunea explicită a titularului autorizează integrarea curentă în main; nu se dezactivează controalele și nu se schimbă regulile normale de review pentru sarcini viitoare.

## Publicare și verificare P-063

PR #11 integrat în main: `46597b7aacf115e1433536a5e919b8abbf07369c`. 448 de referințe pentru materialele/URL-urile cu erori au fost salvate și jurnalizate; 10 PDF-uri eliminate, 394.205.365 bytes. Companionul rămâne activ numai cât rulează importul valid al concursurilor, pentru noile erori. Codul web are același tree Git `fb00b41548a85410be842dac8c1fa02a4c14e503` ca aplicația publicată; schimbarea datelor este în Supabase folosit de site, fără schimbare de audiență. Build, 58 teste offline și scanner Git/client fără detecții; auditul npm are 8 high existente.


P-065, revenire 2026-10-11: corectată blocarea după expirarea cache-ului. Lista comună recentă rămâne vizibilă în timpul actualizării; refresh în fundal, termen de 8 s pentru catalog și paginare paralelă limitată. Datele personale nu intră în cache/preview. [Dovezi și limite](docs/LIBRARY_LOADING.md).


P-071, aplicare verificată: 643 URL-uri scoase din coada activă (633 navigare duplicată, 10 administrative), cinci formulare de înscriere eliminate din catalog/Storage/manifestele Supabase și indexul AI; checkpoint actualizat. Absența celor cinci UID-uri confirmată în catalog după eliminare. Calendarele controlate au în continuare original și text în Supabase; nu s-a făcut purjare generală a calendarelor/regulamentelor/programelor. Fotografia operațională: 5.204 documente competitions indexate, 5 excluded, 24 failed, 56 skipped; 5.401 URL-uri pending, incluzând pagini intermediare. Cifrele evoluează cu importul și nu reprezintă finalizarea lui. Controllerul și companionul existente rămân active. Cod publicat direct pe main la 30e4c84, fără PR; web identic cu P-070 publicat privat. Scanner final: 1.560 fișiere/bloburi, fără detecții. CI 38173558758: scanner și contracte import trecute; build/audit încă în curs la verificare.


Livrare P-072 confirmată: publicare privată succeeded la 2026-10-12T20:44:26Z (23:44 București), deployment appgdep_6acd4691628c8191a78d4f2953ac559a, source Site 5b810f02e912546f9fde9f3706b83fe8591f4326, env revision 4; audiența owner-only păstrată. TypeScript/build și suitele relevante trecute; scanner Git/istoric/client 1.566 fișiere/bloburi și scanner sursă/istoric/client Sites 699, fără detecții. Auditul păstrează 8 high toolchain existente, zero producție. Probele finale AI au returnat documente pentru test și planificare; controlul uman a întărit regulile pentru zero, notația incluziunii și punctajele subpunctelor. Nu se declară validare pedagogică completă. Importul rămâne paused; nu s-au redescărcat materiale locale.
