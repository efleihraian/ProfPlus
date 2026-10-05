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
