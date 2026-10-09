# Lucrări rămase
## P-063 — renunțare la materialele cu erori, 2026-10-10

Titularul a autorizat omiterea materialelor cu erori: referință verificată în Supabase înainte de eliminarea cache-ului local, fără redescărcare automată. Cele 10 PDF-uri rămase după erori (394.205.365 bytes) au fost eliminate. Importul valid al concursurilor continuă; companionul păstrează și linkurile pentru erorile lui. [Flux, dovezi și limite](docs/FAILED_MATERIALS.md).


## P-062 — 2026-10-09

Implementată omiterea originalelor peste 50 MB cu sursa păstrată; reluat importul concursurilor și continuat transferul manualelor. Codul, testele, curățarea verificată și publicarea sunt documentate în [IMPORT_CONTINUATION.md](docs/IMPORT_CONTINUATION.md). Transferul întregii biblioteci rămâne **IN PROGRESS**, separat de livrarea codului; nu sunt declarate toate originalele în cloud.


Stări: TODO, IN PROGRESS, BLOCKED, DONE. ID-urile rămân stabile.

| ID | Prioritate | Stare | Sarcină | Criteriu de finalizare |
|---|---|---|---|---|
| P-001 | P0 | TODO | Definirea MVP | Utilizator, caz de utilizare și limite confirmate în docs/MVP.md |
| P-002 | P0 | IN PROGRESS | Set de evaluare | 10–20 întrebări reale, surse și răspunsuri așteptate, inclusiv întrebări fără răspuns |
| P-003 | P0 | IN PROGRESS | Alegerea tehnologiilor | Decizie cu costuri, găzduire, model, embeddings și stocare |
| P-004 | P0 | DONE | Schelet aplicație | Interfață și backend pornesc local; configurare documentată |
| P-005 | P0 | DONE | AI wrapper pentru primul chat privat | Apel server-side, chei protejate, timeout și erori tratate |
| P-006 | P0 | IN PROGRESS | Ingestie documente; pilot clasa V 9/9 și import general reluat în ordinea cerută | Text extras, împărțit în fragmente, indexat cu document și pagină/secțiune |
| P-007 | P0 | IN PROGRESS | Căutare RAG | Fragmente relevante returnate pentru setul de evaluare |
| P-008 | P0 | IN PROGRESS | Răspuns cu surse | Răspuns legat de fragmente și comportament verificat când lipsesc dovezi |
| P-009 | P0 | TODO | Protecția datelor | Acces limitat la documentele utilizatorului; ștergere document și index verificată |
| P-010 | P1 | TODO | Evaluare și costuri | Rezultate măsurate pe întrebările P-002, latență și cost per întrebare |
| P-011 | P1 | IN PROGRESS | Pilot | Flux complet verificat de utilizator; problemele trecute în backlog |
| P-012 | P0 | TODO | Acces public controlat | Autentificare utilizatori și limite de consum înainte de acces public |
| P-013 | P2 | TODO | Aplicații iOS și Android | Cerințe și autentificare mobilă definite, apoi aplicațiile implementate |
| P-014 | P0 | TODO | Recuperarea pasajelor despre triunghiuri | Cazul nereușit din docs/RAG_EVALUATION.md trece cu surse corecte |
| P-015 | P1 | TODO | Formule, figuri și calitate pedagogică | Eșantion verificat față de PDF; impreciziile răspunsurilor documentate și corectate |
| P-016 | P0 | DONE | Chat cu documente prioritare și completare web; încărcări proprii | Încărcare, indexare, izolare, ștergere și trei categorii de surse verificate |
| P-017 | P0 | TODO | Evaluarea completării web și anonimizării | Întrebări reale, surse primare, conflicte și interogări fără detalii private verificate |

| P-018 | P0 | DONE | Bibliotecă de surse pentru profesor | Catalog comun, documente, surse citate; căutare, filtre, selecție reală pentru RAG și deschidere originale |

## Finalizat

