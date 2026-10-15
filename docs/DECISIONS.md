# Registrul deciziilor

## DEC-001 — Începem cu un flux RAG restrâns

Data: 2026-10-01
Stare: propusă

Propunere: primul MVP răspunde la întrebări din documente și afișează surse. Motiv: permite verificarea utilității și corectitudinii înainte de extindere.

De confirmat: utilizatorul țintă, corpusul și bugetul. Nicio tehnologie nu este aprobată prin această propunere.

## DEC-002 — Test local OpenAI API

Data: 2026-10-01. Stare: acceptată pentru testul de conexiune.

Utilizatorul a creat o cheie OpenAI. Pregătim un test Python fără dependențe externe, cu Responses API și modelul configurabil gpt-4.1-mini. Această alegere nu stabilește tehnologiile aplicației finale. Cheia este păstrată local și exclusă din GitHub.

## Șablon pentru decizii viitoare

## DEC-003 — Site-ul de chat înaintea RAG-ului

Data: 2026-10-01. Stare: acceptată.

Utilizatorul a cerut amânarea documentelor și începerea site-ului, cu o casetă de conversație AI. Implementăm React/TypeScript cu Vinext și un API JSON server-side, compatibil cu găzduirea Sites. Prima versiune este privată și folosește gpt-4.1-mini. Nu persistăm conversațiile și nu introducem încă documente sau RAG. Viitoarele aplicații mobile vor avea nevoie de autentificare proprie peste contractul API.

## Format pentru decizii noi

- ID și titlu:
- Data:
- Stare: propusă / acceptată / înlocuită
- Context:
- Opțiuni analizate:
- Decizie și motiv:
- Consecințe și compromisuri:
- Înlocuiește / este înlocuită de:

## DEC-004 — Pilot RAG: toate manualele de matematică, clasa a V-a

Data: 2026-10-03. Stare: acceptată.

Utilizatorul a ales toate manualele de matematică pentru clasa a V-a. Păstrăm catalogul general, oprim importul general și selectăm cele 9 volume corespunzătoare, inclusiv traducerile. Folosim temporar OpenAI Vector Stores pentru index și SQLite local pentru import reluabil. Căutarea serverului este filtrată explicit după ID-urile colecției. Acest flux nu antrenează modelul. Păstrăm paginile PDF ca metadate repetate în text; formulele și figurile rămân o limită a extracției.

Referință API pentru filtrare: https://developers.openai.com/api/reference/python/resources/vector_stores/methods/search.

## DEC-005 — Documente prioritare, completare web și documente proprii

Data: 2026-10-03. Stare: acceptată, înlocuiește restricția exclusivă a DEC-004.

Utilizatorul a cerut folosirea preponderentă a documentelor și căutare internet când informația lipsește, plus încărcări proprii ale profesorului în chat. Păstrăm căutarea prioritară în documente, evaluăm suficiența pasajelor, apoi căutăm web separat prin Responses. Generarea finală are surse distincte. D1 păstrează metadate cu identitatea Sites și conversația, R2 păstrează originale, fiecare document are index OpenAI propriu. Documentele rămân până la ștergere și sunt disponibile în conversația curentă după reîncărcare.

Interogarea web este generată separat și nu primește direct documentele ori istoricul; anonimizarea este cerută prin prompt și necesită evaluare suplimentară. Preferăm surse primare, fără listă exclusivă. Nu pretindem pagini pentru documentele indexate nativ.

Referințe: https://developers.openai.com/api/docs/guides/tools-web-search și https://developers.openai.com/api/docs/guides/tools-file-search.

## DEC-006 — Biblioteca include sursele comune și selecția reală

Data: 2026-10-03. Stare: acceptată.

Utilizatorul cere navigarea surselor încărcate și posibile, nu doar a documentelor proprii sau a unui contor. Afișăm catalogul comun și starea reală a indexării, documentele profesorului și sursele citate. Numai sursele indexate pot fi selectate pentru căutare; cele inventariate au linkuri la originale. Selecția este aplicată server-side după verificarea stării și accesului. Documentele private ale altor profesori nu devin comune automat. Sursele web citate se deschid și pot fi discutate fără a pretinde indexarea lor permanentă.

