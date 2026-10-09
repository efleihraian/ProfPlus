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
