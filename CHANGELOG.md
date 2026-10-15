# Istoricul versiunilor

## Nelansat — P-088

- Acțiuni „Citește articolul” aliniate la baza cardurilor.
- O singură revenire la toate știrile, prin navigare completă care reîncarcă lista.
- Caseta mare Acasă și spațiul replicii Plusi nu se mai redimensionează când se schimbă mesajul.

## Publicat pe Site v36 — P-087 — 2026-10-15

- Tab nou „Meditații”: anunțuri de meditații publicate de profesori, filtre, contact pentru utilizatori conectați, raportare și moderare.
- Eliminată animația cu Plusi între taburi; bara tabului activ rămâne.
- Design mai sobru: titluri fără accente decorative, hover discret, mișcare calmă, taburi derulabile pe telefon.

## Publicat pe Site v35 — P-086 — 2026-10-15

- Alegere GPT-4.1 mini / GPT-6.1 Sol în chat și setările contului, pentru testare.
- Model afișat per răspuns; generare și revizie cu aceeași alegere, validată server-side.
- Preferință per cont în browser; biblioteca și indexul existente păstrate.

## Publicat pe Site v34 — P-085 — 2026-10-15

- Caseta turului Plusi păstrează dimensiunea la schimbarea mesajului; textul lung se derulează în interior, inclusiv prin tastatură.

## Publicat pe Site v33 — P-084 — 2026-10-15

- Înlocuită dependența vulnerabilă de glob din uneltele de build/lint; auditul npm strict rămâne activ.
- Corectat fundalul transparent al dialogului „Adaugă o clasă”, inclusiv tema întunecată, prin disponibilitatea culorilor în portaluri.
- Verificările CI pe commitul publicat pot furniza dovezile pentru probele blocate exclusiv de mediul local; limitele se raportează separat.

## Publicat pe Site v33 — P-083 — 2026-10-15

- Tur ghidat de Plusi la prima intrare pe fiecare pagină, cu evidențierea elementelor, reluabil oricând.

## Publicat pe Site v33 — P-082 — 2026-10-15

- Flux automat de știri din surse RSS publice despre educație, publicat în lista completă (titlu, extras, link).
- Acasă recomandă automat știrile importante și pe cele relevante pentru profilul tău, păstrând aranjarea principal + trei secundare.
- Admin: „Actualizează fluxul automat”.

## Publicat pe Site v33 — P-081 — 2026-10-15

- Clasele mele salvate în cont, cu documente pe secțiuni (generare cu Plusi, încărcare, ștergere), conversațiile clasei, observații și personalizări.
- Documentele clasei devin surse automate în conversațiile clasei.
- Favicon cu logo-ul verde; mod întunecat cu paleta verde și culori lizibile pe toate paginile.

## Publicat pe Site v33 — P-080 — 2026-10-15

- Tab „Bibliotecă personală” în Cont (`/account?view=library`) și `GET /api/library/personal`; încărcare prin `/api/documents` cu `scope=library`.
- Întrebarea lui Plusi la prima deschidere a asistentului pentru adăugarea documentelor folosite des.
- Documentele personale gata devin surse automate în toate conversațiile și sunt marcate în „Alege sursele”.
- Reacții animate ale lui Plusi la atingere, înot între taburi cu indicator glisant și tranziții direcționale între pagini; mișcare redusă respectată.

## P-079 — DONE — Dashboard practic și flux de știri — 2026-10-14/15

Responsabil Marcos Soames, issue #23. Dashboard pe trei zone, editor cu previzualizare și acțiuni distincte ciornă/publicare, poziții clare pe Acasă și înlocuire atomică păstrând știrea anterioară în lista completă. Citire cu titlu unic/paragrafe, principal + trei secundare, căutare/filtre și paginare public/admin. Membership și audiență păstrate; migration și probe reale rollback trecute. [Utilizare, dovezi și limite](docs/NEWS_EDITOR.md). Publicat pe main f09ff47 și Site succeeded la 00:04 București, 2026-10-15; dovezi în jurnal.

## P-078 — DONE — Unificare, antet mobil și admin/știri — 2026-10-14