## DEC-007 — Istoricul se păstrează în cont

2026-10-03. Acceptată. D1 stochează proiecte și transcripturi pe identitatea Sites; browserul reține doar chatul curent. Reviziile împiedică suprascrierile concurente. Proiectele organizează conversații și documentele acestora; nu copiază indexurile. Documentele vechi sunt adoptate fără inventarea mesajelor lipsă.

## DEC-008 — Navigarea se concentrează în stânga

2026-10-03. Acceptată. Conform cererii utilizatorului, proiectele și istoricul devin liste direct în bara laterală. Eliminăm dialogul de istoric și accesările duplicate. Pe mobil aceeași navigare apare într-un panou lateral; mesajele și sursele păstrează comportamentul existent.

## DEC-009 — Repository într-o organizație

2026-10-03. Acceptată. Transferăm repository-ul privat în organizația gratuită ProfOS-Edu pentru colaborare. Numele ProfPlus era ocupat; utilizatorul a aprobat ProfOS-Edu și termenii. Nu schimbăm vizibilitatea. Invitațiile se trimit după identificarea colegilor.

## DEC-010 — Ștergere cu limite explicite

2026-10-03. Acceptată. Dialog separat pentru mutare și confirmare înainte de ștergere. Ștergerea proiectului păstrează conversațiile; ștergerea chatului elimină transcriptul, dar păstrează documentele disponibile în bibliotecă. Un marcaj minim împiedică reapariția chatului din documentele vechi; reviziile și verificarea deleted împiedică salvările concurente.

## 2026-10-04 — Documente în transcript și export în browser

Indicatorul documentului este inclus în evaluarea structurată AI existentă. Conținutul rămâne Markdown în transcript, pentru portabilitate și redeschidere fără stocare duplicată. Dialogul oferă editare vizuală simplă; DOCX/PDF se generează local în browser. Evităm transmiterea documentelor unui serviciu suplimentar de conversie. Extensii viitoare: formule, imagini, versiuni și editor mai avansat.

## 2026-10-04 — Centrare explicită dialog

Dialogul nativ are inset 0 și margin auto pentru a păstra centrarea chiar când resetul CSS elimină marginile implicite. Desktop cu margini egale; mobil pe tot ecranul pentru spațiu de editare.

## 2026-10-04 — Paleta ProfPlus

#2563EB pentru acțiuni, #10B981 pentru progres, #F8FAFC fundal și #0F172A text. Suprafețele documentelor rămân albe; borduri și text secundar slate. Emerald pe fundal folosește text închis pentru lizibilitate; textul de succes folosește o nuanță emerald mai închisă. Erorile și ștergerea rămân roșii pentru sensul acțiunii.

## 2026-10-04 — Cerințe permanente multiplatformă

Cerințele utilizatorului devin instrucțiuni de proiect pentru web, Android și iOS. Înregistrarea și implementarea sunt urmărite separat. Politicile viitoare se bazează pe date reale despre operator, destinatari și condiții comerciale; nu inventăm detalii sau declarații de conformitate.

## 2026-10-04 — Preferință locală de temă

Tema respectă sistemul până când utilizatorul alege explicit luminos/întunecat. Preferința rămâne în browser, fără date noi pe server. Aceeași separare între culorile de suprafață, text, acțiuni și progres va fi folosită pentru aplicațiile mobile. Linkuri albastre mai deschise în dark mode, butoane albastre cu text alb și salvare emerald cu text închis.

## 2026-10-04 — Identitate independentă pregătită separat de pilot

