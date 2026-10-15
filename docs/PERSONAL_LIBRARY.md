# Biblioteca personală și animațiile Plusi — P-080

Responsabil: Marcos Soames (cerere explicită din 2026-10-15). Branch `feature/P-080-personal-library-plusi`, pornit din `origin/main` 04fd690.

## Ce face

- **Cont → Bibliotecă personală** (tab nou, link direct `/account?view=library`): profesorii cu cont își adaugă documentele folosite des (planificări, modele de teste, fișe), le deschid și le șterg (ștergere în doi pași: „Șterge” → „Confirmă”).
- **Prima deschidere a asistentului**: pentru un cont autentificat, cu profil didactic complet, Plusi întreabă „Ai documente pe care le folosești des?” și oferă încărcarea direct din conversație („Da, le adaug acum” / „Nu acum”). Întrebarea nu apare dacă biblioteca are deja documente sau dacă profesorul a răspuns în acest browser.
- **Chatul ține cont de bibliotecă**: în modul automat, documentele personale gata indexate sunt surse în toate conversațiile, indiferent de profilul didactic. În „Alege sursele” apar marcate „Biblioteca personală” și pot fi excluse manual pentru o conversație. Documentele marcate ca modele (P-068) rămân în fluxul modelelor, nu ca surse de conținut.

## Cum este implementată (fără migrare)

- Documentele folosesc tabelul, stocarea privată, indexarea și operațiile SQL existente (`documents`, aceleași interogări din `supabase-operations.json`). Nu există tabel, coloană, RPC sau furnizor nou.
- Gruparea bibliotecii este un identificator UUID determinist derivat pe server din identitatea verificată (`SHA-256("profplus:personal-library:v1:" + user)`, `web/lib/personal-library.ts`). Clientul trimite numai `scope=library`; nu poate alege sau redirecționa grupul. Un `chatId` egal cu grupul este refuzat (400).
- Grupul nu este conversație: este eliminat din lista istoricului și refuzat la deschidere (404), salvare (PUT 400), ștergere ca conversație (DELETE 400) și ca `chatId` în `/api/chat` (400). Adoptarea istorică „Documente anterioare” poate crea un rând ascuns pentru acest grup; el nu este returnat clientului.
- Încărcare: aceleași validări ca în conversații (autentificare, Origin, tipuri PDF/DOC/DOCX/PPTX/TXT/MD/HTML cu verificarea semnăturii, 10 MB, blocare în timpul ștergerii contului). Limita bibliotecii este limita existentă pe grup: **10 documente**, plus 50 pe cont în total.
- Listare: `GET /api/library/personal` (401 fără cont). Ștergerea și descărcarea folosesc rutele existente `/api/documents/[id]` cu verificarea proprietarului; ștergerea elimină originalul, fișierul/indexul la furnizor și etichetele. Ștergerea contului le include, fiind interogată după `user_id`.
- Marcajul „întrebare afișată” este numai în browser (`localStorage`, cheia `profplus-library-prompt`, ștearsă la delogare). Nu se salvează nimic nou pe server.

## Animațiile Plusi

- Atingerea lui Plusi (Acasă, asistent, butonul plutitor, întrebarea bibliotecii) alternează trei reacții: săritură cu tumbă, salut cu flipera/ciucurele, scufundare; bule care se împrăștie; pe Acasă replica din balon se schimbă.
- Între taburi: indicatorul tabului activ alunecă elastic, un Plusi mic înoată în arc de la tabul vechi la cel nou și se scufundă cu un val; pagina nouă intră din direcția tabului (stânga/dreapta). Funcționează și pe două rânduri de taburi (mobil).
- Butonul plutitor intră cu o stropire și un inel; întrebarea bibliotecii intră cu Plusi care sare în scenă și salută.
- `prefers-reduced-motion: reduce` dezactivează reacțiile, înotul, valul și tranzițiile direcționale; indicatorul se mută fără animație.

## Verificări executate (2026-10-15)

