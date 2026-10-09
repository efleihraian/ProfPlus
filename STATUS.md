# Starea proiectului

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