Supabase Auth pentru identitate și Resend SMTP/API pentru e-mailuri. E-mail verificat obligatoriu; telefonul nu este cerut acum. Utilizatorul a ales pregătirea integrării, neavând conturi externe sau domeniu. Pilotul Sites păstrează accesul ChatGPT și audiența privată. Integrarea viitoare folosește ID-uri `supabase:<uuid>` și cookie-uri HttpOnly; profilul este verificat pe server cu getUser. Migrarea necesită dovada deținerii identităților, nu potrivirea adresei de e-mail. Înregistrarea și fiecare provider sunt activate separat după configurare/verificare.

## 2026-10-04 — Login social înainte de e-mail

La cererea utilizatorului, Google și Apple sunt primele metode independente. E-mail/parolă/verificare Resend se activează după domeniu. Flag separat AUTH_EMAIL_ENABLED implicit fals și dezactivarea providerului Email în Supabase; înregistrarea OAuth rămâne distinctă de formularul e-mail. Găzduirea Sites își păstrează autentificarea, migrarea spre găzduire proprie și datele fiind separate.

## 2026-10-04 — ProfPlus și identificatori stabili

Produsul folosește ProfPlus pe toate platformele. Repository-ul devine ProfOS-Edu/ProfPlus, numele afișat al organizației ProfPlus. URL-ul Sites, identificatorul organizației, cookie-urile și cheile locale existente se păstrează pentru compatibilitate; nu se rescriu datele utilizatorilor. Rebrandingul nu activează automat autentificarea externă. Inspecția Supabase/Apple se documentează separat de testele reale OAuth și de aprobarea GDPR/DPIA.

## 2026-10-04 — OAuth fără domeniu propriu

Folosim callbackul HTTPS Supabase pentru Google și Apple, separat de callbackul aplicației locale. Refolosim clientul și secretul Google existente; cheia Apple este dedicată ProfPlus. Providerul Email și Resend rămân dezactivate/amânate. Nu schimbăm filtrul de acces Sites și nu migrăm automat identități pe baza adresei de e-mail. Activarea aplicației așteaptă ținta și probele reale.

## 2026-10-05 — Profil minim și ștergere a datelor active

Rolul, disciplina și ciclurile personalizează sursele, fără date suplimentare despre școală/elevi. Învățătorul acoperă toate materiile 0–4; profesorul poate alege mai multe cicluri. Selecția manualelor rămâne schimbabilă și nu inventează indexuri pentru discipline încă neimportate. La ștergere, identitatea este verificată de server; datele/documentele personale sunt eliminate înainte de identitatea Supabase, cu referințe și blocare pentru retry. Cheia administrativă existentă a fost aprobată numai pentru serverul local și rămâne exclusă din Git. Nu condiționăm ștergerea ProfPlus de revocarea manuală Apple; automatizarea Apple și monitorizarea operațională sunt urmărite separat. Nu asociem sau ștergem implicit vechile date Sites pe baza e-mailului.

## 2026-10-05 — Surse automate dinamice, etichete private și securitate permanentă

Modul automat se rezolvă pe server la fiecare mesaj din profilul verificat și sursele accesibile/indexate; nu persistă un instantaneu care exclude importurile viitoare. Categoriile educaționale sunt separate de tipul tehnic comun/privat. Profesorul poate corecta etichetele proprii; documentele vechi neclasificate nu sunt etichetate retrospectiv prin presupuneri. Selecția explicită îngheață opțiunile profesorului până la reactivarea modului automat.

Datele aplicației rămân D1/R2 și indexuri private OpenAI, identitatea Supabase. RLS va fi obligatoriu pentru tabele Postgres expuse, fără a pretinde existența sa în D1. Rolul didactic din profil nu este autorizare. Reguli complete în SECURITY_REQUIREMENTS.md, dovezi și lipsuri în SECURITY_REVIEW.md. CI raportează alertele high rămase prin eșec, fără mascarea lor. CSP inițială păstrează inline necesar RSC, nonce/hash strict urmărit separat; HTTPS se aplică înainte de handler în afara loopback. Testele folosesc exclusiv date fictive pentru ștergere și clasificare.

## 2026-10-05 — Profil unificat

