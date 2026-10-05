# Jurnal de lucru

## 2026-10-01 — Inițializare

- Creat documentația proiectului și structura pentru urmărirea lucrului.
- Nu existau materiale în sources/ din care să deducem cerințe suplimentare.
- Verificat contul GitHub conectat: marcossoames.
- Repository-ul marcossoames/ProfPlus nu a fost găsit prin conector.
- Crearea prin plugin/browser a fost blocată inițial. După autentificarea GitHub CLI de către utilizator, repository-ul privat marcossoames/ProfPlus a fost creat și configurat ca origin.
- Următorul pas: definirea MVP-ului și setului de evaluare, P-001 și P-002.

## 2026-10-01 — P-005: pregătire API

- Adăugat configurarea locală a cheii, .env.example și testul API cu o întrebare fixă.
- Verificat sintaxa Python, ignorarea .env în Git și mesajul pentru cheia lipsă; fără apeluri API reale.
- Urmează: utilizatorul salvează cheia local, apoi verificăm conexiunea.

## Șablon pentru intrări viitoare

## 2026-10-01 — P-005: conexiune API verificată

- Utilizatorul a salvat cheia local; cheia nu a fost afișată sau comisă.
- Primul test s-a oprit din cauza lipsei certificatelor în instalarea Python. Adăugat fallback la certificatele sistemului macOS, fără dezactivarea verificării TLS.
- Apel real reușit cu gpt-4.1-mini: „Conexiunea ProfPlus funcționează.” Consum: 24 tokeni de intrare, 12 de ieșire, 36 total.
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

Confirmată organizația gratuită ProfOS-Edu în contul utilizatorului. Repository-ul transferat prin API; verificat noul proprietar ProfOS-Edu/ProfPlus și vizibilitatea PRIVATE. Origin actualizat fără rescrierea istoricului. Invitațiile așteaptă username-urile colegilor; integrarea Claude nu a fost verificată. Site-ul folosește repository-ul separat Sites și nu necesită republicare pentru acest transfer.

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

## 2026-10-04 — P-036 — Rebranding ProfPlus și inspecție externă

Implementat numele ProfPlus în chat, cont/setări, bibliotecă, metadata, instrucțiunea AI, numele indexurilor noi, pachet și documentație. Repository privat redenumit ProfOS-Edu/ProfPlus, origin actualizat; numele afișat al organizației GitHub și titlul Sites devin ProfPlus. Supabase afișează repository-ul redenumit. Numele App ID Apple uniformizat și salvarea confirmată în lista identificatorilor.

Inspectat proiectul Supabase ProfPlus, regiunea UE, integrarea Git/main, providerii, URL-urile și limitele Auth; Apple App ID/capabilitate, Services IDs, Keys și reînnoirea membership. Google/Apple sunt dezactivate în Supabase; Email activ necesită aliniere cu etapa social-only. Apple nu are capacitatea activată sau Services ID/cheie dedicate ProfPlus. Nu s-au citit/generat chei private, activat provideri, cumpărat abonamente sau migrat date. Raport în docs/AUTH_CONFIGURATION_REVIEW.md; blocajele de activare rămân P-033.

Verificări executate: TypeScript, build local și build din sursa Sites, git diff --check, scanare arhivă și intrări Git pentru fișiere excluse/chei locale. QA browser local: nume/titlu/etichete ProfPlus, cont/securitate, mod întunecat și persistență după reload. Browserul local fără identitate refuză istoricul; nu s-au efectuat apeluri AI sau loginuri OAuth reale. Compatibilitate păstrată pentru cookie și localStorage. Cerințe afectate: transparență, continuitatea accesului/preferințelor și documentația furnizorilor; DPIA actualizată fără schimbarea fluxurilor sau aprobări fictive.

Publicare privată 0.9.2 confirmată de Sites (status succeeded, titlu ProfPlus, sursă cca44a227e1773e665b753e5a71a79d0fc6d762a, deployment appgdep_6ac29ff9ea048191a676b6d89b7cfbdb). URL-ul și accesul existent păstrate.

