# ProfPlus — evaluare preliminară DPIA și registru de riscuri

Data: 2026-10-05 · versiune analizată: 0.9.4 local · **DRAFT — neaprobat pentru lansare generală**.

Document de lucru bazat pe cod și verificările disponibile. Nu este o certificare GDPR, o politică publică sau o evaluare juridică finalizată. Responsabilul operatorului și persoana care aprobă evaluarea nu sunt încă identificați. Cerința utilizatorului: protecția datelor se aplică website-ului, backendului și aplicațiilor Android/iOS.

## 1. Scop, persoane și responsabilități

ProfPlus asistă profesorul la căutarea în manuale/documente, explicații și redactarea de teste, bareme și planificări. Profesorul verifică documentele generate. Aplicația actuală nu implementează admitere, sancționare sau decizii automate de notare a elevilor.

Datele pot privi profesorii și orice persoane menționate în documente/conversații, inclusiv elevi. Faptul că doar profesorul are cont nu exclude prelucrarea datelor copiilor. În pilot se recomandă materiale publice ori anonimizate; nu există un filtru care să garanteze anonimizarea tuturor încărcărilor.

De completat înainte de extindere: denumirea și contactul operatorului, rolurile ProfPlus/școală/profesor pentru fiecare scop, existența unui DPO dacă este necesar, temeiurile aplicabile, publicul și vârsta, volumul prelucrării, țările și responsabilul pentru solicitări/incidente. Nu se presupune că un acord bifat de profesor acoperă orice date ale elevilor.

## 2. Evaluarea necesității DPIA