Numele și activitatea didactică sunt salvate împreună printr-o singură actualizare metadata, după validarea tuturor câmpurilor pe server. Linkul vechi view=teaching este alias către Profil; onboardingul nu introduce o pagină nouă sau date suplimentare. Profilul nu acordă roluri administrative.

## 2026-10-05 — importul general reluat

Reutilizăm indexul comun și UID-urile existente; verificăm starea remote înainte de reluare. Prioritate matematică, fizică, informatică/TIC, apoi rest; text mai întâi pentru disponibilitate rapidă, OCR separat. PDF-urile sunt procesate în subprocess deoarece un volum complex a blocat extracția într-un fir; timeoutul nu oprește restul. Prag 90% pagini text pentru volume noi, fără promisiuni privind formulele. Coada locală și urmărirea în chat păstrează publicarea online separată.

P-057, 2026-10-09: Supabase Storage devine destinația materialelor disponibile; PostgreSQL va păstra datele aplicației și bibliotecii după verificarea migrării. Mac-ul păstrează doar date temporare necesare proceselor. OpenAI rămâne indexul AI existent, iar schimbarea stocării nu implică reindexare în pgvector. Copiile locale se elimină doar după upload, verificare integrală și evidență. Identitățile Sites/Supabase nu sunt reunite automat. Adaptorul server folosește o listă închisă de operații, nu un endpoint SQL generic; nu există fallback de scriere în vechiul backend când noul backend este selectat.

### 2026-10-09 — P-058: un checkout operațional

Se păstrează local numai codul/runtime/configurația și starea necesară importului activ. Copiile de lucru publicate se recreează din GitHub/Sites, materialele se restaurează verificat din Supabase. Nu se elimină modificări unice ori configurații necesare; sources/ sincronizat este read-only.

## P-060 — 2026-10-09: limită 50 MB și separarea originalelor/indexului

Titularul păstrează plafonul de cheltuieli Pro și cere toate originalele care încap în 50 MB, apoi evaluarea celor rămase. Recuperarea originalelor nu reîncarcă inutil textele deja indexate; se ordonează circular pe disciplină/clasă, păstrează proveniența și verifică bytes/metadata înaintea eliminării locale. Prag bibliotecă 75 GB pentru spațiu destinat documentelor private; nu este cotă garantată de furnizor. Backupurile DB nu acoperă Storage. OAuth branding se finalizează după domeniu și verificare reală; numele dintr-un câmp de configurare nu dovedește ce afișează Google.


## Istoric P-056 integrat — fotografii datate, înlocuite de notele ulterioare


### P-056 — Metadate comune dinamice, 2026-10-08

Materialele de olimpiade/concursuri sunt importate în indexul comun existent, cu UID competition-<SHA256>, category, title, subject, source_url, publisher, stages, class și page_locator. DTO explicit, fără ID intern de fișier/index; bibliotecă/RAG consumă aceste câmpuri, păstrând starea reală a indexării. Se evită publicarea unui manifest nou pentru fiecare document. Doar câmpurile educaționale publice ajung în client; ownership-ul documentelor profesorului rămâne separat. Snapshotul raportului este datat, nu dovada că toate arhivele sunt finalizate.

## P-061 — Bază comună pentru echipă, 2026-10-09

Integrare explicit cerută în main, fără rescrierea istoricului sau resetarea checkout-ului operațional activ. Cheile și datele private nu sunt cod distribuibil și rămân în canalele protejate; accesul la indexul comun se acordă separat. Regula PR/review pentru lucrări noi rămâne.

## P-062 — 2026-10-09

Omiterea originalelor peste 50 MB este autorizată explicit de titular; referința este păstrată privat în Supabase și catalogul manualelor păstrează URL-ul oficial. Indexul existent, furnizorii, conturile, RLS și audiența pilotului nu se schimbă. Fișierele Word de blocare nu sunt materiale educaționale. Datele Storage nu sunt incluse în backupul DB. Transferul bibliotecii continuă, fără declarație de audit complet sau finalizare a tuturor importurilor. [Dovezi, teste și limite](IMPORT_CONTINUATION.md).

