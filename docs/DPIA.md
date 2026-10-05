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