Responsabil Marcos Soames, issue #22. Varianta funcțională Supabase combinată cu interfața P-074 și controalele P-077; copie operațională/backup păstrate. Antet responsive și cont aliniat, dashboard cu statistici agregate, rol persistent server-only pentru contul autorizat și știri principal + trei secundare cu draft/publicare/arhivare. Migration aplicată și controale reale de izolare/atomicitate trecute cu fixture-uri rollback. [Comportament și limite](docs/UNIFIED_APP_ADMIN.md). Publicat: main bd5f6b3 și Site succeeded, 21:57 București; livrarea este consemnată în jurnal.

## P-077 — 2026-10-14

- Control „Exerciții” pentru numărul de originale, preluate exact și din surse cu numai numere schimbate; descriere liberă și instrucțiune de precizare în prompt.
- Preferințe salvate pe conversație și verificarea compoziției/provenienței înainte de livrarea documentului.
- Deselectarea tuturor concursurilor sau olimpiadelor dintr-un clic, selectare/deselectare a tuturor rezultatelor filtrate și bibliotecă mobilă derulabilă.


## P-076 — 2026-10-14

- Separatoarele dintre secțiuni devin linii discrete, fără pagină nouă implicită în PDF/Word.
- Export PDF cu titlu centrat unic, spațiere compactă, punctaje de secțiune în dreapta și răspunsuri A-D distribuite pe rând.
- Titluri împreună cu începutul secțiunii și grupare a problemelor finale/bonusului când grupul este scurt; salturile explicite rămân disponibile.
- Regresie pe export real cu formule: același test trece de la 7 la 2 pagini.


## P-075 — 2026-10-14

- Două modele de test de clasa V furnizate de titular: structură, aranjare în pagină și dificultate pentru numere naturale și puteri.
- Distribuția punctajelor urmează modelul selectat; bonus separat, fără aplicarea structurii clasei VI la clasa V.
- Publicarea automată a actualizărilor pe GitHub reconfirmată în instrucțiunile agenților.


## P-074 — 2026-10-13

- Antet cu tab-urile Acasă, Asistent virtual, Documente personale, Clasele mele și mascota Plusi, conform designului din `docs/design/`.
- Chatul existent mutat în tabul „Asistent virtual” și restilizat (Plusi ca avatar, bule verzi, bara laterală crem).
- Documente personale (39 de documente, 5 secțiuni, progres), Clasele mele (adăugare, meniu, ștergere) și Plusi plutitor cu mini-chat de ajutor; stare locală în browser.
- Temă implicită luminoasă, paletă verde/crem, Roboto găzduit local; aranjare stabilă între tab-uri.

## P-073 — 2026-10-12

- Istoricul și toate implementările existente consolidate pe main, păstrând funcțiile publicate P-072.
- Rezumatul final al importului oprit și raportul de consolidare versionate fără secrete/date private.


## P-072 — 2026-10-12

- Manualele au pasaje rezervate pentru teste/planificări; sursele complementare și prioritățile profesorului rămân active.
- Structura comună a testului are valori implicite explicite, revizie AI separată; planificarea verifică șablonul și antetul înaintea livrării.


## P-071 — 2026-10-11

- Păstrarea materialelor didactice și a suportului pentru planificări/lecții; excluderea formularelor administrative și reducerea navigării duplicate în import.
- Păstrarea rutelor ONI/Infoarena/Mateinfo și a documentelor utile pentru examene.


## 2026-10-11 — P-070, publicat privat

- Zece modele structurale anonimizate ale titularului, selecție după tip și clasă, prioritate pentru modelele personale.
- Proiectarea unității de învățare distinctă de planificare/proiectul de lecție; algebră și geometrie în paralel câte două ore, cu totaluri sincronizate.


- P-069: editor LaTeX cu sursă exactă salvată, previzualizare simplificată, export .tex, conversie vizuală explicită și copie fără proveniență. Compilarea exactă se face în Overleaf.

## P-068 — Modele personale de documente — 2026-10-11