- TypeScript `--noEmit`: nicio eroare nouă față de `origin/main` în același mediu (ambele au aceleași 8 erori de pachete lipsă din `node_modules`-ul disponibil local, independente de această sarcină).
- `tests/personal-library.mjs` (nou): identificator determinist/distinct/format valid; includere automată numai pentru documentele personale gata, fără modele și fără alte conversații; încărcare cu stocare simulată — grup derivat pe server, fără conversație, `chatId` client ignorat, `scope` invalid 400, grupul ca conversație 400, conversație străină 404, limită 409, fără cont 401; istoric ascuns și refuzat la GET/PUT/DELETE.
- Trecute și: cloud-library (cu stub pentru noua funcție), exercise-options, exercise-provenance, document-models, guest-chat, library-availability, account-lifecycle. `account-integration` și `teacher-test-controls` nu rulează în acest mediu (wrangler/mathjax lipsă) — eșuează identic pe `origin/main`, deci nu sunt declarate trecute.
- ESLint pe fișierele atinse: zero erori (avertismente preexistente).
- Probă vizuală într-un harness cu componentele reale (Chromium, API simulat, fără backend real): 1280 px și 390 px; reacția Plusi și bulele, înotul între taburi și alinierea indicatorului pe un rând și pe două rânduri, intrarea direcțională, întrebarea la prima deschidere, încărcare/ștergere cu confirmare, nereafișarea după răspuns, modul de mișcare redusă. A fost găsită și corectată o cheie React duplicată (pagina veche rămânea montată) și alinierea indicatorului pe mobil.

## Verificări finale după integrare (2026-10-15)

Dependențe instalate din lockfile pe Linux (VM-ul Mac-ului): `npm run build` reușit (ruta `/api/library/personal` inclusă), `tsc --noEmit` fără erori, `npm run test:account` (lifecycle + integrare normal/social-only) trecut, plus personal-library, cloud-library, exercise-options, exercise-provenance, document-models, guest-chat, library-availability și teacher-test-controls. `npm audit --omit=dev`: 0 vulnerabilități; audit complet: cele 8 high toolchain preexistente. `security_scan.py --history` pe repository și `--client` pe build: fără detecții. GitHub: PR #24 MERGED, origin/main = c126156.

## Verificare cu backendul real, fără cont (2026-10-15)

Build-ul final rulat local (wrangler dev, 127.0.0.1, configurația reală din `.dev.vars`, copiată numai în spațiul privat al sesiunii, fără afișarea valorilor): `/api/account` raportează Supabase pregătit și ștergerea disponibilă; biblioteca comună reală răspunde cu 9.538 de materiale fără avertismente; știrile 200; `/api/library/personal` și încărcarea în bibliotecă fără cont 401; un mesaj de vizitator cu OpenAI real primește răspuns. Nu s-au scris date în Supabase.

CI GitHub (Security checks) pentru main: secrete, contracte import, install, tsc, build, scanner client, test:account și toate suitele trec; jobul pică numai la `npm audit --audit-level=high` din cauza celor 8 alerte braces (GHSA-vfj7-8cjw-p6xm, fără versiune reparată, doar unelte de dezvoltare). Titularul a decis păstrarea controlului strict; CI rămâne roșu până la o remediere reală.

Testul autentificat se face de titular cu propriul cont (decizie 2026-10-15), după publicarea pe Site sau pe serverul local: Cont → Bibliotecă personală (încărcare, „Gata · folosit de Plusi”, ștergere), întrebarea la prima deschidere a asistentului, un mesaj care folosește documentul.

## Limite

- Nu s-a executat un login real și nici scrieri autentificate în Supabase/OpenAI; publicarea Site nu a fost executată.
- Întrebarea de prima deschidere este per browser; după delogare poate reapărea dacă biblioteca e goală.
- Limita de 10 documente provine din limita existentă pe grup; creșterea ei cere schimbarea operației SQL aprobate (migrare).
