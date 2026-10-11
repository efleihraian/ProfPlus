# Verificare inițială de securitate — 2026-10-05

Versiune: **0.9.4 local**. Nu este audit complet și nu aprobă producția. Cerințe: [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md); riscuri: [DPIA.md](DPIA.md).

## Dovezi și remedieri

- Scanner local cu rezultate redactate: reguli de formate/atribuiri de secrete plus comparație exactă cu secretele locale existente, aplicate fișierelor sursă, tuturor bloburilor și obiectelor commit/tag accesibile din referințele Git locale și buildului client. Nu au fost găsite potriviri în verificarea efectuată. Nu este dovadă că orice tip posibil de secret lipsește și nu acoperă automat forkuri, alte clone, backupuri sau logurile serviciilor. Nu s-a identificat o cheie pentru revocare în această verificare.
- Fișierele `.dev.vars*`, `.env*`, cheile private și fișierele OAuth/service-account sunt ignorate la orice nivel. Variabilele OpenAI și cheia Supabase administrativă sunt consumate pe server; configurația publică Supabase nu este necesară în browser în arhitectura actuală. Valorile nu sunt incluse în raport sau Git.
- Sursa Workerului și pluginurilor din `web/build/` era exclusă de regula generală `build/`; a fost inclusă explicit pentru ca un checkout curat/CI să conțină codul necesar verificării și protecțiilor. `dist/` rămâne ignorat.
- Biblioteca și endpointul ei de stare cer acum identitate verificată înaintea apelurilor către indexuri. Operațiile de mutare/încărcare/ștergere cer origine prezentă și corespunzătoare; uploadul verifică și proprietarul conversației, inclusiv dacă aceasta a fost ștearsă.
- Istoricul returnează câmpurile necesare interfeței, fără `user_id` și marcajul intern `deleted`; fișierele/indexurile private se caută numai după proprietar verificat. Etichetele noi sunt limitate la valori permise și izolate pe cont.
- Headers la Worker: nosniff, no-referrer, Permissions-Policy, CSP, anti-framing pentru autentificarea independentă, HSTS numai pe HTTPS non-local și redirect HTTP înainte de procesare. Pilotul Sites permite framing doar pentru sine/ChatGPT. CSP încă permite inline scripts/styles necesare implementării curente; nonce/hash strict rămâne P-044. Evaluarea HTTPS este testată cu Request sintetic, nu printr-un domeniu de producție nou.
- Supabase Auth verifică utilizatorul pe server; cookie HttpOnly/Lax și Secure când originea este HTTPS. Loginurile/parolele sunt gestionate de provider, iar fluxurile e-mail sunt inactive în pilot. Logout și ștergerea contului au probe cu furnizor simulat; fluxurile reale de expirare/refresh rămân de verificat.
- Parametrizarea SQL și controlul proprietarului sunt păstrate în rutele schimbate. Profilul didactic editabil nu acordă privilegii. Aplicația nu are încă roluri elev/părinte/admin sau structuri de școală.

## Dependențe

Auditul inițial npm a raportat **28** alerte: 1 critică, 16 high, 10 moderate, 1 low. Actualizările compatibile au eliminat o parte dintre ele; Next a fost actualizat la 16.3.8, React/React DOM/React Server DOM Webpack la 19.3.0 și lockfile-ul a fost actualizat. Buildul și suitele existente au trecut cu aceste versiuni.

Auditul după remedieri raportează **19** alerte: **0 critice, 12 high, 7 moderate**. Rămân în toolchain/dependențe tranzitive: Cloudflare Vite plugin, Wrangler/Miniflare/undici/ws/esbuild, Vite, vinext/image-size/vite-plugin-commonjs, ESLint Next/fast-glob/micromatch/braces și drizzle-kit/esbuild-kit. Nu sunt tratate ca lipsite de risc pentru că sunt dev dependencies: o parte participă la build/preview/server.

Actualizarea întregului toolchain și retestarea sunt P-046. Nu s-a aplicat downgrade-ul incompatibil propus automat pentru ESLint/drizzle-kit și nu s-a folosit `audit fix --force`. Aceste alerte rămân blocaj pentru o declarație de pregătire a producției.