Responsabil: Marcos Soames, la cererea titularului. Modele private pentru test, barem, planificare, proiect de lecție și fișă; marcarea din bibliotecă și folosirea în toate conversațiile după tip/materie/ciclu. Modelele personale au prioritate pentru fiecare tip; registrul comun primește doar exemplele titularului aprobate și anonimizate. Registrul este deocamdată gol: exemplele nu au fost încă furnizate. Stilul standard a devenit sobru, fără introduceri și ornamente automate. [Comportament, verificări și limite](docs/DOCUMENT_MODELS.md). P-065 și P-067 sunt integrate pe main la `08642f9`; de acum livrare direct pe main fără PR, conform instrucțiunii explicite din 2026-10-11. Importul bibliotecii este separat.


## P-067 — Surse prioritare și copie pentru elevi — DONE, 2026-10-11

Responsabil uman: Marcos Soames; cerere directă a titularului. Toate materialele potrivite pot rămâne selectate; steaua marchează maximum 10 surse comune și 10 documente proprii prioritare pentru enunț. Copia pentru elevi ascunde proveniența, citările și referințele la un singur click, inclusiv în PDF/Word. Formulele, variantele și spațierea sunt formatate. Implementare izolată în `feat/P-067-teacher-test-controls`, dependentă de P-065/PR #13 pentru păstrarea corecției bibliotecii deja publicate. [Dovezi și limite](docs/TEACHER_TEST_CONTROLS.md). Importul bibliotecii rămâne separat în curs.


## P-065 — 2026-10-11

P-065: biblioteca Supabase folosește confirmările importurilor, cache comun 60 s și încărcare paralelă a documentelor proprii; disponibilitatea AI rămâne condiționată de indexarea confirmată. [Dovezi](docs/LIBRARY_LOADING.md).

## P-063 — renunțare la materialele cu erori, 2026-10-10

Titularul a autorizat omiterea materialelor cu erori: referință verificată în Supabase înainte de eliminarea cache-ului local, fără redescărcare automată. Cele 10 PDF-uri rămase după erori (394.205.365 bytes) au fost eliminate. Importul valid al concursurilor continuă; companionul păstrează și linkurile pentru erorile lui. [Flux, dovezi și limite](docs/FAILED_MATERIALS.md).


## P-062 — 2026-10-09

Implementată omiterea originalelor peste 50 MB cu sursa păstrată; reluat importul concursurilor și continuat transferul manualelor. Codul, testele, curățarea verificată și publicarea sunt documentate în [IMPORT_CONTINUATION.md](docs/IMPORT_CONTINUATION.md). Transferul întregii biblioteci rămâne **IN PROGRESS**, separat de livrarea codului; nu sunt declarate toate originalele în cloud.


## Nelansat — colaborare

- P-052: ghid comun, templates issue/PR, review independent și checkout-uri separate; în review.
- P-054: proveniență per exercițiu în teste și fișe, cu surse și pagini confirmate; etichete preluat/adaptat/original AI.
- P-046: actualizări toolchain și corecții tranzitive; audit 2026-10-06 redus de la 21 la 8 alerte high, toate provenite din braces fără versiune reparată. Verificări remote în așteptare.
- P-053: teste actualizate pentru biblioteca publică și cererile fără Origin; verificarea chatului guest inclusă în CI.

## Ne lansat încă

- P-052/P-053: proveniență pentru fiecare exercițiu, referințe în document și opțiune PDF/Word cu doar sursa.

- Găzduire independentă, retenții operaționale și revocare Apple automată rămân de finalizat; site-ul publicat este încă 0.9.2.

## 0.9.5 — 2026-10-05 — import extins în curs, local

- Coada reluabilă matematică → fizică → informatică/TIC → celelalte materii, text apoi OCR, în indexul comun existent. Raport pe fiecare volum fără secrete/texte; urmărire periodică în chat.
- Reconciliere remote, retry limitat, PDF în subprocess cu timeout, minimum 90% pagini cu text pentru volume noi, modele OCR pentru disciplinele relevante și restricționarea surselor/redirecturilor HTTPS.
- Contorul și disponibilitatea acoperă toate manualele indexate; bibliotecă paginată verificată pentru materii în afara pilotului. Importul întregului catalog și evaluarea pedagogică nu sunt declarate finalizate.
- TypeScript/build, suite Auth/API, șapte teste import offline și test bibliotecă paginată trecute; căutare reală într-un manual nou cu UID și pagini verificate. Fără publicare online.

## 0.9.4 — 2026-10-05 — pilot local