| ID | Data | Rezultat |
|---|---|---|
| D-001 | 2026-10-01 | Documentația inițială și regulile de lucru |

## P-019 — Proiecte și istoric — DONE

Criteriu: creare proiecte/conversații, istoric persistent privat pe utilizator, filtrare/căutare după titlu, redeschidere și continuare, păstrarea citărilor/documentelor și mutare între proiecte. Implementat în 0.6.0.

## P-020 — Layout simplificat — DONE

Proiectele și istoricul sunt exclusiv în stânga, grupate și accesibile direct. Eliminate scurtăturile duplicate din antet/composer; pe mobil, meniu lateral. Chat și casetă de mesaj aerisite. Versiune 0.6.1.

## P-021 — Organizație GitHub și colaboratori — IN PROGRESS

Organizația gratuită ProfOS-Edu creată; repository privat transferat și origin actualizat. Invitațiile și accesul colegilor așteaptă identificatorii lor GitHub. Integrarea Claude a colegilor nu este încă verificată.

## P-022 — Mutare lizibilă și ștergere — DONE

Titlurile nu se deplasează la deschiderea opțiunilor. Mutare disponibilă pentru orice conversație; ștergere chat/proiect cu confirmare, verificarea proprietarului și păstrarea documentelor. Ștergerea proiectului păstrează conversațiile fără proiect. 0.7.0.

## P-023 — Editor pentru documente generate — DONE

Documentele efectiv create de AI deschid automat dialogul; editare directă, titlu, formatare, salvare în conversație și redeschidere, export PDF și DOCX. Versiune 0.8.0. Limite și verificări în docs/DOCUMENT_EDITOR.md.

## P-024 — Centrare editor document — DONE

Dialog centrat în viewport, margini egale pe desktop, foaie centrată și spațiere adaptivă; mobil pe tot ecranul. 0.8.1.

## P-025 — Paletă albastru / emerald — DONE

Schema utilizatorului aplicată global, inclusiv bibliotecă, editor, dialoguri și favicon. Acțiuni albastre, progres verde, fundal și text conform paletei. 0.8.2.

## P-026 — Cerințe permanente multiplatformă — DONE

Lista utilizatorului înregistrată în docs/PRODUCT_REQUIREMENTS.md și legată din AGENTS.md/CONTRIBUTING.md. Aplicabilă web, Android și iOS. DONE reprezintă înregistrarea instrucțiunilor, nu implementarea tuturor cerințelor.

## P-027 — Politici și date reale despre operator — TODO

Politică de confidențialitate, termeni, cookie-uri, datele firmei și contactul. Înainte de plăți: rambursări, abonamente, prețuri complete și anulare pentru web/App Store/Google Play. Criteriu: texte bazate pe operator, servicii și condiții reale, accesibile din platformele relevante.

## P-028 — Consimțăminte, date minime și terți — TODO

Inventar de date/cookie-uri/SDK-uri, scopuri, retenție și permisiuni; consimțăminte corecte în formulare și banner când se aplică; fără trackere opționale înainte de acord; opțiuni de refuz/retragere. Date ale copiilor: public și mecanism aplicabil stabilite înainte de activarea fluxurilor. Criteriu: comportament verificat, inventar și documentație aliniate.

## P-029 — Accesibilitate și practici transparente — TODO

Audit alt text, contrast, tastatură/focus și VoiceOver/TalkBack; fără dark patterns, costuri ascunse, recenzii false sau afirmații nedovedite; licențe verificate; dezabonare când sunt introduse e-mailuri de marketing. Criteriu: probe documentate pentru suprafețele și funcțiile existente pe fiecare platformă.

## P-030 — Solicitări de ștergere a datelor — IN PROGRESS

Cale vizibilă și verificarea identității; eliminare date cont, conversații, fișiere originale și indexuri AI, cu retențiile/excepțiile explicate. Criteriu: flux complet testat și documentat, distinct de ștergerea unei conversații care păstrează documentele. 0.9.3 implementează ștergerea datelor active în pilotul local; retențiile, logurile, copiile, revocarea Apple și monitorizarea rămân P-034/P-039.

