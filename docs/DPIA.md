# ProfOS — evaluare preliminară DPIA și registru de riscuri

Data: 2026-10-04 · versiune analizată: 0.9.0 · **DRAFT — neaprobat pentru lansare generală**.

Document de lucru bazat pe cod și verificările disponibile. Nu este o certificare GDPR, o politică publică sau o evaluare juridică finalizată. Responsabilul operatorului și persoana care aprobă evaluarea nu sunt încă identificați. Cerința utilizatorului: protecția datelor se aplică website-ului, backendului și aplicațiilor Android/iOS.

## 1. Scop, persoane și responsabilități

ProfOS asistă profesorul la căutarea în manuale/documente, explicații și redactarea de teste, bareme și planificări. Profesorul verifică documentele generate. Aplicația actuală nu implementează admitere, sancționare sau decizii automate de notare a elevilor.

Datele pot privi profesorii și orice persoane menționate în documente/conversații, inclusiv elevi. Faptul că doar profesorul are cont nu exclude prelucrarea datelor copiilor. În pilot se recomandă materiale publice ori anonimizate; nu există un filtru care să garanteze anonimizarea tuturor încărcărilor.

De completat înainte de extindere: denumirea și contactul operatorului, rolurile ProfOS/școală/profesor pentru fiecare scop, existența unui DPO dacă este necesar, temeiurile aplicabile, publicul și vârsta, volumul prelucrării, țările și responsabilul pentru solicitări/incidente. Nu se presupune că un acord bifat de profesor acoperă orice date ale elevilor.

## 2. Evaluarea necesității DPIA

DPIA se efectuează înaintea prelucrărilor susceptibile de risc ridicat; riscurile ridicate rămase după măsuri pot necesita consultarea autorității înainte de continuare. Vezi [EDPB](https://www.edpb.europa.eu/topics/accountability-and-compliance-tools/data-protection-impact-assessment_en). Pentru România se verifică și [Decizia ANSPDCP 174/2018](https://www.dataprotection.ro/servlet/ViewDocument?id=1556); lista nu înlocuiește analiza contextului concret.

Evaluare preliminară proprie: AI extern, posibile date ale copiilor și documente educaționale confidențiale justifică efectuarea unei DPIA complete înainte de utilizarea extinsă cu astfel de date. Scara, categoriile efective și relația cu școlile sunt necunoscute; concluzia juridică privind obligativitatea nu este încă aprobată. Autentificarea nouă rămâne inactivă în pilot; nu se deschide înregistrarea generală înainte de închiderea condițiilor de lansare de mai jos.

## 3. Fluxuri și inventar tehnic verificat

| Flux | Date/scop | Destinație actuală sau planificată | Păstrare și limite cunoscute |
|---|---|---|---|
| Pilot autentificat | ID, e-mail/nume furnizate de platformă; acces la cont | Sites/ChatGPT → server ProfOS | Sesiunea platformei; duratele și logurile furnizorului trebuie inventariate |
| Conturi independente, inactive | E-mail, parolă, nume opțional; Google/Apple și ID | Supabase Auth; providerul OAuth ales | De configurat și verificat; ProfOS nu salvează parola în D1 |
| E-mailuri de cont, inactive | Destinatar și mesaj de confirmare/recuperare | Supabase → Resend SMTP | Retenția evenimentelor/logurilor și contractele de verificat |
| Proiecte/conversații | Titluri, mesaje, citări, selecții, ID proprietar | D1 | Până la ștergere; ștergerea chatului golește transcriptul și păstrează un marcaj tehnic. Nu există încă o perioadă automată de expirare |
| Documente proprii | Originale, nume, fragmente și ID proprietar | R2 + metadate D1 + fișier/index OpenAI | Ștergerea documentului apelează eliminarea din fiecare stocare. Nu reprezintă ștergerea întregului cont |
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
| R4 | Transferuri/furnizori insuficient documentați | Inventar preliminar și autentificare externă neactivată | Operator: DPA, subîmputerniciți, locații și mecanisme de transfer aplicabile; verificare pentru fiecare serviciu |
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