- Profil și profil didactic reunite într-un singur formular, cu salvare comună și validare pe server; linkuri vechi compatibile.
- Biblioteca selectează dinamic toate materialele indexate potrivite materiei/ciclurilor; selecțiile personalizate se păstrează. Documentele proprii din alte conversații rămân private.
- Tipuri manual, culegere, olimpiadă, concurs și document, cu etichete editabile; ștergerea include metadatele noi.
- Cerințe de securitate permanente, raport cu dovezi și lipsuri, scanner Git/client redactat și workflow CI săptămânal/la PR/push.
- Origine obligatorie pentru mutații, ownership al conversației la upload, autentificare pentru bibliotecă, DTO istoric și headers/HTTPS la Worker.
- Next 16.3.8 și React/React DOM/React Server DOM Webpack 19.3.0; auditul scade de la 28 la 19 alerte, fără critice. Cele 12 high și 7 moderate rămân blocaj de producție în P-046.
- Sursele Worker/plugin excluse accidental de regula build/ sunt incluse în repository; outputul generat și secretele rămân ignorate.

## 0.9.3 — 2026-10-05 — pilot local

- Delogare în bara laterală și în pagina contului; ștergere confirmată, cu identitate verificată și autentificare recentă.
- Eliminare date proprii D1/R2/OpenAI/Supabase; acces blocat pe durata unei ștergeri incomplete și reluare după eșecul unui furnizor.
- Profil minim învățător/profesor, disciplină și cicluri 0–4, 5–8, 9–12; preselecție manuale potrivite deja indexate și filtre schimbabile.
- Revocarea autorizării Apple este explicată separat și nu blochează ștergerea datelor ProfPlus; automatizarea rămâne condiție pentru iOS.
- Verificări automate cu conturi fictive, D1/R2 locale și furnizori simulați; interfață desktop/mobil. Fără ștergerea contului titularului sau publicare online.

- P-037: metodele sociale asociate contului sunt afișate explicit; butonul redundant de conectare este ascuns pentru utilizatorul autentificat.

- Configurare externă P-033: Google activ în Supabase, callback Google corectat, Email dezactivat; Apple App ID/Services ID active și cheie dedicată creată. Apple activat cu cheia nouă salvată de titular; aplicația locală configurată și redirecturi oficiale verificate. Loginurile complete și sesiunile rămân în curs.

## 0.9.2 — 2026-10-04

- Rebranding ProfPlus în chat, cont/setări, bibliotecă, titlul paginii, etichete accesibile, asistent AI, indexuri noi și documentație.
- Repository privat redenumit ProfPlus; nume afișat organizație și titlu Sites actualizate. Supabase recunoaște repository-ul redenumit.
- Compatibilitate păstrată pentru sesiunile, preferințele, datele și adresele existente.
- Verificare dashboard Supabase și Apple Developer; pașii nefinalizați și limitele documentate. Google/Apple nu sunt încă activate/testate live.

## 0.9.1 — 2026-10-04

- Prima etapă cu Google/Apple; formularele de e-mail și parolă ascunse și operațiile aferente blocate implicit pe server.
- Ghid Supabase/Google/Apple, callbackuri distincte și configurarea viitoare Resend. Providerii externi așteaptă configurare.
- VERSION sincronizat cu versiunea aplicației.

## 0.9.0 — 2026-10-04

- Cerință GDPR/DPIA permanentă, inventar de date, evaluare preliminară și condiții explicite înainte de lansarea generală.

- Secțiune Cont și setări: profil, securitate, aspect și confidențialitate, accesibilă din bara laterală.
- Preferință temă luminos/întunecat/sistem, memorare opțională și resetare locală.
- Integrare opțională Supabase pentru e-mail verificat/parolă, înregistrare, recuperare, Google/Apple, editare profil/e-mail și deconectare. Metodele neconfigurate sunt dezactivate explicit; Sites păstrează autentificarea ChatGPT.
- Ghid complet de configurare Supabase + Resend și teste locale cu furnizor simulat. Serviciile externe nu sunt încă activate.

## 0.8.3 — 2026-10-04