## P-031 — Mod întunecat — DONE

Activare din antet, preferință persistentă local și sistem implicit; suprafețe și text adaptate în toată aplicația. 0.8.3.

## P-032 — Cont și setări, integrare pregătită — DONE

0.9.0: profil curent, securitate, formulare login/register/recuperare, temă/sistem, memorare opțională și resetare preferințe, informații despre stocare. Adapter Supabase cu e-mail verificat și Google/Apple OAuth pregătit și verificat cu furnizor simulat. Accesul Sites rămâne prin ChatGPT; nu sunt create conturi externe.

## P-033 — Activare autentificare și e-mailuri reale — IN PROGRESS

Domeniu și găzduire potrivită, Supabase/Resend, DNS/SMTP, Google/Apple, politici reale și limite antiabuz; verificarea fluxurilor reale inclusiv sesiuni/refresh, linkuri expirate/reutilizate, livrare și izolare. Plan de migrare pentru identitățile și datele Sites. Criteriu: utilizator nou verificat, login, reset și OAuth funcționale în găzduirea finală; nicio expunere de date între conturi. Pașii: docs/ACCOUNT_SETUP.md.

Progres 2026-10-04: Google Enabled și Email Disabled verificate în Supabase; callback Google salvat, Apple App ID/Services ID activate și cheie creată. Localizarea fișierului Apple, secretul semnat, providerul Apple, ținta aplicației și testele reale rămân deschise. Nu este lansare generală.

## P-034 — DPIA și validarea pregătirii GDPR — IN PROGRESS

Evaluare preliminară, fluxuri de date și registru de riscuri în docs/DPIA.md. Criteriu: roluri/temeiuri/operator stabilite, evaluare completată și aprobată, contracte/transferuri/retenție/incidențe/drepturi verificate, riscurile reziduale tratate și dovezi tehnice legate de versiunea lansată. Nu este o certificare de conformitate; condițiile deschise împiedică declararea pregătirii pentru lansare generală.

## P-035 — Prima etapă doar Google/Apple — DONE

0.9.1: interfață numai cu login social, e-mail/parolă blocate pe server prin flag explicit implicit fals; callbackurile de e-mail blocate. Ghid actualizat pentru Supabase, Google, Apple și găzduire. DONE reprezintă schimbarea aplicației; activarea și verificarea reală rămân P-033. Resend după domeniu.

## P-036 — Rebranding ProfPlus și verificare configurație — DONE

0.9.2: nume nou în aplicație/documentație, metadata Sites, repository și nume afișat organizație. Compatibilitatea identificatorilor în docs/BRANDING.md. Inspecție dashboard Supabase/Apple în docs/AUTH_CONFIGURATION_REVIEW.md; providerii reali rămân neconfigurați, urmăriți în P-033. Criteriu: branding publicat privat, verificări relevante trecute și raport de configurație disponibil.

P-033, progres suplimentar 2026-10-04: Apple Enabled verificat cu secret semnat și cheia nouă salvată de titular; aplicația locală localhost:3000 configurată. Redirecturile oficiale Google/Apple verificate, loginurile complete/refresh/logout/izolare încă netestate; secret Apple de reînnoit înainte de 2 aprilie 2027.

P-033, verificare 2026-10-04: loginurile reale Google/Apple efectuate de titular confirmate pe același cont Supabase; profil autentificat și sesiune persistentă după reload. Logout/refresh la expirare/izolare cu două conturi rămân deschise.

## P-037 — Stare clară pentru cont și metodele asociate — DONE

Google/Apple afișează «Asociat contului» din identitățile verificate pe server; «Conectare» nu mai apare când există sesiune. Profilul existent a fost salvat cu succes în testul real local. Build, TypeScript și suitele Auth trecute; migrarea site-ului online rămâne P-033.

## P-038 — Profil didactic, preselecție și ștergere cont — DONE (local)