Workflowul `.github/workflows/security.yml` verifică secretele, buildul client, tipurile, suitele de cont și auditul npm la push/PR, manual și săptămânal. Permisiune GitHub numai read, acțiuni fixate prin commit verificat, fără secrete de producție. Auditul la prag high **va eșua cât timp alertele rămân**; nu este mascat prin `continue-on-error`. Existența workflowului nu garantează că branch protection sau notificările organizației sunt activate.

## Ce NU este încă verificat/implementat complet

| Control | Starea reală / urmărire |
|---|---|
| RLS Supabase | Datele aplicației sunt D1/R2, Supabase este Auth. Nu au fost create/migrate tabele Postgres și nu s-a pretins activarea RLS. Orice tabel viitor expus cere RLS și probe înainte de date reale; P-043 |
| Rate limiting / boți | Lipsesc limitele distribuite și challenge-ul aplicației; protecțiile providerului nu au fost auditate complet; P-042 |
| Elev/părinte/admin și școli | Funcții neimplementate, necesită autorizare și izolare tenant inclusiv RAG; P-043 |
| Uploaduri | Există limite și verificări de semnătură de bază; lipsesc validarea structurală completă, malware/quarantină și ZIP-bomb; P-044 |
| Criptare la stocare | Configurațiile și contractele tuturor furnizorilor nu au fost auditate în acest pas; P-034/P-046 |
| Minimizare/pseudonimizare AI | Instrucțiuni pentru web și selecție de fragmente există; nu există anonimizare garantată a originalului încărcat sau a mesajelor; P-017/P-044 |
| Audit log / export / retenție | Exportul PDF/DOCX nu exportă datele contului. Export complet și audit log dedicat/retenții automate lipsesc; P-045 |
| Ștergere | Date active proprii și identitate: implementate și testate cu fixtures. Backup/loguri/revocare Apple/reluare operațională rămân P-039 |
| CSP strictă / infrastructură reală | Inline încă permis; TLS, proxy și headers pe găzduirea finală trebuie probate; P-044/P-046 |
| Pentest și prompt injection | Au fost testate scenarii de ownership/CSRF/sesiuni și ștergere; nu s-a executat un audit complet auth bypass/IDOR/SQLi/XSS/upload/escaladare/prompt injection/multi-tenant; P-046 |

Lansarea generală și folosirea extinsă a datelor elevilor rămân condiționate de remediere, dovezi pe mediul final și aprobarea DPIA/operatorului.

## Import manuale 0.9.5 — 2026-10-05

Procesare numai a manualelor publice din catalogul ministerului; HTTPS și verificare de host înaintea fiecărui redirect, limita PDF/spațiu, subprocess/timeout, raport fără text sau credențiale, cheia existentă numai pe server. Șapte teste offline pentru reluare/izolare/redirect/timeout/calitate și test bibliotecă paginată trecute. Scanare Git/client fără potriviri. Audit pip pentru șase pachete rezolvate din requirements-rag: zero vulnerabilități cunoscute raportate; audit npm neschimbat la 19. Aceste rezultate nu certifică toate PDF-urile, drepturile de utilizare sau producția.


## P-050 — Chat vizitator local

Guest fără chatId/revision/selection; respingere 401 a cererilor pentru date private. Fără apel librarySnapshot/teacherEvidence sau salvare conversație pentru guest. SQL parametrizat, contor UPSERT atomic în D1, buget global 5/minut și 30/oră, refuz 503 dacă stocarea limitei e indisponibilă. Limita globală poate fi consumată de un singur vizitator; nu este protecție CAPTCHA sau limită individuală. Endpointurile private păstrează autentificarea.

## 2026-10-05 — Verificări P-053

Teste pozitive pentru biblioteca publică și negative pentru accesul guest la date private; test CSRF cu Origin efectiv absent. Suite locale trecute pe fixtures, fără apel OAuth real. Încercarea auditului npm a răspuns HTTP 400 și nu a produs un raport actualizat: cele 19 alerte cunoscute nu sunt declarate remediate. CI remote și instalarea curată trebuie confirmate separat.