QA după publicare: titlu, navigare și eticheta asistentului ProfPlus confirmate în browserul live; istoricul existent și documentul generat anterior rămân accesibile. Captură locală păstrată în directorul ignorat de Git.

## 2026-10-04 — P-033 — Configurare autentificare fără domeniu propriu

Email este dezactivat în Supabase (Disabled verificat); telefonul și autentificarea anonimă rămân dezactivate. Google este activ în Supabase (Enabled verificat), folosind clientul existent ProfPlus Web și secretul original din fișierul local. Callbackul clientului Google a fost corectat și salvat către https://dgozbrdvmmtwhfrefjln.supabase.co/auth/v1/callback. Verificările nonce și cerința de e-mail au fost păstrate. Secretul nu este inclus în repository sau în acest raport.

Google Auth Platform: External / Testing, zero test users; Branding ProfPlus, suport/contact ajutor.profplus@gmail.com, domeniu Supabase. Linkurile publice de homepage/politici lipsesc. Data Access salvat cu exact openid, userinfo.email și userinfo.profile (notificarea Data access changes saved verificată); loginul real nu a fost încă validat și nu s-a publicat aplicația OAuth.

Apple: App ID profplus.ro are Sign In with Apple activ ca Primary App ID. Services ID ro.profplus.web (ProfPlus Web) este creat și activat, asociat cu ProfPlus, domeniul Supabase și callbackul de mai sus; starea bifată a fost verificată după salvare. Cheia dedicată ProfPlus Sign In a fost creată, Key ID ADSNFYHLSN. Portalul marchează descărcarea drept efectuată, dar API-ul browserului nu a returnat fișierul și nu a fost găsit local. Utilizatorului i s-a solicitat verificarea dialogului de salvare/căii. Nu se recreează sau revocă cheia implicit. Providerul Apple rămâne dezactivat până la accesul sigur la fișier și generarea secretului semnat.

Aplicația nu a fost încă trecută pe Supabase; ținta localhost/pilot Sites rămâne de clarificat. Nu s-au migrat date sau modificat accesul site-ului privat. Login/logout/refresh, Apple relay și izolarea cu identități Supabase reale rămân netestate. P-033 rămâne IN PROGRESS; Resend este amânat până la domeniu.

Verificare: stări dashboard Google Enabled / Email Disabled, confirmare salvare client Google, Apple Services ID bifat după salvare și cheia creată. Nu sunt probe OAuth end-to-end. Cerințe afectate: minimizarea datelor, identitate, audit furnizori și păstrarea accesului privat; DPIA actualizată fără declararea conformității.

Actualizare descărcare: titularul nu găsește alt fișier descărcat; folderul indicat conține numai credentialul Google. Apple marchează cheia ADSNFYHLSN drept Downloaded și nu mai oferă descărcare. Fișierul privat nu este disponibil; înlocuirea/revocarea necesită intervenția titularului conform politicii browserului pentru schimbarea credențialelor. Nu s-a creat o a doua cheie și nu s-a revocat prima.

## 2026-10-04 — P-033 — Apple activ și test local OAuth

Cheia nouă salvată de titular găsită și protejată 0600, asocierea ProfPlus verificată. Secret Apple ES256 verificat criptografic și salvat numai în Supabase; Apple Enabled confirmat. Expirare 2 aprilie 2027, 20:04:40 UTC. Configurare locală ignorată de Git: Supabase + numai Google/Apple, localhost:3000. Server pornit. Browser verificat: numai butoane sociale și redirecturi oficiale Apple/Google; loginul complet și sesiunile așteaptă autentificarea titularului. Nicio migrare, publicare, revocare sau aprobare GDPR/DPIA presupusă. Raportul AUTH_CONFIGURATION_REVIEW.md actualizat.

## Verificare OAuth real — 2026-10-04