Delogare vizibilă, profil minim învățător/profesor cu disciplină și cicluri, preselecție doar materiale potrivite indexate, schimbare ulterioară. Ștergere confirmată, identitate verificată, eliminare date proprii D1/R2/OpenAI/Supabase și eșec reluabil; nu se șterge contul real în test. Evidențe și limite GDPR/DPIA înainte de finalizare.

Dovezi: docs/ACCOUNT_LIFECYCLE.md; TypeScript/build, teste de profil, API/D1/R2 și Auth simulate trecute; UI desktop/390px. Niciun cont real șters. P-030/P-034 rămân deschise pentru condițiile operaționale și juridice.

## P-039 — Finalizarea operațională a ștergerii și integrarea mobilă — TODO

Revocare Apple prin API cu tokenuri protejate și notificări de furnizor, reluare administrativă automată pentru întreruperi inclusiv după eliminarea identității, retenție pentru marcaje/copie de siguranță/loguri și protecție pentru restaurări. Probe reale pe conturi dedicate, încărcări/ștergeri concurente și cereri deja pornite, identități Sites separate și implementare web/Android/iOS. Nu se declară conformitate sau ștergere instantanee a copiilor furnizorilor. Responsabili și termene de stabilit înainte de lansarea generală.

## P-040 — Selecție automată a tuturor materialelor relevante — DONE (local)

Manuale, culegeri, olimpiade, concursuri și documente indexate, potrivite disciplinei/ciclurilor și accesibile profesorului. Etichete editabile; materiale noi incluse automat, selecțiile manuale păstrate, izolare și ștergerea metadatelor verificate.

## P-041 — Reguli de securitate permanente și verificare inițială — DONE

Cerințele explicite din 2026-10-05 în SECURITY_REQUIREMENTS.md, legate din AGENTS și CONTRIBUTING; raport cu dovezi/lipsuri, scanare Git/client, ignore credențiale, CI periodic și remedieri imediate verificate. Nu echivalează cu auditul complet de producție.

## P-042 — Antiabuz, sesiuni și limite de cost — TODO

Rate limiting distribuit pe identitate/IP și endpoint, CAPTCHA/challenge după risc, limite login/signup/reset/AI/upload, MFA administratori, expirare/refresh/revocare și teste reale. Evită IP-uri în clar în loguri, definește retenția contoarelor și proxy-urile de încredere. Teste concurență și imposibilitatea ocolirii limitelor prin ID-uri/header-e falsificate.

## P-043 — RLS, roluri și școli izolate — TODO (înainte de aceste funcții)

Model server-side profesor/elev/părinte/admin, apartenențe și relații validate; tenant pe fiecare stocare, job, cache și index. RLS/politici Postgres sau rules Firebase înainte de expunerea datelor prin aceste servicii. D1 actual rămâne cu ownership verificat pe server. Criteriu: probe directe API/IDOR/escaladare și izolare cu două organizații; nu folosi user_metadata ca autoritate de privilegii.

## P-044 — Uploaduri, pseudonimizare și întărirea CSP — TODO

Verificare completă MIME/structură, ZIP bombs, scanare malware/quarantină, plafonarea requesturilor înainte de buffering; CSP strictă nonce/hash verificată pentru RSC și aplicațiile găzduite. Pseudonimizare înainte de indexare/LLM, filtre și probe de prompt injection/exfiltrare. Actualul control de semnătură nu este scanare malware.

## P-045 — Export date, audit și retenție — TODO

Export complet date proprii cu ownership, fără secrete, originale incluse controlat; loguri minime pentru acces/modificări, integritate și acces restricționat. Perioade clare și ștergere automată pentru date/loguri/backups/markere, restaurare fără reintroducerea datelor șterse. Legat de P-030/P-034/P-039.

## P-046 — Audit de producție și vulnerabilități rămase — IN PROGRESS