- Mod întunecat/luminos cu buton accesibil în antet, pe desktop și mobil.
- Preferință păstrată local; la prima utilizare respectă tema sistemului, fără transmiterea preferinței unui serviciu extern.
- Culori adaptate pentru chat, navigare, bibliotecă, dialoguri și editor; exporturile păstrează culorile pentru tipărire.

- Cerințe permanente pentru website, Android și iOS: politici, consimțăminte, date minime, audit terți, transparență, accesibilitate, licențe și solicitări de ștergere. Înregistrate în instrucțiuni și backlog; implementarea rămâne separată.

## 0.8.2 — 2026-10-04

- Paletă globală: albastru #2563EB, emerald #10B981, fundal #F8FAFC, text #0F172A.
- Acțiuni și selecții albastre; progres și salvare emerald; suprafețe, contururi și text secundar în nuanțe slate.
- Aplicată în navigare, chat, documente, bibliotecă, dialoguri, editor și favicon; focus vizibil și culori semantice pentru erori.

## 0.8.1 — 2026-10-04

- Dialogul documentului centrat explicit orizontal și vertical, lățime mai echilibrată și spațiu egal față de marginile ecranului.
- Documentul păstrează centrarea în interior; spațiere adaptivă și editor pe tot ecranul pe mobil.

## 0.8.0 — 2026-10-04

- AI identifică documentele create și deschide automat editorul; card pentru redeschidere din conversație.
- Editare directă a titlului/conținutului, formatare de bază, previzualizare și salvare persistentă în istoric.
- Export PDF A4 cu paginare și diacritice, Word editabil cu tabele; sursele consultate incluse.
- Protecție pentru modificările nesalvate și validarea documentelor pe server.

## 0.7.0 — 2026-10-03

- Meniuri „···” pentru fiecare conversație și proiect; mutare prin listă de proiecte în dialog separat, fără înghesuirea titlului.
- Ștergere conversație cu confirmare: mesaje/citări eliminate, documentele păstrate în bibliotecă.
- Ștergere proiect cu confirmare: conversațiile rămân în istoric, fără proiect.
- Protecție împotriva accesului altor conturi, reapariției chatului din documentele vechi și salvărilor concurente după ștergere.

- Repository privat transferat în organizația GitHub ProfOS-Edu; conexiunea locală actualizată.

## 0.6.1 — 2026-10-03

- Proiecte și istoric direct în bara laterală, cu căutare, grupuri expandabile și creare proiect inline.
- Mutarea conversației în meniul „···”; eliminate istoricul din antet și selectorul de proiect din composer.
- Meniu lateral pe mobil, fundal de închidere și suport Escape.
- Simplificate antetul, ecranul de pornire și caseta de mesaj.

## 0.6.0 — 2026-10-03

- Proiecte și istoric persistent în contul Sites.
- Conversații noi distincte, căutare după titlu, filtrare după proiect și redeschidere cu mesaje, citări și documente.
- Mutarea conversațiilor între proiecte; selecția surselor se salvează pe server.
- Salvare înainte de apelul AI și salvarea răspunsului pe server înainte de trimitere; protecție la suprascriere între ferestre.
- Recuperarea grupurilor de documente anterioare; mesajele vechi nesalvate nu pot fi reconstruite.

## 0.5.0 — 2026-10-03

- Bibliotecă de surse: catalogul comun, materialele indexate, documentele profesorului din toate conversațiile și sursele web citate.
- Căutare după metadate, filtre, selecție/golire și linkuri la originale.
- Căutarea RAG aplică selecția verificată pe server; materialele neindexate și documentele altor utilizatori sunt respinse.
- Vizualizare PDF pentru documentele profesorului; revizuire a răspunsurilor documentare care omit citarea.
- Verificări documentate în docs/LIBRARY.md.

## 0.4.0 — 2026-10-03

- Documentele profesorului și manualele au prioritate; căutarea web completează informațiile lipsă.
- Încărcare documente în chat, stări de procesare, păstrare pe server și ștergere completă.
- Originale R2, metadate D1, indexuri OpenAI separate și acces verificat pe utilizator/conversație.
- Citări accesibile și surse distincte pentru documente, manuale și internet.
- Fluxuri reale verificate pentru TXT/PDF/DOCX, răspunsuri document/web/mixt, validări, izolare și ștergere. Limitele sunt în docs/HYBRID_EVALUATION.md.