## 2026-10-06 — Remediere P-046

Audit nou înaintea schimbării: 21 alerte (17 high, 4 moderate). După actualizări compatibile și override-uri: 8 high, 0 moderate, 0 critical. Actualizat Cloudflare Vite plugin 1.62.5, Wrangler 4.147.0, workers-types 5.20261006.1, Vite 8.3.3, Vinext 1.0.1, plugin-rsc 0.5.35, eslint-config-next 16.3.8 și drizzle-kit 0.31.11. Fixate tranzitive sharp 0.35.5, image-size 2.0.4, undici >=7.29.1, ws >=8.22.0, source-map-js 1.2.2, esbuild-kit esbuild 0.25.12 și fflate 0.7.5. Nu s-a folosit force/legacy-peer-deps.

Restul: braces, micromatch, fast-glob, @next/eslint-plugin-next, eslint-config-next, vite-plugin-dynamic-import, vite-plugin-commonjs și vinext, din GHSA-vfj7-8cjw-p6xm. [Advisory oficial](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): <=3.0.3 afectate, fără versiune reparată. Nu este rezolvat prin ascunderea alertei sau downgrade fără patch. Auditul la prag high rămâne blocant.

TypeScript, build, test:account (ambele moduri OAuth simulat), guest-chat și manual-library trecute local. Instalarea noilor versiuni a reușit din registry; execuția completă în Linux/GitHub trebuie confirmată înainte de merge. Nu este audit complet de producție.

Confirmare remote 2026-10-06, Actions 37486031167 (commit 4d6d084): instalare curată, TypeScript, build, scanări secrete/client, test:account, guest-chat și manual-library trecute pe Linux. Eroarea 503/415 nu se mai reproduce după actualizarea toolchain-ului. Singurul pas eșuat: audit npm, cele 8 high din braces fără patch upstream. Nu există rezultat general CI verde.

P-057, 2026-10-09: Storage privat verificat prin API; transferul testează SHA-256 și dimensiunea înainte de eliminarea locală, păstrează originalul la eroare/modificare și verifică evidența remote. Adaptorul server nu transmite cheia în corp/client și nu admite SQL arbitrar, batch mixt sau fallback de scriere; schemele/ID-urile sunt validate. Schema are RLS și revocă accesul direct anon/authenticated și executarea RPC; serviciul server păstrează verificările ownership. Probe WASM pe PostgreSQL și teste simulate trecute; proiectul real/advisors și concurența reală nu sunt încă verificate. Migrarea serverului este temporară, restrânsă la operația fixă de copiere, expiră și cere blocarea scrierilor și secret dedicat. Cheia/endpointul nu se activează până la infrastructură verificată.

P-057: verificarea pe proiectul Supabase real a confirmat RPC server-only, refuz direct anon/autentificat, ownership pe identități sintetice distincte, parametrizare SQL și rollback atomic (`tests/live_supabase.sql`; fixture-urile au fost rollbackate). Migrarea SQL a fost aplicată. Advisors: funcția internă rls_auto_enable a avut privilegiile API revocate; tabelele pentru evidența bibliotecii și bugetul guest au RLS fără politici publice intenționat și privilegii revocate. Avertizarea protecției parolelor compromise rămâne o configurație Auth distinctă. Buildul final cu lockfile 0.9.5, TypeScript și testele locale de cont au trecut. Audit npm: producție 0, complet 8 high pe unelte de dezvoltare, prin braces <=3.0.3 (GHSA-vfj7-8cjw-p6xm, fără versiune remediată publicată la verificare). Nu se ocolește auditul CI și nu se declară audit complet curat; inputurile de build rămân surse controlate ; auditul de producție fără alerte nu dovedește absența întregului cod vulnerabil din toate fluxurile de build/preview.

Verificare suplimentară finală: cheia publică/anon nu poate descărca originalul privat și nu poate executa RPC-ul aplicației. Reconcilierea finală verifică și existența fiecărei evidențe de material Storage în PostgreSQL. Importul reluat a continuat indexarea fără reținerea originalelor ca arhivă locală permanentă.

### 2026-10-09 — P-058: consolidare locală