Actualizarea/testarea toolchainului cu alerte npm rămase; audit final auth bypass, IDOR, SQLi, XSS, upload, escaladare privilegii, prompt injection și data leakage. Verificare criptare/stocare/HTTPS/proxy real, RLS/rules când aplicabile, administratori și furnizori. Criteriu: raport pe versiunea livrată, remediere/retest și aprobarea riscurilor; niciun audit simulat declarat audit complet.

## P-047 — Profil și profil didactic într-o singură pagină — DONE (local)

Un singur element Profil, nume și activitate didactică în același formular/salvare, compatibilitate cu linkul vechi view=teaching și onboarding păstrat. Validarea pe server împiedică salvarea parțială a numelui când activitatea didactică este invalidă; fără date noi colectate.

Dovezi P-040/P-041/P-047: TypeScript/build, suite profil/Auth/API etichete și ștergere pe fixtures, UI profil comun cu salvare/reload și alias vechi, dialog/filtru Concurs, 390px fără overflow. Scanare surse/istoric accesibil/build client fără potriviri; audit npm rămas 19 alerte, documentat în SECURITY_REVIEW. CI înregistrat, execuția remote nu este declarată trecută. Nu s-a făcut publicare online sau audit complet de producție.

## P-048 — Import general manuale și urmărire — IN PROGRESS

Catalog sursă reverificat: 1.349 volume; matematică 113, fizică 36, informatică/TIC 52, rest 1.148. Coada locală pornește în ordinea cerută, text apoi OCR, fără reîncărcarea normală a UID-urilor confirmate. Raport public fără secrete, retry/timeout, bibliotecă cu contor integral și actualizări în chat. Criteriu de finalizare: raport remote final pe fiecare volum, lipsuri/erori explicate și probe de căutare cu UID/pagini pentru fiecare materie; nu este DONE doar pentru că procesul rulează. Manualele indisponibile și limbile OCR neacoperite necesită rezolvare/raport distinct.

Dovezi și comenzi: docs/MANUAL_IMPORT.md. Pragul tehnic 90% nu garantează formule/figuri corecte; P-015 rămâne deschis. Verificarea drepturilor pentru utilizarea extinsă/comercială, deduplicarea între UID-uri și inventarul fișierelor orfane după erori de transport rămân de finalizat.


P-048: prioritate actualizată la OCR pentru lipsurile cunoscute, apoi continuarea tuturor manualelor; rămâne IN PROGRESS.


## P-050 — Mesaje fără conectare — DONE (local)

Vizitatorul trimite mesaje către AI cu sursele comune ale pilotului, fără istoric persistent, cont anonim sau uploaduri. ID-urile private/selecțiile/reviziile sunt refuzate înainte de apel AI. Buget comun persistent: 5 cereri/minut și 30/oră pentru toți vizitatorii, nu per persoană. Protecția boți completă rămâne P-042.


## P-051 — Bibliotecă publică și fișiere temporare — DONE (local)

Catalog vizibil și surse indexate selectabile fără cont; Bibliotecă înainte de Conversație nouă. Fișiere vizitatori în memoria paginii: trei/10 MB total, trimise inline modelului, fără D1/R2/Files API. Pe viitor selecțiile specifice cer abonament verificat pe server.


Actualizare P-048 — 2026-10-05: la ultima cerere a utilizatorului, importul text pentru toate materiile precede OCR-ul. Coada reluată din checkpoint; confirmată activă în text_alte_materii, 243 indexate la verificare. Extracția OCR întreruptă este marcată needs_ocr, fără a declara succes. Șapte teste offline trecute; fără publicare online.


P-048 — 2026-10-05, ultima instrucțiune: import normal fără programare recurentă, apoi oprire înainte de OCR (awaiting_ocr). Controller înlocuit fără oprirea importului copil; progres păstrat. Șapte teste offline trecute. Automatizarea confirmată absentă; fără notificare proactivă garantată după închiderea turei. OCR necesită etapă ulterioară.


