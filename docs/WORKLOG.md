# Jurnal de lucru

## 2026-10-01 — Inițializare

- Creat documentația proiectului și structura pentru urmărirea lucrului.
- Nu existau materiale în sources/ din care să deducem cerințe suplimentare.
- Verificat contul GitHub conectat: marcossoames.
- Repository-ul marcossoames/ProfOS nu a fost găsit prin conector.
- Crearea prin plugin/browser a fost blocată inițial. După autentificarea GitHub CLI de către utilizator, repository-ul privat marcossoames/ProfOS a fost creat și configurat ca origin.
- Următorul pas: definirea MVP-ului și setului de evaluare, P-001 și P-002.

## 2026-10-01 — P-005: pregătire API

- Adăugat configurarea locală a cheii, .env.example și testul API cu o întrebare fixă.
- Verificat sintaxa Python, ignorarea .env în Git și mesajul pentru cheia lipsă; fără apeluri API reale.
- Urmează: utilizatorul salvează cheia local, apoi verificăm conexiunea.

## Șablon pentru intrări viitoare

## 2026-10-01 — P-005: conexiune API verificată

- Utilizatorul a salvat cheia local; cheia nu a fost afișată sau comisă.
- Primul test s-a oprit din cauza lipsei certificatelor în instalarea Python. Adăugat fallback la certificatele sistemului macOS, fără dezactivarea verificării TLS.
- Apel real reușit cu gpt-4.1-mini: „Conexiunea ProfOS funcționează.” Consum: 24 tokeni de intrare, 12 de ieșire, 36 total.
- Backend-ul, interfața și RAG-ul rămân de implementat.

## Formatul intrărilor

## 2026-10-01 — P-004/P-005: site de chat

- Construit prima interfață în română pentru telefon și desktop și endpoint-ul POST /api/chat.
- Verificat TypeScript, pagina HTTP 200, apel real și context conversațional, respingerea intrărilor nevalide și a originii externe.
- Browserul a refuzat accesul din cauza verificării politicii; QA vizual și WebMCP nu au fost executate.
- Utilizatorul a autorizat reutilizarea cheii existente și configurarea ei ca secret pe site-ul privat. Secretul a fost configurat în Sites fără afișarea cheii.
- RAG-ul este amânat prin instrucțiunea utilizatorului.
- Build-ul de producție a trecut și publicarea privată a reușit: https://profos-chat.cosminsoames.chatgpt.site. Configurarea secretului este inclusă în revizia publicată.

## Format pentru intrări noi

## 2026-10-03 — P-006: catalogul manualelor

- Utilizatorul a stabilit manualele ca prima colecție; vor urma exerciții, olimpiade, concursuri și alte documente PDF, DOC și web.
- Citit catalogul public manuale.edu.ro și regulile publice pentru linkuri. Inventariat 1341 înregistrări, separate în 1349 volume PDF.
- Verificat un link de probă prin HTTP HEAD: 200, application/pdf. Nu au fost verificate toate linkurile și nu au fost descărcate textele manualelor.
- Catalogul este în catalog/manuale-edu.csv. Chatul și site-ul nu au fost modificate; RAG-ul rămâne de implementat.

## Format pentru următoarele intrări

Data, sarcini/ID-uri, rezultat concret, verificări și rezultate, blocaje, următorul pas. Nu include secrete sau conținut sensibil din documentele utilizatorilor.

## 2026-10-03 — P-006/P-007/P-008: pilot matematică, clasa V

Importul general a fost oprit și selecția schimbată la toate cele 9 manuale din catalog pentru clasa a V-a, matematică. Toate indexate, 2.020 pagini PDF, 1.995 pagini cu text extras. Au fost reluate descărcările cu erori temporare. Căutarea și contorul serverului exclud volumele din alte clase. Chatul afișează citări și surse pe pagini PDF; fragmentele aceleiași pagini sunt combinate pentru a nu pierde informații recuperate.

Verificări: TypeScript, build, 10 cereri reale (9 trecute, triunghiuri nereușit), două refuzuri fără suport, pagina PDF 76 Paralela 45 verificată vizual. Documentate imprecizia formulării despre multiplii lui 5, limitările formulelor și lipsa QA a interfeței în browser. Sites a confirmat publicarea privată cu setul de configurare 2. Versiune 0.3.0.