Eliminare numai pe inventarul explicit de copii și artefacte ProfPlus, după verificarea commitului publicat/stării transferate. Credențiale originale păstrate în data/provider-credentials ignorat, director 0700 și fișiere 0600; fără valori în raport. Starea SQLite a trecut verificările de integritate și rânduri înaintea reluării. Nu este audit complet sau schimbare de acces în producție.

Verificare P-058: TypeScript și build au trecut în copia consolidată; 26 teste Python și șase suite Node (bibliotecă/RAG/cloud/proveniență/export) au trecut. Scannerul Git/build client a verificat 1.116 fișiere/bloburi fără detecții. localhost:3000 răspunde 200; importul continuă din copia principală (1.106 documente indexate la fotografia 2026-10-09T09:55:39Z, nu raport final). Testele offline de manuale blochează explicit configurația cloud: patru artefacte sintetice create la prima verificare au fost identificate prin UID/metadate de fixture și eliminate din Storage/PostgreSQL. Nu s-au șters materiale reale sau conturi.

### 2026-10-09 — P-059

Cache server: numai metadate publice ale bibliotecii comune, maximum 4 configurații, TTL 5 minute, chei exclusiv server, invalidare la schimbare credențiale. Datele private nu intră în cache; ownership verificat pe fiecare cerere. Eșecul nu conferă ready/selecție AI, ci unknown. Deadline 120 secunde și refuz cursor repetat. Regresii trecute; nu este audit complet.

## P-060 — Protecții Pro verificate 2026-10-09

Pro activ; HIBP/secure password change/current password activ. Email/anon/phone rămân dezactivate, Google/Apple existente păstrate. Sesiune unică, time-box 168h și inactivitate 24h; aplicarea Supabase este la refresh, cu JWT 3600s, nu revocare instantanee a oricărui token. Refresh reuse detection activ/10s. SSL enforcement activ; toate IP-urile externe refuzate pentru conexiuni directe/pooler. REST/Storage/Auth și SQL prin control plane continuă să funcționeze, verificate. Pentru viitoare CLI/pg_dump/direct DB trebuie permise doar IP-urile administrative necesare; nu folosi allow-all ca depanare implicită. Connection/disconnection logging activ, fără log_statement. Advisors: zero WARN pentru parole compromise, patru INFO RLS-no-policy deliberate pe tabele server-only.

Backupurile zilnice PostgreSQL sunt disponibile pe Pro (7 zile), nu cuprind obiectele Storage. PITR este add-on separat și nu a fost cumpărat. Backup separat și probă de restaurare a documentelor private rămân condiții de producție; nu se declară că toate precauțiile proiectului sunt finalizate. Captcha/MFA UI/scanarea malware și auditurile cu conturi/tenant distincte nu sunt rezolvate de simplul upgrade. Spend cap și 50 MB păstrate; importer 50 MB și prag bibliotecă 75 GB. Materialele se șterg local numai după verificare completă și metadata cloud.

P-060 GitHub: PR #8 https://github.com/ProfOS-Edu/ProfPlus/pull/8, review bogdan-25 solicitat, dependent de PR #6. CI run 37935131688: contractele de import și secrets trecute; build/TypeScript/suite cont/bibliotecă trecute în job, controlul npm audit a eșuat pe cele 8 high existente din braces și dependențele de dezvoltare. Controlul nu a fost dezactivat și PR-ul nu este auto-merged. Local: 37 teste Python trecute. Transferul originalelor și OCR pentru candidații noi rămân procese active, nu milestone complet.


## Istoric P-056 integrat — fotografii datate, înlocuite de notele ulterioare


### P-056 — import arhive, 2026-10-08

Izolare de importul manualelor, SQL parametrizat, HTTPS/adrese publice/redirecturi, dimensiuni și expansiune arhive, membri citiți ca bytes fără extracție pe disc, cheie numai în proces/server. DTO comun explicit, URL HTTPS fără credentiale și UID/categorii validate; fără date de ownership/index/private în DTO. Șapte teste offline și test DTO trecut; nu este scanare malware, audit DNS rebinding sau garanție de pseudonimizare. Formulele/OCR și documentele cu date incidentale necesită verificare. Nu se schimbă autentificarea ori sharing-ul Sites.