P-048 — ultima cerere 2026-10-05: import integral și OCR automat la final, fără scheduled task; înlocuiește oprirea înainte de OCR. Controller actualizat păstrând importul copil activ. Erori curente agregate: ConnectionError/API_NETWORK_ERROR/JSONDecodeError; reluările text limitate existente le vor reîncerca. Nu sunt volume finalizate și nu este promis succes pentru linkuri sau OCR indisponibile. Șapte teste offline trecute.


## P-052 — Reguli comune de colaborare — IN REVIEW

Ghid, instrucțiuni agenți și templates în PR #1; review pe alt cont, checkout-uri în ~/dev și migrare controlată a modificărilor locale. Protecția main refuzată de planul actual; reguli convenționale.

## P-053 — Actualizarea testelor pentru biblioteca publică — IN REVIEW

Remediere în PR #1: acces public la manuale, probe negative pentru date private, antet Origin absent corect simulat și test guest inclus în CI. Build, TypeScript și suite locale trecute; verificările remote rămân de confirmat. Audit npm distinct rămâne deschis.

## P-054 — Proveniență pentru exercițiile generate — IN REVIEW

Instrucțiuni server pentru fiecare exercițiu în teste/fișe, inclusiv vizitatori. Metadate bibliografice disponibile în context; fără an/pagină inventate. Necesită evaluare cu generări reale pentru acuratețea preluării/adaptării; nu este verificator automat de egalitate textuală.

## P-052 — Proveniența exercițiilor — DONE (local), 2026-10-08

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

## P-058 — O singură copie locală necesară — DONE, 2026-10-09

Consolidare la cererea titularului: cod/documentație, runtime/configurație și import activ în copia principală; transfer verificat al stării, checkpoint Supabase și reluare. Copii suplimentare și artefacte regenerabile eliminate; originale logo în Supabase, credențiale protejate. Evidență: docs/LOCAL_WORKSPACE.md și raport operațional privat.

## P-059 — Starea bibliotecii mari — IN REVIEW, 2026-10-09

La sesizarea titularului: manuale indexate apăreau neindexate la eșecul paginării cu deadline 30 secunde. Deadline total 120 secunde, cache server comun 5 minute, cereri simultane reunite; unknown pentru verificare eșuată. Regresie pentru paginare lentă/cache/eșec/retry/cursori; review independent necesar.

## P-060 — IN PROGRESS: Pro și recuperare manuale

Responsabil Marcos/Cosmin. Transferă toate originalele oficiale care se încadrează în 50 MB; nu modifica plafonul de cheltuieli. Acceptare: original verificat/catatlogat înainte de ștergere locală; raport final cu cele prea mari, indisponibile și eșuate; păstrează spațiu pentru datele profesorilor. scripts/run_manual_recovery.py așteaptă pasul activ și execută o continuare finită cu retry, fără scheduler. Indexarea/OCR are raport separat și prag de acoperire 90%; nu promite toate linkurile reușite. Implementarea și protecțiile sunt livrate, importul lung rămâne activ. Google branding blocat până la domeniu/verificare; backup separat Storage și auditurile de producție rămân necesare înaintea documentelor reale ale elevilor.


## Istoric P-056 integrat — fotografii datate, înlocuite de notele ulterioare


## P-056 — Import olimpiade și concursuri — IN PROGRESS, 2026-10-08

Responsabil: Marcos/Cosmin; cerere explicită de indexare a documentelor din cele 15 arhive enumerate în Word-ul furnizat. Import separat și reluabil în indexul comun existent, fără mutarea/resetarea/opririle cozii de manuale. Catalogul surselor publice este în catalog/competition-archives.json; raportul datat în catalog/competition-import-status.json. Fișierul Word original nu este copiat în Git și nu se modifică.