După loginurile efectuate de titular prin Google și Apple, Supabase afișează ambele identități Apple, Google pe aceeași înregistrare de utilizator. Nu s-a făcut asociere manuală în ProfPlus și nu se copiază datele personale/UID-ul în Git. În aplicația locală profilul este autentificat, e-mail verificat; sesiunea rămâne validă după reîncărcarea paginii. Asocierea celor două metode și callbackul real sunt confirmate pentru contul testat. Logout, reînnoirea la expirare, Apple Hide My Email și izolarea între conturi distincte rămân netestate. Aceasta nu validează site-ul online sau conformitatea GDPR/DPIA.

## 2026-10-04 — P-037 — Clarificarea stării contului

Capturile titularului indicau cont autentificat, dar secțiunea securitate afișa numai disponibilitatea metodelor și linkul Conectare. API-ul de cont expune acum numai lista filtrată/deduplicată a providerilor din identitățile utilizatorului verificate prin getUser, fără ID-uri/metadata OAuth suplimentare. UI afișează «Asociat contului», confirmă sesiunea și ascunde Conectare când este autentificat. Browser local: salvarea numelui existent a returnat «Profil salvat», ambele metode asociate afișate. Build, TypeScript și ambele suite Auth trecute; testul contractului verifică lista exactă și excluderea providerilor neacceptați. Nicio migrare sau publicare.

Lint punctual: nu trece din cauza regulilor existente în pagina cont (setState în efect și ancore HTML pentru rute interne); nu este raportat ca trecut. Erorile sunt în cod preexistent, în afara schimbării etichetelor. TypeScript/build și suitele Auth sunt trecute.

## 2026-10-05 — P-038 — Profil didactic și ștergere cont locală

Implementate delogare vizibilă, configurare didactică la prima conectare și editare ulterioară, preselecție și filtru de bibliotecă. Date persistate: rol, disciplină, cicluri; fără date despre școală/elevi. Denumirile disciplinelor sunt normalizate pentru diacritice, fără a amesteca limbile manualelor. Selecțiile explicite ale chatului sunt păstrate; încărcările proprii rămân disponibile.

Ștergere: identitate verificată, origine, confirmare și autentificare recentă; eliminare documente/indexuri/fișiere, D1 și identitate Supabase, cu blocare și reluare după eșec. Configurată cheia administrativă existentă cu aprobarea titularului, numai în fișierul local 0600 ignorat. Cheia completă a fost verificată prin acces administrativ read-only, fără ștergere reală. O valoare mascată din UI a fost detectată în verificare și înlocuită cu valoarea completă înainte de finalizare. Revocarea Apple rămâne manuală și separată, fără să blocheze ștergerea ProfPlus.

Verificări: TypeScript/build și suitele de profil/Auth trecute; fixture D1/R2 izolat, original șters, marker eliminat, alte conturi păstrate, provider întrerupt/retry, autentificare recentă, confirmare și identitate derivată de server. Pipeline OpenAI verificat cu adaptoare simulate. Lint punctual cont/module noi: fără erori, două avertismente privind navigarea completă intenționată pentru sesiune/profil. Browser real local: roluri/validări, dialog, anulare și 390px fără overflow. Profilul didactic real nu a fost modificat și contul titularului nu a fost șters. Capturi locale ignorate de Git.

Cerințe afectate: minimizarea datelor, drept de ștergere, transparență, controlul surselor, tastatură/etichetare, acces administrativ și proiectarea pentru web/mobil. DPIA și inventarul actualizate; P-030/P-034/P-039 rămân deschise pentru retenții/loguri/backup, revocarea automată Apple, monitorizarea erorilor finale și probe reale dedicate. 0.9.3 este locală, fără publicare online sau migrare de identități.

## 2026-10-05 — P-040/P-041/P-047 — versiunea locală 0.9.4