## P-063 — renunțare la materialele cu erori, 2026-10-10

Titularul a autorizat omiterea materialelor cu erori: referință verificată în Supabase înainte de eliminarea cache-ului local, fără redescărcare automată. Cele 10 PDF-uri rămase după erori (394.205.365 bytes) au fost eliminate. Importul valid al concursurilor continuă; companionul păstrează și linkurile pentru erorile lui. [Flux, dovezi și limite](FAILED_MATERIALS.md).


## P-065 — 2026-10-11: disponibilitate din confirmările importului

Pentru backendul Supabase, biblioteca citește proiecția minimă a checkpointului cloud: indexed + file_id + attached=1. Nu listează toate fișierele OpenAI la fiecare deschidere. Snapshot comun 60 s, paginare ordonată și încărcare paralelă; fără cache de date personale. Reconcilierea indexului aparține importului. [Dovezi și limită de actualizare](LIBRARY_LOADING.md).


## P-067 — 2026-10-11

Priorități în selecția deja autorizată, fără acces nou; toate documentele proprii se verifică pe cont. Copia fără proveniență este reversibilă, originalul și dovezile rămân salvate. KaTeX/MathJax/fonturi locale, fără date trimise altui furnizor și fără relaxarea CSP. Word are formule ca imagini; validarea AI și importul complet rămân separate. Teste noi, verificare browser și descărcări reale executate. Audit: 8 high anterioare în toolchain, zero în producție. [Dovezi și limite](TEACHER_TEST_CONTROLS.md).

## 2026-10-11 — P-068: referințe de stil și integrare directă

Modelele personale se etichetează în JSON-ul existent, separat de sursele factuale selectate automat; sunt consultate pe proprietar în toate conversațiile. Prevalența se calculează per tip, materie și ciclu. Modelele comune sunt exclusiv exemplele aprobate și anonimizate ale titularului, adăugate versionat după ce acesta le furnizează; niciun model personal nu devine comun prin upload ori user_metadata. Exemplele ghidează structura textuală, fără fine-tuning sau promisiunea reproducerii exacte a fonturilor/paginării. Titularul a înlocuit explicit fluxul PR/reviewer: verificare și integrare direct pe main până când anunță reluarea colaborării. P-065 și P-067 integrate prin fast-forward, fără forțare sau atingerea checkout-ului operațional.

## P-069 — LaTeX portabil, 2026-10-11

Editor de sursă și proiecție educațională locală, fără motor TeX server sau serviciu terț de compilare. Sursa completă are prioritate și se păstrează exact în JSON-ul documentului. Conversia vizuală este explicită; .tex rămâne calea pentru compilare fidelă în Overleaf. Păstrăm controlul provenienței prin delimitatori proprii, fără rescrierea arbitrară a codului profesorului. Livrare direct pe main, conform instrucțiunii titularului.

## P-070 — structuri comune anonimizate, 2026-10-11

Cererea explicită a titularului autorizează folosirea celor zece exemple ca modele implicite. Se distribuie numai structuri anonimizate, fără originale, identități sau enunțuri integrale. Noul tip unit rămâne metadata JSON validată în tabelul existent; fără migrare/RLS/permisiuni noi. Prioritate personală per tip și filtrare materie/ciclu/clasă; nicio promovare automată a unui model privat. Referințele ghidează stilul, nu fine-tuning sau adevăr matematic. Regula 2+2 este instrucțiune de organizare a titularului, în contextul aplicației, nu afirmație legală. Furnizorul AI și store=false rămân aceleași; probe live numai cu referințe anonimizate și cereri fictive. Verificările finale și limitele sunt în [REFERENCE_MODELS.md](REFERENCE_MODELS.md). Nu se declară audit complet, conformitate juridică sau drept de distribuire a originalelor. Alertele toolchain existente rămân urmărite separat.


## 2026-10-11 — P-071: utilitate pedagogică mai largă decât subiectele