Descoperire paginată a linkurilor relevante, descărcări HTTPS cu verificare adresă publică și redirecturi, limite de fișier/spațiu, ZIP/RAR/TAR numai în memorie/fără extracție pe disc, limite de expansiune, PDF text/OCR și DOC/DOCX. Rezultatele/clasamentele/listările de participanți sunt excluse prin indicii URL/text; această filtrare nu certifică absența tuturor datelor personale. Documentele primesc tip olimpiadă/concurs, materie/clasă/ciclu unde identificabile, origine și membru al arhivei. Pentru DOC/DOCX/HTML, citarea este pe fragment, fără pagină PDF inventată. Ani numai din text disponibil. Deducerea automată necesită verificare pedagogică.

Dinamica bibliotecii/RAG citește metadatele publice ale materialelor comune din index și validează separat UID/categorie/URL; documentele private rămân în indexuri cu ownership. Materialele noi apar fără reconstruirea manifestului la fiecare upload. Nu se expun cheia, ID-urile interne de fișiere/index sau textele în rapoartele publice.

Verificări: șapte teste offline pentru URL/private/ZIP/expansiune/clasificare/DOCX, test DTO public cu categorii/URL/fragment/minimizare, TypeScript/build pe main actualizat. Procesul este activ în /Users/marcos/dev/profplus-P-056-import/data/competitions, control nescheduled run_competition_import.py, log/checkpoint local, trei indexări concurente. Mac-ul trebuie să rămână pornit și conectat; după întrerupere se reia aceeași coadă. Raportul nu este final; IN PROGRESS până la epuizarea linkurilor relevante, clasificarea lipsurilor și verificarea căutării remote. Unele linkuri inițiale au 404/406. Drepturile de utilizare extinsă și calitatea OCR/formulelor nu sunt certificate.


P-056 — Publicare privată confirmată 2026-10-08: source c5b7d9a4cb613cf2bb826d92ff1dd6142de1ce1b, deployment appgdep_6ac783c7b3708191a76ea77d30ed3905, https://profos-chat.cosminsoames.chatgpt.site. Biblioteca/RAG citesc dinamic UID/categorie/origine/ciclu/clasă/locator din fișierele comune, astfel încât importurile ulterioare apar fără o nouă publicare. 134 documente confirmate la fotografia 11:51:58Z; importul rămâne în curs. Căutare reală filtrată competition a returnat trei bareme COMPER cu UID, origine publică și PAGE:1. Build/TypeScript/DTO public și două suite Auth simulate au trecut și pe sursa Sites.

P-056, 2026-10-09: 578 documente confirmate indexed la verificarea 05:24 UTC; raport intermediar, arhivele continuă să fie parcurse. Remediere a păstrării paginilor în fragmente: blocuri cu marcaje repetate, înlocuire confirmată înainte de curățarea fișierului precedent, reluare sigură a curățării. 11 teste import și suitele DTO/RAG/bibliotecă au trecut. Procesul durabil rămâne activ în checkout-ul P-056; copia operațională a manualelor nu este sincronizată forțat.

Acces local, 2026-10-09: localhost:3000 nu avea server activ. Repornit procesul local din copia operațională, PID 90253, log exclus din Git în web/.sites-runtime/local-server.log. GET / confirmat HTTP 200, pagina ProfPlus verificată în browser. Nu s-a schimbat codul pentru repornire.

P-056, 2026-10-09: importul s-a oprit controlat la 578 fișiere confirmate din cauza DISK_SPACE_LOW. Eliminarea exclusivă a dependențelor regenerabile din cele două checkout-uri create pentru această sarcină a eliberat aproximativ 2 GB; originalele, checkpointurile, configurația și copia operațională au fost păstrate. Reluat cu controller PID 90588 și protecție de somn inactiv. La reluare sunt rezolvate întâi indexările/migrarea paginilor, apoi descoperirea. Raportul DISK_SPACE_LOW este istoric; starea curentă se citește din run.json.

## Note operaționale locale păstrate la consolidarea P-061

## P-049 — Pagina chat fără conectare obligatorie — DONE (local)