## Note operaționale locale păstrate la consolidarea P-061

### 2026-10-05 — Pagina pentru vizitatori (P-049)

Pagina locală este accesibilă fără reducerea autorizării API-urilor: GET istoric/bibliotecă/statut/documente și POST chat refuză cererile fără sesiune (401). Navigare/reload/scriere/trimitere ca vizitator verificate în browser; fără apel AI pentru vizitatori. TypeScript/build trecute; scanare Git/client fără detecții, audit npm neschimbat la 19. Fără schimbări Supabase, date sau privilegii; fără certificare GDPR sau audit complet.

## 2026-10-09 — Verificare inventar cloud și izolarea testelor

Verificare live: originalele nu sunt încă complete; 7 originale manuale și 828 originale concursuri/olimpiade, texte pentru 1.303 manuale indexate și 1.391 documente de concurs indexate. Un artifact sintetic de 7 bytes a fost identificat prin archiveId=test, example.org și SHA-256 exact al fixture-ului, apoi eliminat din Storage și catalog. Testele de concurs dezactivează explicit cloud_active, la fel ca testele de manuale, fără a depinde de configurația checkout-ului. Niciun material real eliminat. Importul concursurilor s-a oprit la un PDF de 57.946.349 bytes, SUPABASE_RESUMABLE_CREATE_413; originalul este păstrat local. Nu se declară transferul complet sau import activ după acest blocaj.

P-061, verificare 2026-10-09: instalare curată Node 22.20.0 cu lockfile, TypeScript/build și suite cont (ambele moduri), guest, bibliotecă/cache, DTO/RAG comun, adaptor cloud, proveniență/export trecute. Cele 39 teste offline Python au trecut. Scanner Git/client: 1.210 fișiere/bloburi fără detecții; linkurile ghidului verificate. Audit npm complet: 8 high existente în braces/toolchain; fără alerte noi, controlul păstrat, fără afirmație CI integral verde. Nu există diferențe de cod operațional neincluse; singurele schimbări suplimentare de configurare sunt exemplele goale și excluderile Git. Importul manualelor continuă din copia operațională, fără mutare/reset/sincronizare forțată.

## P-062 — 2026-10-09

Omiterea originalelor peste 50 MB este autorizată explicit de titular; referința este păstrată privat în Supabase și catalogul manualelor păstrează URL-ul oficial. Indexul existent, furnizorii, conturile, RLS și audiența pilotului nu se schimbă. Fișierele Word de blocare nu sunt materiale educaționale. Datele Storage nu sunt incluse în backupul DB. Transferul bibliotecii continuă, fără declarație de audit complet sau finalizare a tuturor importurilor. [Dovezi, teste și limite](IMPORT_CONTINUATION.md).

## Publicare P-062 confirmată

PR #10 integrat în main la 14:36 UTC: merge `869a20747e721d776b692db1081971b056d282b3`, cod `980b88a0d7113b8585aa60583a0180acd52019b3`. Site-ul privat este publicat cu succes (dovezi în IMPORT_CONTINUATION.md). CI verifică acum și companionul de referințe și recuperarea originalelor concursurilor; toate cele 49 teste au fost executate local. Livrarea codului este **DONE**; importul datelor rămâne **IN PROGRESS**. Instrucțiunea explicită a titularului autorizează integrarea curentă în main; nu se dezactivează controalele și nu se schimbă regulile normale de review pentru sarcini viitoare.

## P-063 — renunțare la materialele cu erori, 2026-10-10

Titularul a autorizat omiterea materialelor cu erori: referință verificată în Supabase înainte de eliminarea cache-ului local, fără redescărcare automată. Cele 10 PDF-uri rămase după erori (394.205.365 bytes) au fost eliminate. Importul valid al concursurilor continuă; companionul păstrează și linkurile pentru erorile lui. [Flux, dovezi și limite](FAILED_MATERIALS.md).

## Publicare și verificare P-063