Titularul clarifică păstrarea programelor, calendarelor școlare, reperelor și modelelor necesare planificărilor/proiectelor de lecție. Eliminăm numai materiale administrative clare și navigare duplicată; nu folosim cuvintele calendar/regulament/metodologie drept criteriu de ștergere. Cazurile ambigue deja descoperite se păstrează. Numărul linkurilor nu este numărul documentelor rămase. Importul continuă cu aceeași cheie și ștergerea locală verificată; livrare directă pe main, fără PR, conform instrucțiunii titularului.


## 2026-10-12 — P-072

Manualele sunt baza factuală pentru teste și planificări, iar modelele personale/comune aprobate sunt șablonul structural. Scorurile vectoriale se completează cu locuri rezervate manualelor; prioritățile explicite ale profesorului prevalează. Planificarea nu schimbă coloanele pe baza manualului. După proba AI cu erori se introduce o revizie a testului; aceasta completează controlul profesorului. Antetul/tabelele comune se verifică înaintea salvării, cu o singură corectare și eșec vizibil dacă modelul nu este respectat. Formatul Markdown nu este un motor de reproducere exactă DOCX.


## P-073 — 2026-10-12

Responsabil Marcos Soames, issue #18. Inventar opt worktree-uri și sursele Sites; toate implementările existente sunt în main. Merge-uri istorice pentru 8977bda și 2fdfbc2, conflicte revizuite păstrând P-054/P-065/P-067/P-069/P-072 și guard-ul fixture-urilor. Runtime/teste/scheme identice cu 1c50602, fără migrare, furnizor, cheie, permisiune sau audiență nouă. Rezumatul importului include numai numărări, fără URL-uri/titluri/private content; jurnalul brut și checkpointurile rămân excluse. 61 teste Python și suitele web focalizate trecute; scanner Git/istoric/client fără detecții, audit 8 high toolchain existente și zero producție. Site-ul P-072 deja publicat rămâne curent, fără deploy redundant; import paused și checkout operațional păstrat. Nu se declară CI complet verde, audit complet sau conformitate GDPR. [Dovezi](MAIN_CONSOLIDATION.md).


## P-080 — 2026-10-15 — Biblioteca personală fără migrare

Biblioteca personală reutilizează tabelul și operațiile aprobate `documents`, grupate sub un UUID determinist derivat pe server din identitatea verificată, în locul unei coloane/tabele noi (care ar cere migrare de producție și modificarea RPC-ului cu operații fixe). Grupul este ascuns din istoric și refuzat ca conversație. Consecință acceptată: limita existentă de 10 documente pe grup. Documentele personale gata sunt surse automate în toate conversațiile (cererea titularului: chatul ține cont de ele); profesorul le poate exclude manual. Întrebarea de la prima deschidere se reține doar în browser, pentru a nu colecta date noi.


## P-081 — 2026-10-15 — Clase fără migrare și fără date despre elevi

O clasă este un proiect al contului cu nume standard; documentele pe secțiuni și jurnalul (observații, personalizări) folosesc grupuri interne derivate pe server, ca biblioteca P-080, pentru a evita o migrare de producție. Observațiile sunt generale despre clasă; catalogul, notele și observațiile per elev rămân excluse până la P-043 (roluri/izolare) și o evaluare DPIA dedicată. Documentele clasei sunt surse automate numai în conversațiile clasei. Modul întunecat folosește aceeași identitate verde ca modul luminos.


## P-082 — 2026-10-15 — Știri automate din RSS

Se folosesc fluxurile RSS publice ale surselor, nu scraping de pagini, și se păstrează doar titlul, un extras scurt și linkul, cu atribuire. Publicarea în listă este automată; Acasă rămâne principal + trei secundare, cu fixările recente ale editorului prioritare și restul completat după importanță și profilul didactic. Clasificarea este deterministă (cuvinte-cheie), fără AI, ca să fie verificabilă și fără costuri sau transfer de date.