## 2026-10-03 — P-016: documente prioritare, completare internet, încărcări

Implementat fluxul hibrid: căutare în documentele profesorului și manuale, evaluarea suficienței, căutare web separată când este nevoie, răspuns cu surse distincte. Adăugat buton de încărcare, stări și ștergere; originale R2, metadate D1, indexuri OpenAI separate, verificarea identității Sites și a conversației. Conversația nouă golește mesajele și păstrează documentele.

Verificat local cu build de producție și OpenAI real: TXT/PDF/DOCX indexate, răspuns din fișa sintetică, manuale fără web, web/NASA, răspuns mixt, parolă necunoscută fără web, 401 fără identitate, 404 pentru alt utilizator, 415/413/403 validări, ștergere completă. Datele de test șterse. TypeScript și build trecute. Documentate limitele anonimizării, extracției, formatelor neverificate și lipsa QA în browser. Versiune 0.4.0.

Publicarea privată 0.4.0 a fost confirmată de Sites, cu configurarea existentă a cheii și resursele D1/R2. Arhiva include migrarea inspectată și exclude secretele și metadatele macOS.

## 2026-10-03 — P-018: biblioteca tuturor surselor disponibile

Creată biblioteca pentru catalogul comun (1.349 volume), manuale indexate, documente încărcate în conversațiile profesorului și surse web citate. Căutare fără diacritice, filtre, selecție pentru următoarea căutare RAG și linkuri la originale. Serverul validează indexarea manualelor și proprietarul/starea documentelor. Default-ul pilotului rămâne când nu există selecție explicită. Preferințele sunt doar ID-uri în browser.

Verificate: catalog complet/stări reale, selecție manual Intuitext cu surse numai din acel manual, 409 pentru neindexat, document din altă conversație a profesorului cu citare, 409 pentru selectarea documentului altui utilizator, biblioteca exclude datele altui utilizator. Datele de test șterse. Corectată omiterea citării prin revizuire condiționată. TypeScript și build trecute; browser QA indisponibil.

Publicarea privată a bibliotecii 0.5.0 a fost confirmată de Sites. Arhiva a fost verificată fără secrete.

## 2026-10-03 — P-019: proiecte și istoric

Proiecte, istoric cu titluri/filtre, conversații distincte, redeschidere cu transcript/citări/selecție și mutare între proiecte. Salvare D1 pe identitatea Sites; revizii contra suprascrierilor, reîncercare și revenire explicită la versiunea salvată. Adoptarea documentelor vechi fără inventarea mesajelor. Ultimele 20 mesaje devin context AI.

Verificat: TypeScript, lint fișiere modificate, build producție; creare/listare/proiect/chat, salvare/redeschidere mesaje/citări/selecție, mutare, 401/403/404/409 și izolare între conturi. OpenAI real: răspuns salvat de server și recuperat din istoric; revizie veche și alt cont respinse înainte de apel AI. Date sintetice șterse. Lint general: două erori preexistente privind efectele în biblioteca de surse. QA vizual în browser indisponibil. Versiune 0.6.0.

Sites a confirmat publicarea privată 0.6.0, cu configurarea existentă și migrarea D1 inclusă. Arhiva și fișierele repository-ului au trecut verificarea fără secrete/metadate macOS.

## 2026-10-03 — P-020: navigare simplificată

Proiecte și conversații direct în stânga, grupuri expandabile, căutare fără diacritice și creare proiect inline. Mutarea conversației în meniul contextual; eliminate accesările repetate din antet și composer, dialogul vechi și elementele decorative din ecranul inițial. Bara devine panou lateral pe mobil, cu închidere prin buton/fundal/Escape și zona centrală inactivă cât timp este deschisă. Mesaje, documente, selecții și API păstrate.

Verificări: TypeScript, lint pentru fișierele modificate și build de producție trecute; diff fără erori. QA vizual/interactiv în browser indisponibil în această sesiune. Versiune 0.6.1.

Sites a confirmat publicarea privată 0.6.1. Arhiva și repository-ul au fost verificate fără secrete.

## 2026-10-03 — P-021: organizație GitHub

Confirmată organizația gratuită ProfOS-Edu în contul utilizatorului. Repository-ul transferat prin API; verificat noul proprietar ProfOS-Edu/ProfOS și vizibilitatea PRIVATE. Origin actualizat fără rescrierea istoricului. Invitațiile așteaptă username-urile colegilor; integrarea Claude nu a fost verificată. Site-ul folosește repository-ul separat Sites și nu necesită republicare pentru acest transfer.