DPIA se efectuează înaintea prelucrărilor susceptibile de risc ridicat; riscurile ridicate rămase după măsuri pot necesita consultarea autorității înainte de continuare. Vezi [EDPB](https://www.edpb.europa.eu/topics/accountability-and-compliance-tools/data-protection-impact-assessment_en). Pentru România se verifică și [Decizia ANSPDCP 174/2018](https://www.dataprotection.ro/servlet/ViewDocument?id=1556); lista nu înlocuiește analiza contextului concret.

Evaluare preliminară proprie: AI extern, posibile date ale copiilor și documente educaționale confidențiale justifică efectuarea unei DPIA complete înainte de utilizarea extinsă cu astfel de date. Scara, categoriile efective și relația cu școlile sunt necunoscute; concluzia juridică privind obligativitatea nu este încă aprobată. Google/Apple sunt active în pilotul local controlat; accesul Sites publicat este separat; nu se deschide înregistrarea generală înainte de închiderea condițiilor de lansare de mai jos.

## 3. Fluxuri și inventar tehnic verificat

| Flux | Date/scop | Destinație actuală sau planificată | Păstrare și limite cunoscute |
|---|---|---|---|
| Pilot autentificat | ID, e-mail/nume furnizate de platformă; acces la cont | Sites/ChatGPT → server ProfPlus | Sesiunea platformei; duratele și logurile furnizorului trebuie inventariate |
| Conturi independente, local | ID, e-mail verificat, nume opțional și identități Google/Apple | Supabase Auth și providerul OAuth ales | E-mail/parolă inactive; ștergerea identității cere API-ul administrativ. Contractele și retențiile furnizorilor rămân de verificat |
| Profil didactic | Rol, disciplină și cicluri; personalizarea bibliotecii | Supabase user_metadata; verificare în ProfPlus | Modificabil în cont, eliminat cu identitatea. Fără școală, adresă, telefon, elevi sau folosire pentru marketing |
| Ștergere în curs | ID intern proprietar și moment de început; blocare acces/reluare | D1 account_deletions | Eliminat la succes; dacă procesul rămâne întrerupt necesită reluare/monitorizare. Politica și automatizarea de retenție rămân P-039 |
| E-mailuri de cont, inactive | Destinatar și mesaj de confirmare/recuperare | Supabase → Resend SMTP | Retenția evenimentelor/logurilor și contractele de verificat |
| Proiecte/conversații | Titluri, mesaje, citări, selecții, ID proprietar | D1 | Până la ștergere; ștergerea chatului golește transcriptul și păstrează un marcaj tehnic. Nu există încă o perioadă automată de expirare |
| Documente proprii | Originale, nume, fragmente și ID proprietar | R2 + metadate D1 + fișier/index OpenAI | Ștergerea documentului apelează eliminarea din fiecare stocare. Ștergerea contului local apelează aceleași stocări înainte de eliminarea identității; copiile/logurile furnizorilor sunt separate |
| Generare AI/RAG | Întrebare, context selectat și fragmente | OpenAI API | Codul trimite `store:false` pentru Responses; aceasta NU dovedește retenție zero pentru toate serviciile, logurile sau fișierele/indexurile |
| Completare web | Interogare generată pornind de la întrebare | Instrumentul web OpenAI și infrastructura acestuia | Fragmentele nu sunt trimise direct de funcția web; anonimizarea interogării generate nu este demonstrată. P-017 |
| Export PDF/DOCX | Documentul ales de utilizator | Generare în browser, fișier pe dispozitiv | Păstrarea/copierea după descărcare este în afara controlului aplicației |
| Preferințe browser | Temă, ID ultim chat și selecții; flag memorare | localStorage în browser | Resetare locală; tema poate fi temporară. Fără trackere proprii de marketing/analytics introduse |
| Mobil, planificat | Identitate/tokenuri și date pentru funcțiile implementate | Încă neimplementat | Reevaluare înainte de SDK-uri, notificări push, deep links sau permisiuni native |

Temeiurile, scopurile, contractele cu persoanele împuternicite și informarea persoanelor trebuie stabilite pentru fluxurile reale. Privacy by design/default și demonstrarea măsurilor sunt responsabilități continue; alegerea unei regiuni UE sau a unui furnizor nu le rezolvă singură. [Comisia Europeană — obligații](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations_en).

## 4. Necesitate și proporționalitate

Pentru prima versiune, e-mail verificat și ID stabil sunt suficiente pentru cont; telefonul, data nașterii, adresa și datele de plată nu sunt cerute. Numele este opțional. Nu se introduce marketing prin acceptarea înregistrării. Sursele profesorului sunt accesate pe baza proprietarului, separat de manualele comune. Resend pentru alte comunicări este o extensie viitoare, cu analiză separată a scopului și dezabonării.

De justificat: durata păstrării conversațiilor, originalelor, indexurilor, copiilor de siguranță și logurilor; ce context minim este necesar AI-ului; dacă și când este necesară căutarea web; alternativele pentru materiale cu date personale. Ștergerea datelor din browser nu este prezentată ca ștergere a datelor de pe server.

## 5. Riscuri și măsuri

Apreciere preliminară calitativă, fără a inventa probabilități sau aprobări. Riscurile reziduale rămân neacceptate până la probe și validare.

| ID | Risc pentru persoane | Măsuri existente/dovezi | Acțiuni și responsabil propus |
|---|---|---|---|
| R1 | Accesul altui profesor la documente/conversații | Verificare proprietar pe server; probe de izolare; Supabase getUser, e-mail confirmat, cookie HttpOnly/Lax/Secure în producție | Echipa tehnică: test integrare reală, refresh/revocare, acces fișiere și audit înainte de lansare |
| R2 | Date ale elevilor divulgate prin AI sau căutare web | Selecții de surse și separare documente; instrucțiuni pentru interogări | Echipa tehnică + operator: minimizare/anonimizare verificată, reguli pentru încărcări, validare căutare web; risc deschis P-017 |
| R3 | Păstrare excesivă sau ștergere incompletă | Ștergere document din D1/R2/index și fișier; limitele ștergerii chatului explicate | Operator + tehnic: retenții, proces complet de ștergere cont, retry și probe inclusiv backup/loguri; P-030 |
| R4 | Transferuri/furnizori insuficient documentați | Inventar preliminar; Google/Apple active numai în pilotul local | Operator: DPA, subîmputerniciți, locații și mecanisme de transfer aplicabile; verificare pentru fiecare serviciu |
| R5 | Cont compromis, recuperare abuzată | Origine verificată, e-mail confirmat, răspunsuri generice, PKCE, redirect fix, lipsa fallbackului între identități | Tehnic: rate limits/antiabuz, teste live, administratori cu MFA, rotație și plan incident |
| R6 | Asocierea greșită a datelor la migrare | Spații de ID separate; fără migrare pe baza e-mailului | Tehnic + operator: dovada deținerii ambelor conturi, backup și test de revenire |
| R7 | Răspuns AI eronat folosit împotriva elevului | Surse și mesaj că AI poate greși; verificarea de către profesor | Produs + evaluatori: probe pedagogice, fără decizii educaționale semnificative exclusiv automate; analiză nouă pentru evaluarea elevilor |
| R8 | Solicitări de drepturi fără răspuns sau operator neclar | Lipsurile sunt urmărite, nu mascate prin politici fictive | Operator: contact real, proceduri acces/rectificare/ștergere/portabilitate/restricționare/opoziție unde se aplică; test operațional |

## 6. Condiții înainte de lansarea generală

- Operator, roluri, scopuri și temeiuri documentate; datele de contact reale și politicile finale accesibile.
- DPIA completată pentru utilizarea efectivă, consultări relevante și aprobarea persoanei responsabile; analiza regulilor pentru copii și a riscurilor reziduale.
- Contracte și inventar furnizori, regiuni, transferuri, retenție și acces administrativ verificate. Fără promisiuni de „toate datele în UE” fără probe.
- Retenție aplicată tehnic; solicitări și ștergere completă testate în toate stocările; procedură de incidente și recuperare cu responsabili.
- Livrare e-mail, OAuth, sesiuni și protecții antiabuz testate real. Metodele de login se activează numai după verificarea acestor condiții.
- Cookie-uri/SDK-uri inventariate în mediul final; alegere și retragere a consimțământului unde este necesar; fără marketing implicit.
- P-017, P-027–P-030, P-033 și P-034 revizuite cu dovezi. Datele din fișele App Store/Google Play trebuie să reflecte aplicațiile implementate.

**Aprobare:** operator — de completat; DPO/consilier dacă se aplică — de completat; decizie și data — de completat. Reanalizare la schimbarea scopurilor, datelor, furnizorilor, funcțiilor AI, publicului sau platformei și după incidente relevante. Nu se marchează „DPIA finalizată” doar prin completarea acestui fișier.

## Revizie 0.9.1 — Google/Apple mai întâi

Utilizatorul a amânat e-mail/parolă și Resend până la domeniu. Fluxurile respective sunt ascunse și refuzate de server, inclusiv linkurile de recuperare. Google/Apple și Supabase rămân neactivate până la configurare. Se documentează ID/e-mail/nume și asocierea identităților; nu se cer permisiuni Gmail/Drive/contacte. Revizuirea furnizorilor și fluxul complet de ștergere rămân condiții de lansare; loginul social nu încheie evaluarea DPIA.

La activare se inventariază și metadatele de profil primite efectiv de Supabase de la provider (pot include URL-ul avatarului). ProfPlus afișează ID-ul asociat contului, e-mailul și numele; minimizarea și retenția datelor păstrate de provider se verifică pe configurația reală.

## Revizie 0.9.2 — 2026-10-04

Rebrandingul ProfPlus păstrează aceleași fluxuri, identități și date. Inspecția externă confirmă proiectul Supabase într-o regiune UE și providerii Google/Apple încă dezactivați. Providerul Email este activ în dashboard, deși aplicația blochează fluxurile de e-mail; alinierea configurației înainte de activarea externă rămâne P-033. Nu s-a deschis accesul general, nu s-au generat chei și nu s-au transferat conversațiile/documentele în Supabase. Raport: AUTH_CONFIGURATION_REVIEW.md. Această verificare nu închide R1, R4, R5 sau R6 și nu reprezintă aprobarea DPIA.

## Configurare externă pilot — 2026-10-04

Google activat în Supabase cu aprobarea titularului; Email dezactivat. Apple App ID/Services ID activate și cheie dedicată creată cu aprobarea titularului, providerul Supabase Apple încă dezactivat. Secretul Google a fost transmis numai către Supabase, fără afișare sau Git; fișierul Apple nu este încă disponibil pentru generarea secretului semnat. Aplicația și accesul privat Sites nu au fost modificate, nu există încă probe de login real sau migrare. Testarea datelor efectiv primite, retenției, ștergerii, contractelor și transferurilor rămâne deschisă; nu se declară conformitate sau aprobare DPIA.

Continuare pilot 2026-10-04: Apple activat în Supabase folosind secret semnat generat local din cheia nouă salvată de titular. Cheia privată rămâne locală, în afara Git. Aplicația locală folosește identitatea Supabase; nu se migrează sau asociază automat istoricul Sites. Testarea datelor primite și a sesiunilor reale așteaptă autentificarea titularului. Nu se modifică accesul public și nu se declară conformitatea.

P-037 (2026-10-04): UI folosește doar numele providerilor din identitățile deja verificate de server pentru clarificarea stării contului. Nu adaugă SDK-uri sau date persistate; nu expune ID-uri de identitate/tokenuri. Condițiile de lansare și riscurile deschise rămân aplicabile.

## Revizie 0.9.3 — 2026-10-05 — profil și ștergere locală

Date noi: rol didactic, disciplină și cicluri, exclusiv pentru biblioteca personalizată. Disciplina predată nu este tratată ca declarație despre convingeri personale. Profesorul poate corecta alegerile. Scopul și temeiul trebuie reflectate în informarea finală a operatorului; nu se deduce un consimțământ de marketing.

Ștergerea folosește identitatea verificată, origine controlată, confirmare și autentificare recentă. Secretul Supabase administrativ existent a fost configurat local cu aprobarea titularului, exclus din Git și protejat 0600; nu este transmis browserului. Datele proprii sunt eliminate din D1/R2 și fișierele/indexurile OpenAI înainte de identitatea Supabase. Un eșec păstrează referințele pentru reluare și blochează accesul. Datele altor conturi și manualele comune nu sunt șterse. Confirmarea de succes se referă la datele active, nu la retenție zero în infrastructura furnizorilor.

Dovezi: teste cu Auth simulat, D1/R2 izolate, identitate recentă, eroare/reluare, izolare și sesiune invalidată; adaptoare simulate pentru ordinea ștergerii OpenAI. Accesul administrativ real a fost verificat numai prin citire; contul titularului nu a fost șters. Interfața didactică și dialogul au fost verificate pe desktop și la 390px.

Riscuri deschise: retențiile/logurile/copii de siguranță și restaurarea fără reintroducerea datelor șterse; reluare operațională dacă identitatea a fost eliminată înainte de curățarea marcajului; întreruperi/încărcări concurente; probe reale complete cu conturi dedicate. În pilot, autorizarea Apple se oprește manual din contul Apple; nu condiționează dreptul de ștergere a datelor ProfPlus. Revocarea automată Apple și declarațiile App Store/Google Play sunt de finalizat înainte de mobil (P-039). Datele vechi Sites nu se asociază și nu se elimină prin potrivirea e-mailului; necesită un flux separat cu dovada identității.

Această implementare reduce R1/R3/R5, dar nu închide P-030/P-034 și nu aprobă DPIA. Referință pentru minimizare, ștergere și protecție din proiectare: [GDPR, articolele 5, 17 și 25](https://eur-lex.europa.eu/eli/reg/2016/679/oj). Cerințele Apple pentru ștergere/revocare: [Account deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/).

## Revizie 0.9.4 — bibliotecă dinamică și reguli de securitate

Metadate noi pentru documente: tip educațional, materie, cicluri, ID document/proprietar în D1. Scop exclusiv selecția surselor, fără date noi de elev/școală sau marketing. Etichetele inițiale provin din profil, sunt editabile și nu pretind o clasificare AI a conținutului. Documentele private potrivite pot fi consultate automat din alte conversații ale aceluiași cont; interfața explică acest scop și permite selecție manuală. Nu devin comune sau accesibile altor profesori. Originalele/fragmentele rămân pe fluxurile R2/OpenAI existente; nu este implementată pseudonimizarea completă înaintea indexării.

Etichetele sunt eliminate la ștergerea documentului/contului; probele cu date fictive verifică ownership, CSRF, valori permise, selecția după materie/cicluri și păstrarea altui cont la ștergere. Selecția automată stochează modul, nu o copie de ID-uri care ar deveni învechită. Interogările private către indexuri sunt limitate la 4 simultan, fără ca aceasta să constituie rate limiting sau plafon total de cost.

Cerințele extinse ale titularului privind securitatea sunt obligatorii în SECURITY_REQUIREMENTS.md. SECURITY_REVIEW.md separă scanarea secrete/dependențe, remedierea și testele efectuate de lipsurile reale. RLS nu se confundă cu verificarea D1 pe server; viitoarele școli/roluri necesită model nou și probe. Rate limiting, protecție boți, malware, pseudonimizare, audit log, export complet și retenție automată rămân P-042–P-046. Lipsurile și alertele npm rămase nu sunt acceptate automat. Nu există aprobare de producție sau certificare GDPR/DPIA prin această revizie.

## Revizie 0.9.5 — extinderea manualelor publice

Import autorizat din catalogul ministerului în indexul OpenAI comun existent; nu introduce furnizori AI noi, date de cont/elevi, roluri, trackere sau acces public. OCR se execută local cu modele oficiale Tesseract. Raportul versionat conține numai metadate ale manualelor publice, URL/hash și starea tehnică; exclude autori din raportul nou, text, credențiale și identificatori de furnizor. Originalele temporare sunt eliminate după prelucrare; textele/indexurile rămân pentru RAG. Drepturile de utilizare, retențiile/contractele furnizorilor și condițiile înainte de producție rămân deschise.

Creșterea colecției schimbă volumul/costul și riscul de răspuns greșit: prag tehnic de acoperire, OCR separat, verificări de proveniență/pagină și intervenție umană pentru formule/figuri. Aceste probe nu reprezintă certificare pedagogică sau aprobare DPIA. Urmărirea locală folosește loguri de stare fără text sau secrete.


## P-050 — Vizitatori fără cont

Mesaje transmise furnizorului OpenAI existent, fără stocare a transcriptului vizitatorului în D1. Memorie pagină până la reload/închidere; retenția furnizorului se evaluează separat, nu se pretinde ștergere imediată la furnizor. Interfața explică transmiterea și solicită evitarea datelor elevilor. Buget agregat temporal, fără IP sau identificator/cookie suplimentar, eliminat după expirare la următoarea cerere. Operatorul, temeiurile, politica reală și contractele rămân condiții înainte de producție.


## P-051 — Fișiere vizitatori

Fără identitate nouă, cookie sau stocare original/index pentru vizitatori. Fișier în memoria paginii; request inline la OpenAI cu store:false. Retenția/logurile furnizorului nu sunt echivalente cu ștergerea din browser și trebuie validate contractual. Nu se pretinde conformitate completă. Documente conturi izolate ca înainte. Fișiere neexecutate; semnături/format/mărime validate, scanare malware și validare structurală completă rămân P-044.


### P-052 — 2026-10-08

Proveniența folosește metadatele și fragmentele deja accesibile în fluxul RAG, fără furnizori sau categorii noi de date. Numele surselor citate apar acum și în document/export; profesorul verifică înainte de distribuire dacă titlurile documentelor proprii conțin date personale. Fără schimbări de acces/retenție sau evaluare automată oficială.

P-057, 2026-10-09: transfer autorizat explicit către proiectul Supabase existent al bibliotecii, inventarelor și datelor asociate documentelor. Originalele/textele și checkpointurile au containere private, fără expunere publică. Metadatele/istoricul/documentele generate vor trece din D1 în PostgreSQL numai după probe și verificarea transferului fidel; schema și cutoverul nu sunt încă confirmate. Fișierele/indexul AI OpenAI existent rămân o copie la furnizor pentru căutare. Ștergerea copiei locale confirmate nu echivalează cu ștergerea din toate backupurile/furnizorii. Identitățile existente sunt păstrate separat. Contractele, regiunea reală, retenția, restaurarea și drepturile arhivei complete rămân de verificat; nu se declară conformitate.

### 2026-10-09 — P-058: minimizarea copiilor locale

Copiile redundante sunt eliminate după verificarea sursei remote sau a transferului fidel; starea importului activ are checkpoint privat. Credențialele providerilor rămân local protejat și nu intră în biblioteca Supabase ori Git. Originalele de branding au backup privat verificat. Nu se modifică audiența Sites, identitățile, retenția furnizorilor sau condițiile de lansare generală.

## P-060 — 2026-10-09

Pro păstrează regiunea eu-west-1 și furnizorii existenți; nu schimbă automat contractele sau aprobarea DPIA. HIBP prin Supabase pentru parole, sesiuni limitate, SSL și restricții directe/jurnalizare activate și documentate; Email rămâne oprit. Jurnalele de conexiune sunt date operaționale cu acces administrativ, nu includ conținutul chat/documentelor prin această schimbare. Backup DB 7 zile; Storage nu este inclus, politica de backup/restaurare a documentelor private rămâne de verificat înainte de producție. PDF-urile oficiale se recuperează cu amprentă și metadate în Storage privat, fără date de elevi; raportul originalelor și indexul AI sunt distincte. Nu se publică OAuth către public, nu se cumpără domeniu/add-onuri și nu se declară branding verificat în lipsa domeniului titularului.


## Istoric P-056 integrat — fotografii datate, înlocuite de notele ulterioare


### P-056 — 2026-10-08

Extinderea indexului comun existent la materiale publice de olimpiade/concursuri din arhivele furnizate de utilizator. Aceiași furnizori și cheie autorizată pentru manuale. Filtre pe nume de link/text pentru rezultate și participanți, fără transmiterea deliberată a listelor elevilor. Nu există anonimizare garantată pentru orice document public; operatorul verifică eventualele date incidentale și drepturile înainte de utilizarea extinsă. PDF/OCR/DOCX/HTML și metadate publice de origine sunt trimise la OpenAI; sursele/fragmentele respectă aceeași retenție existentă. Raportul omite textele și ID-urile interne. Nu se certifică DPIA/GDPR pe baza importului.

## Note operaționale locale păstrate la consolidarea P-061

### 2026-10-05 — Consultarea paginii fără cont (P-049)

Pagina poate fi consultată fără crearea unei identități. Mesajul scris de vizitator rămâne în memoria paginii; nu se trimite la AI și nu se înregistrează în istoric. Nu se adaugă furnizori, trackere sau date noi; preferințele de temă și prelucrările tehnice existente rămân de inventariat. API-urile private refuză accesul neautentificat. Corecția nu reprezintă validare juridică sau aprobarea lansării generale.

## P-062 — 2026-10-09

Omiterea originalelor peste 50 MB este autorizată explicit de titular; referința este păstrată privat în Supabase și catalogul manualelor păstrează URL-ul oficial. Indexul existent, furnizorii, conturile, RLS și audiența pilotului nu se schimbă. Fișierele Word de blocare nu sunt materiale educaționale. Datele Storage nu sunt incluse în backupul DB. Transferul bibliotecii continuă, fără declarație de audit complet sau finalizare a tuturor importurilor. [Dovezi, teste și limite](IMPORT_CONTINUATION.md).

## P-063 — renunțare la materialele cu erori, 2026-10-10

Titularul a autorizat omiterea materialelor cu erori: referință verificată în Supabase înainte de eliminarea cache-ului local, fără redescărcare automată. Cele 10 PDF-uri rămase după erori (394.205.365 bytes) au fost eliminate. Importul valid al concursurilor continuă; companionul păstrează și linkurile pentru erorile lui. [Flux, dovezi și limite](FAILED_MATERIALS.md).


## P-065 — 2026-10-11

Cache doar pentru metadatele educaționale comune confirmate din Supabase, proiecție minimă server-side. Documentele proprii rămân autorizate pe cont și nu intră în cache. Fără date, furnizori, trackere, permisiuni sau audiență noi. [Implementare, verificări și limite](LIBRARY_LOADING.md).


P-065, revenire 2026-10-11: corectată blocarea după expirarea cache-ului. Lista comună recentă rămâne vizibilă în timpul actualizării; refresh în fundal, termen de 8 s pentru catalog și paginare paralelă limitată. Datele personale nu intră în cache/preview. [Dovezi și limite](LIBRARY_LOADING.md).


## P-067 — 2026-10-11

Priorități în selecția deja autorizată, fără acces nou; toate documentele proprii se verifică pe cont. Copia fără proveniență este reversibilă, originalul și dovezile rămân salvate. KaTeX/MathJax/fonturi locale, fără date trimise altui furnizor și fără relaxarea CSP. Word are formule ca imagini; validarea AI și importul complet rămân separate. Teste noi, verificare browser și descărcări reale executate. Audit: 8 high anterioare în toolchain, zero în producție. [Dovezi și limite](TEACHER_TEST_CONTROLS.md).

## P-068 — modele personale, 2026-10-11

Folosire de fragmente structurale ale modelelor private ale profesorului autentificat, prin interogarea existentă pe proprietar; fără cache comun privat, privilegii din profil sau promovare automată în registrul comun. Metadata JSON `modelTypes` validată pe server, în tabelul existent document_labels (Supabase când DATA_BACKEND=supabase, D1 în fixture). Fără migrare, schimbare RLS, furnizor sau audiență. Textul modelelor este referință nefiabilă; nu poate deveni instrucțiune de sistem, citare factuală ori date personale în documentul nou. Trimis aceluiași furnizor AI folosit deja pentru documente, store=false; originalele și etichetele se șterg prin fluxul existent de document/cont, fără replică suplimentară. Registrul comun este gol până la primirea și aprobarea exemplelor titularului, numai structuri anonimizate, fără documente private în Git. Limite: 2 modele recente/tip, 6 în total, maximum 6.000 caractere/model, 1 MiB răspuns furnizor, 2 citiri concurente, termen 10 s pentru întregul lookup de stil. Eșecurile au avertismente și fallback real. Izolare/validare API și ștergere testate cu identități fictive; nu reprezintă evaluare pedagogică, garanție anti-injecție sau audit complet GDPR. Audit npm: 8 high preexistente în toolchain, zero în dependențele de producție; controlul CI rămâne activ. Detalii: [DOCUMENT_MODELS.md](DOCUMENT_MODELS.md).

## P-069 — sursă LaTeX, 2026-10-11

Câmp opțional latex în documentul generat din JSON-ul conversației private, maximum 60.000 caractere; fără schemă/RLS/permisiuni noi. Aceleași controale de proprietar, CSRF, revizie și ștergere. Parser local limitat la 24 niveluri, fără execuție TeX, shell, fișiere, macroexpansiune sau încărcări externe. Renderer existent fără HTML brut, imagini externe sau TeX trust; CSP păstrată. Exportul .tex este descărcare locală, fără transmitere/integrări automate Overleaf; pachetele/macrocomenzile arbitrare nu sunt compilate local. Sursa personalizată rămâne exactă; conversia vizuală cere alegere explicită. Proiecția textului compatibil intră în fluxul AI existent la următorul mesaj, sursa brută nu este adăugată la cererea AI. Fără dependențe/furnizori/trackere noi. Testele locale verifică sursa exactă, autorizarea, CSRF, limite și ștergerea contului; nu constituie audit complet. Cele 8 alerte high de toolchain preexistente rămân deschise, zero în producție.

## P-070 — structuri comune anonimizate, 2026-10-11

Cererea explicită a titularului autorizează folosirea celor zece exemple ca modele implicite. Se distribuie numai structuri anonimizate, fără originale, identități sau enunțuri integrale. Noul tip unit rămâne metadata JSON validată în tabelul existent; fără migrare/RLS/permisiuni noi. Prioritate personală per tip și filtrare materie/ciclu/clasă; nicio promovare automată a unui model privat. Referințele ghidează stilul, nu fine-tuning sau adevăr matematic. Regula 2+2 este instrucțiune de organizare a titularului, în contextul aplicației, nu afirmație legală. Furnizorul AI și store=false rămân aceleași; probe live numai cu referințe anonimizate și cereri fictive. Verificările finale și limitele sunt în [REFERENCE_MODELS.md](REFERENCE_MODELS.md). Nu se declară audit complet, conformitate juridică sau drept de distribuire a originalelor. Alertele toolchain existente rămân urmărite separat.


## P-071 — minimizarea bibliotecii comune, 2026-10-11

Cerere explicită a titularului: eliminarea materialelor clar nerelevante, păstrând suportul pentru învățare/planificări/lecții și cazurile ambigue. Numai importul comun competitions este vizat; nu se modifică documentele private, RLS, schemele, conturile, cheile sau audiența. Filtrul verifică fișierul final în arhive mixte; protecția existentă a rezultatelor nominale și verificarea hash înaintea ștergerii copiilor locale utile rămân. Eliminările efective sunt limitate la UID/SHA confirmate și jurnalizate, cu verificarea absenței din catalog/Storage/indexul AI și checkpointul actualizat. Jurnalul conține metadate operaționale, nu conținutul documentelor sau chei; nu se comite în Git. 61 teste offline trecute; scanner Git/istoric/client fără detecții. Audit: 8 high preexistente în toolchain, zero în producție, controlul CI păstrat. Nu este audit complet sau aprobare GDPR/lansare generală. Originalele cu eșecuri/limite de mărime și finalizarea importului se raportează separat.


## P-072 — manuale și fidelitatea șabloanelor, 2026-10-12

Aceleași indexuri și autorizări. Filtrele manualelor provin din catalogul serverului și selecția deja verificată; nu se extinde accesul către documente personale. Sursele păstrează proveniența și ID-uri renumerotate înaintea generării. Modelele rămân date nefiabile, fără preluarea instrucțiunilor sau identităților din ele. Revizia transmite aceluiași furnizor AI documentul generat și pasajele deja autorizate, store=false, în termenul existent de 90 s; o corectare structurală suplimentară este limitată la o încercare. Nu se modifică furnizorul, RLS, schema, cheile, audiența sau importul paused. Controlul tabelului verifică forma, nu exactitatea programei/calendarului ori aspectul Word. Teste pentru selecție/izolare/guest/modele, corectare și refuzul salvării trecute; audit npm cu 8 high toolchain existente, zero în producție. Nu constituie audit complet sau aprobare GDPR.

Revizia testelor folosește OPENAI_REVIEW_MODEL dacă este configurat, implicit gpt-4.1 (acces verificat prin Models API), în locul modelului mini de redactare. Același furnizor și store=false; apelul suplimentar crește costul/latenta față de o singură generare. Controlul profesorului rămâne necesar.


## P-073 — 2026-10-12

Responsabil Marcos Soames, issue #18. Inventar opt worktree-uri și sursele Sites; toate implementările existente sunt în main. Merge-uri istorice pentru 8977bda și 2fdfbc2, conflicte revizuite păstrând P-054/P-065/P-067/P-069/P-072 și guard-ul fixture-urilor. Runtime/teste/scheme identice cu 1c50602, fără migrare, furnizor, cheie, permisiune sau audiență nouă. Rezumatul importului include numai numărări, fără URL-uri/titluri/private content; jurnalul brut și checkpointurile rămân excluse. 61 teste Python și suitele web focalizate trecute; scanner Git/istoric/client fără detecții, audit 8 high toolchain existente și zero producție. Site-ul P-072 deja publicat rămâne curent, fără deploy redundant; import paused și checkout operațional păstrat. Nu se declară CI complet verde, audit complet sau conformitate GDPR. [Dovezi](MAIN_CONSOLIDATION.md).

## P-077 — 2026-10-14

Preferințe didactice minime (trei numere și cerință liberă, maximum 800 caractere), păstrate în JSON-ul selection al conversației private existente; aceleași controale de acces, retenție și ștergere. Vizitator: numai starea paginii. Context/enunțuri deja autorizate și planul de verificare sunt procesate de același furnizor OpenAI, store=false; planul nu este salvat ori expus ca metadată suplimentară. Numărarea/verificarea textuală nu acordă note oficiale și nu înlocuiește controlul profesorului. Buget de ieșire 8.000 tokeni pentru compoziție și revizie suplimentară pentru fișe, în timeoutul existent de 90 s; cost/latenta pot crește. Fără servicii, schemă, RLS, trackere, audiență sau permisiuni noi. Nu reprezintă aprobare GDPR ori audit complet.


## P-078 — Admin și știri, 2026-10-14

Rol persistent legat de identitate Supabase verificată, fără rol din profil. Admin gestionează numai conținut editorial și numărări agregate, fără acces nou la datele profesorilor/elevilor. Articole publicate sunt publice în aplicație, ciornele/arhivele numai admin; Site rămâne owner-private. Audit minim 90 zile la următoarea scriere, actor nul la ștergere; fără job periodic. Configurație de cont Supabase comună local/Site, Google/Apple; nu se activează Email/registration. Imagini externe opționale fără referer. [Scop, retenție, verificări și limite](UNIFIED_APP_ADMIN.md). Nu se declară conformitate sau audit complet.


## P-079 — Flux editorial simplificat

Înlocuirea unei știri pe Acasă păstrează articolul deja published în lista completă, explicat editorului; arhivarea explicită îl retrage. Ciornele/archived rămân private, actorul și autorizarea identice. Fără date noi de profil ori transmitere AI. Auditul înlocuirii minim, cu aceeași retenție și limite P-078. Filtrare/paginare readonly și preview local; [dovezi și limite](NEWS_EDITOR.md). Nu este declarație de conformitate.


## P-080 — Biblioteca personală, 2026-10-15

Aceleași categorii de date și același flux ca documentele din conversații (original în stocarea privată, fișier și index la furnizorul AI pentru căutare, etichete din profil), dar disponibile în toate conversațiile contului. Nu se colectează câmpuri noi, nu se adaugă furnizor sau tracker; marcajul întrebării este local în browser. Interfața avertizează să nu se încarce date personale ale elevilor și explică indexarea la furnizor și ștergerea. Ștergerea individuală și a contului acoperă documentele (interogare după user_id). Risc rezidual: profesorul poate încărca totuși date ale elevilor; măsurile rămân avertismentul și controlul uman, fără detecție automată. Nu se declară conformitate completă.


## P-081 — Clasele mele, 2026-10-15

Date noi în cont: numele clasei (ex. „Clasa a V-a B”), documente încărcate pe secțiuni (același flux ca restul documentelor), observații text și personalizări (disciplină, nivel, număr de elevi, manual, preferințe). Nu se colectează identități, note sau situații individuale ale elevilor; interfața o cere explicit, dar textul liber poate conține totuși date personale introduse de profesor — risc rezidual, controlat prin avertisment și control uman, fără detecție automată. Personalizările sunt trimise furnizorului AI numai în cererile generate din clasă. Ștergerea clasei și a contului elimină documentele și jurnalul. Nu se declară conformitate completă.


## P-082 — Știri automate, 2026-10-15

Nu se colectează date noi despre utilizatori. Profilul didactic existent (disciplină, cicluri) este folosit numai pe server pentru ordonarea știrilor de pe Acasă; nu este trimis surselor sau unui furnizor AI. Cererile către sursele RSS nu conțin date ale utilizatorilor.


## P-086 — Selector de modele AI, 2026-10-15

Același furnizor OpenAI și aceeași cheie/proiect autorizat, modele GPT-4.1 mini și GPT-6.1 Sol selectabile de conturile autentificate. Aceleași documente/pasaje/mesaje pot fi procesate de modelul ales; nu se extind sursele, destinatarii sau scopurile. store:false păstrat pentru Responses. Preferința este în browser, per cont; modelul se adaugă mesajelor din istoricul existent și se șterge cu acestea. Nicio migrare, reindexare sau reantrenare. Riscuri: consum API mai mare, latență și erori de generare; control prin allowlist server, Sol numai autentificat, bugete finite, timeout și verificare de către profesor. Probele live au folosit exclusiv cereri sintetice, fără date de elevi/documente private. Aceste verificări nu certifică exactitatea pedagogică sau conformitatea completă.


## P-087 — Anunțuri de meditații, 2026-10-15

Prelucrare nouă: profesorii publică nume afișat, disciplină, niveluri, localitate, preț, descriere și date de contact (telefon și/sau e-mail). Temei: consimțământul explicit la publicare (bifă obligatorie, `consent_at` salvat); retragere oricând prin pauză/ștergere; expirare automată la 60 de zile; ștergere completă la ștergerea contului. Minimizare: contact neinclus în lista publică, afișat doar utilizatorilor conectați; fără linkuri/contacte în text liber. Raportările păstrează identificatorul raportorului și un motiv opțional (≤300 caractere), șterse la restabilire sau la ștergerea contului. Riscuri reziduale: date personale introduse în descriere, contact între profesori și minori — atenuate prin avertisment, raportare și moderare; verificarea identității profesorilor nu există. Activarea cere aplicarea migrației și evaluarea titularului; nu se declară conformitate completă.