## 0.3.0 — 2026-10-03

- Catalog general manuale.edu.ro și colecție activă de matematică pentru clasa a V-a: 9/9 volume indexate.
- Import reluabil cu stări SQLite, extracție pe pagini, OCR, metadate și reîncercări.
- Chat RAG cu căutare filtrată, citări și linkuri la paginile PDF; numărul manualelor afișat în interfață.
- Pilot privat publicat; 9/10 verificări ale fluxului au trecut. Recuperarea pentru triunghiuri și verificarea formulelor rămân deschise.

## 0.2.0 — 2026-10-01

### Adăugat

- Site de chat AI adaptat pentru telefon și desktop, cu interfață în română.
- Casetă de mesaj, conversație nouă, stare de așteptare, oprire și reîncercare.
- API server-side cu context conversațional și cheia păstrată ca secret.
- Validări, limitarea contextului și timeout; contract JSON documentat pentru viitoarele aplicații mobile.
- RAG-ul și aplicațiile mobile sunt planificate separat.

- Configurare locală a cheii OpenAI prin introducere ascunsă și test API cu timeout, erori și afișarea consumului. Apelul real a fost verificat cu succes.
- Folosirea certificatelor de sistem macOS când instalarea Python nu are un bundle disponibil, cu verificarea TLS activă.

## 0.1.0 — 2026-10-01

### Adăugat

- Documentație pentru scop, stare, MVP și arhitectură conceptuală.
- Backlog, roadmap, jurnal de lucru și registru de decizii.
- Reguli pentru actualizarea progresului și șabloane GitHub.
- Repository privat GitHub pentru versionarea proiectului.

Această versiune conține doar documentație.

P-033, verificare 2026-10-04: loginurile reale Google/Apple efectuate de titular confirmate pe același cont Supabase; profil autentificat și sesiune persistentă după reload. Logout/refresh la expirare/izolare cu două conturi rămân deschise.


### Actualizare coadă import — nelansat

OCR cunoscut înainte de continuarea importului text; apoi text/OCR pentru fiecare grupă. Fără publicare online.


### Nelansat — P-050

Trimitere mesaje fără cont, context public pilot și buget comun server-side; păstrate protecțiile pentru date private.


### Nelansat — P-051

Bibliotecă înainte de conversație nouă; catalog și selecție accesibile tuturor. Atașamente temporare fără cont, inline către model.


Actualizare P-048 — 2026-10-05: la ultima cerere a utilizatorului, importul text pentru toate materiile precede OCR-ul. Coada reluată din checkpoint; confirmată activă în text_alte_materii, 243 indexate la verificare. Extracția OCR întreruptă este marcată needs_ocr, fără a declara succes. Șapte teste offline trecute; fără publicare online.


P-048 — 2026-10-05, ultima instrucțiune: import normal fără programare recurentă, apoi oprire înainte de OCR (awaiting_ocr). Controller înlocuit fără oprirea importului copil; progres păstrat. Șapte teste offline trecute. Automatizarea confirmată absentă; fără notificare proactivă garantată după închiderea turei. OCR necesită etapă ulterioară.


P-048 — ultima cerere 2026-10-05: import integral și OCR automat la final, fără scheduled task; înlocuiește oprirea înainte de OCR. Controller actualizat păstrând importul copil activ. Erori curente agregate: ConnectionError/API_NETWORK_ERROR/JSONDecodeError; reluările text limitate existente le vor reîncerca. Nu sunt volume finalizate și nu este promis succes pentru linkuri sau OCR indisponibile. Șapte teste offline trecute.


## Publicare privată — 2026-10-08

Proveniență per exercițiu, referințe în document și export PDF/Word simplificat, confirmate pe site. Repository: P-055 prin PR, review independent necesar.

## Nelansat — P-057

Stocare privată Supabase, transfer verificat înainte de ștergerea copiei locale, restaurare după hash și adaptoare pentru documente/istoric. Schema PostgreSQL și cutoverul sunt pregătite, fără activare înainte de migrare și probe reale.

## 2026-10-09 — Curățarea locală P-058

- Un singur checkout operațional pentru aplicație/import, fără pierderea modificărilor locale. Copiile publicate și dependențele temporare eliminate după verificare; logo-uri în cloud, configurație necesară păstrată protejat.