## 2026-10-03 — P-022: mutare lizibilă și ștergere

Înlocuit dropdownul din rând cu dialog și listă de proiecte; butoane de opțiuni cu dimensiune fixă pentru toate conversațiile/proiectele. Adăugate confirmări și DELETE privat pe proprietar. Transcript golit cu marcaj minim; documentele rămân în bibliotecă. Proiect șters atomic cu conversații păstrate fără proiect. Migrare 0002 nouă, verificată local.

TypeScript, lint fișiere modificate și build trecute. Teste locale: autentificare/origine/proprietar, ștergere proiect păstrează mesajele, ștergere chat golește transcriptul, păstrează metadatele documentelor, împiedică reapariția la listări și salvările vechi. Date sintetice șterse. QA vizual în browser neexecutat. 0.7.0.

Sites a confirmat publicarea privată 0.7.0, cu migrarea nouă inclusă. Arhiva și fișierele din repository verificate fără secrete.

## 2026-10-04 — P-023: documente editabile și exportabile

Documentul creat de AI are titlu și conținut persistat în mesaj; dialog automat și card de redeschidere. Editor direct cu formatare de bază, previzualizare, salvare cu revizie și protecție pentru modificări nesalvate. Export local PDF/DOCX cu surse, fonturi și licență incluse. Fără migrare SQL sau apel AI suplimentar pentru clasificare.

Verificări și limite documentate în docs/DOCUMENT_EDITOR.md. Trei apeluri AI reale (inclusiv deschidere automată în UI), persistență/editare/izolare/validare trecute; exporturi binare și PDF vizual verificate; interfața locală verificată cu fixture sintetic. TypeScript și build trecute. Versiune 0.8.0; publicarea privată confirmată de Sites. Arhiva și repository-ul au trecut verificarea fără secrete. Serverele temporare oprite și fixture-urile locale șterse.

## 2026-10-04 — P-024: centrare editor

Centrare explicită a dialogului cu inset și margin auto, lățime maximum 1120px și margini de 32px pe desktop; spațiere adaptivă a foii. Mobilul păstrează dialogul pe tot ecranul. Build trecut; verificare vizuală în browser local la 1280×720, dialog centrat cu 80px stânga/dreapta și 32px sus/jos. Arhivă verificată fără secrete, publicare privată 0.8.1 confirmată de Sites. Serverele de test oprite și fixture-ul local șters. Mobilul nu a fost verificat vizual în această ajustare.

## 2026-10-04 — P-025: paletă globală

Culorile vechi înlocuite cu variabile comune; roluri explicite pentru acțiuni, selecții, progres, salvare și erori. Aplicare în toate componentele active, favicon și focus. Înlăturată metadată temporară de preview. 0.8.2: build trecut; verificare vizuală desktop pentru chat, navigare, bibliotecă (inclusiv sursă selectată) și editor. Culori calculate în browser confirmate: fundal rgb(248,250,252), text rgb(15,23,42), acțiune rgb(37,99,235), salvare rgb(16,185,129). Fără verificare mobilă în această schimbare. Arhivă verificată fără secrete; publicare privată confirmată de Sites. Fixture-ul local șters, serverele temporare oprite.

## 2026-10-04 — P-026: cerințe permanente web și mobil

Înregistrate toate cele 20 cerințe ale utilizatorului în PRODUCT_REQUIREMENTS.md, cu aplicare web/Android/iOS. AGENTS.md și CONTRIBUTING.md solicită respectarea lor în schimbările viitoare. P-027–P-030 urmăresc implementarea, fără a o prezenta drept finalizată. Verificare: lista completă și legăturile locale; schimbare exclusiv de documentație, fără republicare sau modificare a comportamentului site-ului. Versiunea aplicației rămâne 0.8.2.

## 2026-10-04 — P-031: mod întunecat

