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