## 2026-10-09 — P-059

- Verificarea bibliotecii mari are deadline 120 secunde și cache server 5 minute. Erorile nu mai afișează materialele ca neindexate; stare neverificată distinctă.

### P-060 — 2026-10-09

Recuperare reluabilă a originalelor manualelor în Storage privat, plafon pe fișier și prag de capacitate; listă a originalelor rămase separată de starea indexului. Retry pentru răspunsuri temporare Storage 5xx și limită PDF explicită în importer. Potrivire disciplină/clasă pentru selecția tuturor categoriilor comune și private. Protecțiile Pro și SSL/restricții/jurnalizare verificate live; branding Google rămâne condiționat de domeniu. Publicare privată Sites versiunea 19 confirmată.

P-060: recuperarea originalelor poate relua până la șase transferuri simultane, cu plafon verificat și pentru PDF local, fără reîncărcarea surselor deja identificate ca prea mari.


## Istoric P-056 integrat — fotografii datate, înlocuite de notele ulterioare


## Nelansat — P-056

Import reluabil al arhivelor de olimpiade/concursuri, categorii și metadate publice dinamice în bibliotecă/RAG; importul este în curs, fără declarație de catalog complet.

P-056: păstrarea paginii sursei în fragmentele indexate ale arhivelor, cu migrare reluabilă și eliminarea copiilor precedente doar după confirmarea înlocuirii.

## Note operaționale locale păstrate la consolidarea P-061

## 2026-10-09 — Verificare inventar cloud și izolarea testelor

Verificare live: originalele nu sunt încă complete; 7 originale manuale și 828 originale concursuri/olimpiade, texte pentru 1.303 manuale indexate și 1.391 documente de concurs indexate. Un artifact sintetic de 7 bytes a fost identificat prin archiveId=test, example.org și SHA-256 exact al fixture-ului, apoi eliminat din Storage și catalog. Testele de concurs dezactivează explicit cloud_active, la fel ca testele de manuale, fără a depinde de configurația checkout-ului. Niciun material real eliminat. Importul concursurilor s-a oprit la un PDF de 57.946.349 bytes, SUPABASE_RESUMABLE_CREATE_413; originalul este păstrat local. Nu se declară transferul complet sau import activ după acest blocaj.

## P-061 — 2026-10-09

Consolidarea codului pentru main și colaborare: aplicație, cloud/importere, scheme, teste, catalog și documentație; ghid de instalare și configurații exemplu fără secrete.

## Publicare P-062 confirmată

PR #10 integrat în main la 14:36 UTC: merge `869a20747e721d776b692db1081971b056d282b3`, cod `980b88a0d7113b8585aa60583a0180acd52019b3`. Site-ul privat este publicat cu succes (dovezi în IMPORT_CONTINUATION.md). CI verifică acum și companionul de referințe și recuperarea originalelor concursurilor; toate cele 49 teste au fost executate local. Livrarea codului este **DONE**; importul datelor rămâne **IN PROGRESS**. Instrucțiunea explicită a titularului autorizează integrarea curentă în main; nu se dezactivează controalele și nu se schimbă regulile normale de review pentru sarcini viitoare.

## Publicare și verificare P-063

PR #11 integrat în main: `46597b7aacf115e1433536a5e919b8abbf07369c`. 448 de referințe pentru materialele/URL-urile cu erori au fost salvate și jurnalizate; 10 PDF-uri eliminate, 394.205.365 bytes. Companionul rămâne activ numai cât rulează importul valid al concursurilor, pentru noile erori. Codul web are același tree Git `fb00b41548a85410be842dac8c1fa02a4c14e503` ca aplicația publicată; schimbarea datelor este în Supabase folosit de site, fără schimbare de audiență. Build, 58 teste offline și scanner Git/client fără detecții; auditul npm are 8 high existente.


P-065, revenire 2026-10-11: corectată blocarea după expirarea cache-ului. Lista comună recentă rămâne vizibilă în timpul actualizării; refresh în fundal, termen de 8 s pentru catalog și paginare paralelă limitată. Datele personale nu intră în cache/preview. [Dovezi și limite](docs/LIBRARY_LOADING.md).