Selecție automată după profil, toate categoriile indexate și accesibile, documente private din orice conversație proprie și importuri indexate ulterior. Categorii/disciplină/cicluri editabile prin API cu ownership și valori permise; fără clasificare retrospectivă inventată. Mod personalizat persistent; mod automat compact în istoric și rezolvat din nou pe server. Metadatele noi sunt șterse cu documentul/contul. Cererile de căutare în indexuri private sunt limitate la 4 simultan.

Profil și profil didactic reunite la cererea titularului: un element Profil, formular comun și salvare împreună pentru nume și activitatea didactică. Serverul validează tot înainte de updateUser; cazul invalid nu modifică numele. Onboardingul și aliasul vechi view=teaching funcționează. Supabase skill/checklist, changelogul oficial și documentația updateUser/SSR consultate; nu s-au modificat providerii, credențialele sau tabelele Supabase. Pachetele Supabase sunt fixate la versiunile deja instalate și lockfile-ul păstrat.

Securitate: toate cerințele titularului în SECURITY_REQUIREMENTS, AGENTS, CONTRIBUTING și PRODUCT_REQUIREMENTS, cu starea reală în SECURITY_REVIEW și lucrări separate P-042–P-046. Scanner redactat pentru surse, istoric Git accesibil (inclusiv commit/tag) și bundle client, comparând și secrete locale fără a le afișa; nicio potrivire în verificarea finală executată. Nu pretindem acoperirea tuturor tipurilor de secrete sau a altor clone/loguri. .gitignore extins; sursele Worker/plugin din web/build incluse după identificarea excluderii accidentale. CI săptămânal/push/PR/manual cu permisiuni read și acțiuni fixate; auditul high rămâne blocant.

Remedieri: origine prezentă obligatorie pentru mutații, autentificare pentru bibliotecă/stare, ownership al chatului la upload, DTO istoric fără user_id/deleted, headers la Worker și redirect HTTPS înainte de handler în afara loopback. CSP încă permite inline; strict nonce/hash rămâne deschis. Next 16.3.8, React/React DOM/React Server DOM Webpack 19.3.0 și actualizări tranzitive compatibile: audit 28 → 19 alerte (0 critice, 12 high, 7 moderate). Nu s-au aplicat downgrade-uri incompatibile sau force; toolchainul rămas se urmărește în P-046.

Verificări trecute pe codul final: TypeScript/build, suite profil/Auth/API și erasure în ambele moduri, toate categoriile, material nou indexat, discipline/cicluri/limbi, ownership, CSRF/JSON, moduri de selecție, ștergerea etichetelor cu păstrarea altui cont, salvare comună atomică din perspectiva validării, headers/HTTPS. Cont și documente exclusiv fictive pentru probele de mutație/ștergere; fără apeluri AI reale pentru aceste fixture-uri. Browser: profil comun, o intrare Profil și o salvare, alias vechi, salvare/reload, 390px fără overflow; încadrare Concurs salvată, filtrată și redeschisă, dialog fără overflow. Capturi ignorate în .sites-runtime/evidence; o problemă inițială de lățime intrinsecă a selecturilor a fost corectată și reverificată.

Cerințe afectate: acces server, minimizarea datelor, ștergere, transparența folosirii surselor private între conversații, accesibilitate și protecția credențialelor. DPIA actualizată fără aprobare fictivă. Rate limiting, boți, RLS/roluri/școli viitoare, malware, pseudonimizare, audit log, export complet și retenție rămân neimplementate complet. Nu s-a șters contul real, nu s-au migrat date Sites și nu s-a publicat online. Serverul local principal rămâne pe localhost:3000; preview-ul 3099 și datele fictive sunt închise după verificări.

## 2026-10-05 — P-048, 0.9.5, import extins în curs