Provider next-themes deja instalat, preferință în localStorage profos-theme, sistem implicit și inițializare înainte de hidratare. Buton semantic în antet; variabile separate pentru acțiuni și linkuri ca să păstreze contrastul. Toate suprafețele, inclusiv editorul, adaptate; exporturile rămân pentru tipărire. Cerințe afectate: minimizarea datelor (preferință numai locală), contrast și navigare cu tastatura. 0.8.3: build trecut; activare, persistență după reload și comutare cu Enter verificate în browser local. Chat, bibliotecă și editor inspectate vizual în dark mode. Raport contrast calculat pentru text principal 17,06:1, text secundar 6,34:1, link 7,56:1, buton albastru 5,17:1, salvare emerald 7,04:1. Nu reprezintă audit complet de accesibilitate; mobilul și schimbarea automată a temei sistemului nu au fost testate. Arhivă fără secrete; publicare privată confirmată. Fixture-uri locale șterse și servere oprite.

## 2026-10-04 — P-032: cont și setări, pregătire Supabase + Resend

Utilizatorul nu are încă domeniu sau conturile furnizorilor și a cerut pregătirea integrării și pașii. Secțiune dedicată cu profil actual, securitate, login/register/recuperare, aspect și cookie-uri/stocare. Memorare opțională pentru temă. Sites păstrează autentificarea platformei; providerul Supabase se activează numai prin configurare explicită în găzduirea potrivită. Identități separate, fără asociere automată sau migrare de date după e-mail.

Cerințe afectate: date minime (e-mail, parolă administrată de Supabase, nume opțional; fără telefon), sesiuni HttpOnly și verificare server, mesaje fără promisiuni false, controale etichetate și navigabile, documentarea serviciilor și lipsa trackerelor proprii. Politicile reale, ștergerea completă a contului, antiabuz și auditul integral rămân în backlog.

TypeScript și build trecute. Probe locale Sites: identitate/header, API-uri private, CSRF, creare/izolare/ștergere istoric. Test reproductibil `npm run test:account` cu serviciu Auth simulat: verificare e-mail, autentificare, cookie-uri HttpOnly/SameSite, registrare fără sesiune, respingere autoconfirmare greșită, profil/e-mail, recuperare, schimbare parolă, logout, PKCE, redirect fix și sesiune falsificată. UI desktop și 390px: pagini, formulare dezactivate, temă și memorare după reload verificate. Loginul și livrarea reală prin furnizori nu sunt verificate; nici fluxurile mobile native.

Continuare: utilizatorul a cerut explicit GDPR și DPIA pentru întregul proiect. Cerința a devenit permanentă în AGENTS.md și PRODUCT_REQUIREMENTS.md. Inventar și evaluare DPIA preliminară redactate din cod, cu riscurile pentru copii, AI/web, retenție/ștergere, furnizori și migrare. Surse oficiale EDPB/Comisia Europeană/ANSPDCP consultate. P-034 și condițiile de activare păstrează distincte probele tehnice, aspectele neimplementate și aprobarea operatorului; nu se declară conformitate completă.

Publicare privată 0.9.0 confirmată de Sites (deployment appgdep_6ac2558e7e1481918c2482c84f10f0ce; source a616683fb786914329ddb0fde5f06d809b84bd70). Arhivă și repository verificate fără secrete și fișiere locale excluse. Serviciile externe nu au fost activate, audiența și configurația serverului găzduit au fost păstrate. Serverele locale oprite și conversațiile sintetice eliminate.

## 2026-10-04 — P-035: Google și Apple în prima etapă

AUTH_EMAIL_ENABLED implicit fals; UI și toate operațiile server de e-mail/parolă, plus callback token hash, blocate când este fals. Codul viitor păstrat pentru domeniu/Resend. Ghid actualizat pentru conturile existente, distincția callbackurilor și setarea globală de signup vs flagul local. TypeScript/build și ambele suite Auth simulate trecute, inclusiv zero apeluri la furnizor pentru operațiile dezactivate și PKCE Google/Apple. Browser local: numai butoane sociale, fără register/forgot în securitate sau formular e-mail la ?view=register. Configurarea externă și testele OAuth reale încă lipsesc. Cerințe date minime/DPIA actualizate; nicio cheie nouă, schimbare de audiență sau trimitere de e-mail.

Publicare privată 0.9.1 confirmată (appgdep_6ac2626bcc488191ba6755abea5d302f; source 08c92f90b1d98b40215dcdaf8823f32fb32be8c9). Arhivă/repository fără secrete. VERSION actualizat și metadatele lockfile pentru source-map-support corectate la versiunea instalată/rezolvată 0.8.1, fără schimbarea dependenței. Serverul local oprit.