PR #11 integrat în main: `46597b7aacf115e1433536a5e919b8abbf07369c`. 448 de referințe pentru materialele/URL-urile cu erori au fost salvate și jurnalizate; 10 PDF-uri eliminate, 394.205.365 bytes. Companionul rămâne activ numai cât rulează importul valid al concursurilor, pentru noile erori. Codul web are același tree Git `fb00b41548a85410be842dac8c1fa02a4c14e503` ca aplicația publicată; schimbarea datelor este în Supabase folosit de site, fără schimbare de audiență. Build, 58 teste offline și scanner Git/client fără detecții; auditul npm are 8 high existente.


## P-065 — 2026-10-11

Cache doar pentru metadatele educaționale comune confirmate din Supabase, proiecție minimă server-side. Documentele proprii rămân autorizate pe cont și nu intră în cache. Fără date, furnizori, trackere, permisiuni sau audiență noi. [Implementare, verificări și limite](LIBRARY_LOADING.md).


P-065, revenire 2026-10-11: corectată blocarea după expirarea cache-ului. Lista comună recentă rămâne vizibilă în timpul actualizării; refresh în fundal, termen de 8 s pentru catalog și paginare paralelă limitată. Datele personale nu intră în cache/preview. [Dovezi și limite](LIBRARY_LOADING.md).


## P-067 — 2026-10-11

Priorități în selecția deja autorizată, fără acces nou; toate documentele proprii se verifică pe cont. Copia fără proveniență este reversibilă, originalul și dovezile rămân salvate. KaTeX/MathJax/fonturi locale, fără date trimise altui furnizor și fără relaxarea CSP. Word are formule ca imagini; validarea AI și importul complet rămân separate. Teste noi, verificare browser și descărcări reale executate. Audit: 8 high anterioare în toolchain, zero în producție. [Dovezi și limite](TEACHER_TEST_CONTROLS.md).

## P-068 — modele personale, 2026-10-11

Folosire de fragmente structurale ale modelelor private ale profesorului autentificat, prin interogarea existentă pe proprietar; fără cache comun privat, privilegii din profil sau promovare automată în registrul comun. Metadata JSON `modelTypes` validată pe server, în tabelul existent document_labels (Supabase când DATA_BACKEND=supabase, D1 în fixture). Fără migrare, schimbare RLS, furnizor sau audiență. Textul modelelor este referință nefiabilă; nu poate deveni instrucțiune de sistem, citare factuală ori date personale în documentul nou. Trimis aceluiași furnizor AI folosit deja pentru documente, store=false; originalele și etichetele se șterg prin fluxul existent de document/cont, fără replică suplimentară. Registrul comun este gol până la primirea și aprobarea exemplelor titularului, numai structuri anonimizate, fără documente private în Git. Limite: 2 modele recente/tip, 6 în total, maximum 6.000 caractere/model, 1 MiB răspuns furnizor, 2 citiri concurente, termen 10 s pentru întregul lookup de stil. Eșecurile au avertismente și fallback real. Izolare/validare API și ștergere testate cu identități fictive; nu reprezintă evaluare pedagogică, garanție anti-injecție sau audit complet GDPR. Audit npm: 8 high preexistente în toolchain, zero în dependențele de producție; controlul CI rămâne activ. Detalii: [DOCUMENT_MODELS.md](DOCUMENT_MODELS.md).

Publicare confirmată succeeded la 2026-10-11T10:50:39Z: https://profos-chat.cosminsoames.chatgpt.site/, deployment appgdep_6acb69e78ac08191b4891de70867aa3f, source Site c35840059bbe9283f2476bbb1509092cbb577fdb, env revision 4; audiență owner-only păstrată. Cod integrat direct pe main la 25bce36, fără PR nou. Localhost:3000 servește noul worktree P-068, HTTP 200; proces local 34584. Preview-ul cu cont fictiv oprit, fără rută QA în build. Importul operațional a fost verificat separat: 22491/22492 erau active la fotografia anterioară; ulterior s-au oprit cu IMPORT_STOPPED. Reluat fluxul finit existent cu aceeași cheie și protecția ștergerii locale după confirmare cloud; codul operațional nu a fost modificat.