- Recitit catalogul public și regulile de URL: aceleași 1.341 înregistrări/1.349 volume; matematică 113, fizică 36, informatică/TIC 52, rest 1.148. Cele două reprezentări de slash au răspuns 206/PDF.
- Confirmat indexul existent: 21 volume completed, reconciliat finalizarea locală rămasă uploaded. Cheia server existentă autorizată și indexul aplicației coincid, fără afișare.
- Import matematică pornit efectiv. Un PDF complex a ținut extracția ocupată; procesul a fost oprit controlat, fără eliminarea surselor indexate, și reluat cu extracție izolată/timeout. Erorile tranzitorii au fost reluate din checkpoint.
- Coada separată continuă materiile și OCR; modele oficiale locale suplimentare, raport public minimal, supraveghere în chat la 15 minute. P-048 rămâne IN PROGRESS.
- Contor integral actualizat și paginație verificată. TypeScript/build, suite Auth/API, șapte teste import offline și test bibliotecă paginată trecute. Căutare reală manual matematică VIII 1934-1: cinci rezultate, UID și pagini 7/8/37/38/68 în limite; fără transcriere de text în Git.
- Nu s-au modificat secrete, conturi, RLS sau furnizori; nu s-au publicat PDF-uri/texte și nu s-a făcut redeploy online. Condițiile de producție și evaluarea formulelor rămân deschise. Starea numerică exactă este fotografia datată din catalog/manual-import-status.json.

- Verificare reală fizică VI 1375-1 și informatică/TIC VII 1163-1: câte cinci rezultate, toate cu UID corespunzător și pagini PDF valide. Audit Python pentru cele două cerințe și dependențele tranzitive: șase pachete, fără vulnerabilități cunoscute raportate. Audit npm rămâne 19 alerte (0 critice, 12 high, 7 moderate); nu se declară remediat. Scanarea surselor/istoricului accesibil/clientului nu a găsit potriviri de secrete.

- O reconciliere globală a eșuat temporar cu API_NETWORK_ERROR și a oprit coada; finalizările confirmate s-au păstrat. Adăugată reluare limitată a erorilor globale de rețea în etapa de text, fără retry pentru acces/cotă/spațiu; mesajele și checkpointul de eroare sunt redactate. Coada a fost repornită din starea existentă.

- Milestone 2026-10-05T14:51:48Z: prima trecere prioritară terminată, matematică 89 indexate/24 OCR, fizică 35/1, informatică/TIC 51/1; erorile celor două volume informatice au fost reluate cu succes. Coada a intrat efectiv în text_alte_materii. Raportul public rămâne datat, importul și OCR în curs. Verificarea cu pragul aplicației 0,25 și rewrite_query a trecut pentru toate cele trei grupe.


## 2026-10-05T14:58:04Z — P-048, urmărire import

214 volume indexate (+27), 37 necesită OCR, 3 în indexare, 1.095 pending. Procesul principal și copilul sunt active, fără import duplicat sau întrerupere. Raport din checkpoint, nu reconciliere remote finală. Scanare Git/client fără potriviri și diff verificat; niciun cod modificat în acest milestone. Importul continuă la celelalte materii.


## 2026-10-05 — P-048, OCR prioritar la cererea utilizatorului

Coada precedentă și copilul identificate prin PID/comandă, oprite pentru schimbarea explicit cerută, checkpoint păstrat. Noua coadă activă în ocr_matematica; fără import simultan. Șapte teste offline trecute, inclusiv retry și oprire la cotă; monitorizarea actualizată. Volumele completed sunt omise și referințele remote reconciliate la reluare. Fără schimbare de furnizor, date personale sau credențiale; aceeași procesare locală și index autorizat.


## 2026-10-05 — P-050, mesaje fără login

Implementat guest pe endpointul chat și interfață; surse exclusiv comune din pilot, fără persistarea mesajelor în istoric sau upload. Teste simulate: răspuns guest, ID privat/revision/selection refuzate, validare rol, 429 și contor agregat. TypeScript/build trecute. Fără modificarea cozii OCR, credențialelor sau publicare online.

P-050: test real în browser fără sesiune, «Cât este 2 + 2?» → «2 + 2 este egal cu 4.», fără redirecționare. Captura locală ignorată .sites-runtime/evidence/guest-chat.png. Scanare surse/istoric/client: zero potriviri; nu reprezintă audit complet.