Pagina `/` rămâne accesibilă fără cont, inclusiv după reîncărcare. Vizitatorul poate scrie un mesaj și folosi sugestiile; trimiterea către AI, istoricul, proiectele și documentele private cer încă o identitate verificată pe server. Nu se creează conturi anonime sau apeluri AI pentru vizitatori. Restricțiile după abonament vor fi definite și implementate ulterior pe server, fără încredere în indicatoare din client. Verificări: browser fără sesiune, trimitere fără redirecționare și cu mesaj păstrat, TypeScript/build și API-uri private 401. Fără publicare sau commit în această conversație laterală.

## 2026-10-09 — Verificare inventar cloud și izolarea testelor

Verificare live: originalele nu sunt încă complete; 7 originale manuale și 828 originale concursuri/olimpiade, texte pentru 1.303 manuale indexate și 1.391 documente de concurs indexate. Un artifact sintetic de 7 bytes a fost identificat prin archiveId=test, example.org și SHA-256 exact al fixture-ului, apoi eliminat din Storage și catalog. Testele de concurs dezactivează explicit cloud_active, la fel ca testele de manuale, fără a depinde de configurația checkout-ului. Niciun material real eliminat. Importul concursurilor s-a oprit la un PDF de 57.946.349 bytes, SUPABASE_RESUMABLE_CREATE_413; originalul este păstrat local. Nu se declară transferul complet sau import activ după acest blocaj.

## P-061 — Consolidarea pentru colaborare — DONE, 2026-10-09

Responsabil Marcos/Cosmin, cerere explicită a titularului: întregul cod în main. Reunite istoricul P-056 și ramura P-057/P-059/P-060; conflictele păstrează marcajele paginilor, retenția/restaurarea cloud, izolarea fixture-urilor și cache-ul/starea corectă a bibliotecii. Include modificarea locală de stil pentru linkurile navigației, note operaționale și rapoarte datate. Ghid de pornire și exemple fără chei pentru colaboratori. Importul originalelor rămâne activ și nu este confundat cu publicarea codului. Verificările și integrarea sunt confirmate în nota finală P-061 de mai jos.

P-061 — integrare confirmată 2026-10-09 16:52 Europe/Bucharest: PR #9 MERGED, commit de integrare main d69d0b928caf96e1595a677e11719212e0e1d1ae. Istoriile P-056 (446e996) și P-057/P-060 (ab6dcd4) sunt strămoși confirmați ai main; PR #5/#6 s-au închis prin integrare, #7/#8 erau deja incluse. Inventarul codului operațional nu are fișiere lipsă. Ghid și exemple fără chei incluse; fără publicarea materialelor/datei private sau modificarea accesului.

CI run 37939471661: import și secrets trecute; instalarea, TypeScript, build, scanner client și suitele de cont/guest/bibliotecă trecute. Pasul npm audit a eșuat exclusiv pe cele 8 high existente din uneltele de dezvoltare (P-046), fără alertă nouă sau dezactivarea controlului. Consolidarea în main este cererea explicită a titularului, nu aprobare de producție ori eliminare a regulii PR/review pentru lucrări ulterioare. Publicarea privată Sites 21 succeeded, sursă 502d1a02cb13287f7a44d56ba94552361df0b9d4; toate sursele web versionate se potrivesc cu această sursă publicată. Importul manualelor rămâne activ în checkout-ul operațional; acesta nu este resetat sau sincronizat forțat.

## Publicare P-062 confirmată

PR #10 integrat în main la 14:36 UTC: merge `869a20747e721d776b692db1081971b056d282b3`, cod `980b88a0d7113b8585aa60583a0180acd52019b3`. Site-ul privat este publicat cu succes (dovezi în IMPORT_CONTINUATION.md). CI verifică acum și companionul de referințe și recuperarea originalelor concursurilor; toate cele 49 teste au fost executate local. Livrarea codului este **DONE**; importul datelor rămâne **IN PROGRESS**. Instrucțiunea explicită a titularului autorizează integrarea curentă în main; nu se dezactivează controalele și nu se schimbă regulile normale de review pentru sarcini viitoare.