CI remote 38133353969: contracte import, scanner Git/client, TypeScript, build și toate suitele web (inclusiv modele) trecute; npm audit --audit-level=high eșuat exclusiv pentru cele 8 high preexistente braces/micromatch și lanțul toolchain. Zero alerte în producție în auditul local. Nu se dezactivează controlul și nu se declară CI complet verde. Scanner Git/client 1.462 fișiere/bloburi, source/client Site 282, zero detecții; limitele scannerului rămân.

## P-069 — sursă LaTeX, 2026-10-11

Câmp opțional latex în documentul generat din JSON-ul conversației private, maximum 60.000 caractere; fără schemă/RLS/permisiuni noi. Aceleași controale de proprietar, CSRF, revizie și ștergere. Parser local limitat la 24 niveluri, fără execuție TeX, shell, fișiere, macroexpansiune sau încărcări externe. Renderer existent fără HTML brut, imagini externe sau TeX trust; CSP păstrată. Exportul .tex este descărcare locală, fără transmitere/integrări automate Overleaf; pachetele/macrocomenzile arbitrare nu sunt compilate local. Sursa personalizată rămâne exactă; conversia vizuală cere alegere explicită. Proiecția textului compatibil intră în fluxul AI existent la următorul mesaj, sursa brută nu este adăugată la cererea AI. Fără dependențe/furnizori/trackere noi. Testele locale verifică sursa exactă, autorizarea, CSRF, limite și ștergerea contului; nu constituie audit complet. Cele 8 alerte high de toolchain preexistente rămân deschise, zero în producție.

## P-070 — structuri comune anonimizate, 2026-10-11

Cererea explicită a titularului autorizează folosirea celor zece exemple ca modele implicite. Se distribuie numai structuri anonimizate, fără originale, identități sau enunțuri integrale. Noul tip unit rămâne metadata JSON validată în tabelul existent; fără migrare/RLS/permisiuni noi. Prioritate personală per tip și filtrare materie/ciclu/clasă; nicio promovare automată a unui model privat. Referințele ghidează stilul, nu fine-tuning sau adevăr matematic. Regula 2+2 este instrucțiune de organizare a titularului, în contextul aplicației, nu afirmație legală. Furnizorul AI și store=false rămân aceleași; probe live numai cu referințe anonimizate și cereri fictive. Verificările finale și limitele sunt în [REFERENCE_MODELS.md](REFERENCE_MODELS.md). Nu se declară audit complet, conformitate juridică sau drept de distribuire a originalelor. Alertele toolchain existente rămân urmărite separat.

Publicare privată confirmată succeeded la 2026-10-11T11:53:36Z, https://profos-chat.cosminsoames.chatgpt.site/, deployment appgdep_6acb78a73c508191bffc30f38b1babf5, source Site e5db4330e3b0194fb62bb9116a77ee00fe196ab1, env revision 4. Cod integrat direct în main la 214c40d, fără PR; audiența privată existentă păstrată. Localhost:3000 servește P-070, HTTP 200, PID 40544. Importurile 35349/35350 verificate active și păstrate. Nu se declară transferul întregii biblioteci finalizat.


## P-071 — minimizarea bibliotecii comune, 2026-10-11

Cerere explicită a titularului: eliminarea materialelor clar nerelevante, păstrând suportul pentru învățare/planificări/lecții și cazurile ambigue. Numai importul comun competitions este vizat; nu se modifică documentele private, RLS, schemele, conturile, cheile sau audiența. Filtrul verifică fișierul final în arhive mixte; protecția existentă a rezultatelor nominale și verificarea hash înaintea ștergerii copiilor locale utile rămân. Eliminările efective sunt limitate la UID/SHA confirmate și jurnalizate, cu verificarea absenței din catalog/Storage/indexul AI și checkpointul actualizat. Jurnalul conține metadate operaționale, nu conținutul documentelor sau chei; nu se comite în Git. 61 teste offline trecute; scanner Git/istoric/client fără detecții. Audit: 8 high preexistente în toolchain, zero în producție, controlul CI păstrat. Nu este audit complet sau aprobare GDPR/lansare generală. Originalele cu eșecuri/limite de mărime și finalizarea importului se raportează separat.
