# Copia operațională ProfPlus — 2026-10-09

Codul complet al aplicației, importerele și documentația sunt reunite în acest repository. Vezi [CLOUD_STORAGE.md](CLOUD_STORAGE.md). Originalele și textele deja transferate sunt în Supabase, cu verificare SHA-256 înaintea ștergerii locale; recuperarea tuturor PDF-urilor originale este încă în curs ([MANUAL_RECOVERY.md](MANUAL_RECOVERY.md)); datele profesorilor sunt în PostgreSQL/Storage privat. Site-ul păstrează audiența privată și autentificarea existente.

Copia locală păstrează modificările necomise existente. Nu executa pull/reset/clean peste ele. Importul olimpiadelor folosește scripts/run_competition_import.py și data/competitions în acest checkout; configurația protejată web/.dev.vars, runtime-urile și modelele OCR rămân necesare. sources/ sincronizat rămâne read-only. Codul cloud și importerele sunt integrate în main prin PR #9, merge d69d0b928caf96e1595a677e11719212e0e1d1ae; ghidul de clonare este DEVELOPMENT_SETUP.md. Copia operațională veche/dirty nu se resetează în timpul importului.

P-060: recuperare originale limitată la 50 MB și continuare finită din scripts/run_manual_recovery.py, cu locks și rapoarte data/rag/original-recovery. Indexare/OCR separate în data/rag, prag 90%, fără duplicarea indexului existent. P-062 a omis originalul de 58 MB cu referință verificată și a reluat controllerul concursurilor; vezi IMPORT_CONTINUATION.md. Supabase Pro, spend cap activ; măsurile/setările și limitele sunt în MANUAL_RECOVERY.md și SECURITY_REVIEW.md. Nu șterge originale neconfirmate, checkpointuri/runtime/configurări necesare; nu modifica sources/ sincronizat.

## P-062

## P-062 — omiterea por dimensiune și continuarea importului (2026-10-09)

La cererea explicită a titularului, originalele de peste 50 MiB (52.428.800 bytes) sunt omise. Manualele rămân în catalog cu linkul oficial; aplicația distinge „Deschide la sursa oficială” de „Deschide copia din bibliotecă”. Indexul AI deja existent nu este șters. Un link nu este un PDF încărcat și nu conferă starea „indexat”.

Importul arhivelor aplică aceeași limită documentelor individuale, păstrează o referință verificată și continuă după `DOCUMENT_TOO_LARGE`; containerele ZIP/RAR păstrează limitele de descărcare/expansiune existente. Fișierele temporare Word `~$` sunt ignorate, iar containerele temporare se elimină și după erori. Originalele valide se scriu local numai după extragere și filtrarea rezultatelor personale.

Pentru originalele care se încadrează, ștergerea locală urmează verificarea bytes/SHA-256, manifest și catalog Supabase. Excepția autorizată este copia prea mare omisă: înaintea ștergerii se verifică referința cu URL-ul oficial, nu se pretinde că PDF-ul a fost transferat. Raportul păstrează amprenta/dimensiunea copiei eliminate. Importul concursurilor verifică spațiul comun și se oprește la 74 GB, cu 1 GB tampon pentru concurență în pragul operațional de 75 GB; limita nu este o rezervare contractuală. Spend cap și limita providerului nu sunt modificate.

Din copia operațională, separat de recuperarea deja activă:

```bash
.venv/bin/python scripts/sync_manual_source_links.py --operational-root /cale/absoluta/profos --follow-active-import
.venv/bin/python scripts/run_competition_import.py
.venv/bin/python scripts/recover_competition_originals.py --operational-root /cale/absoluta/profos
```

Companionul urmărește finit importul curent, are lock propriu și publică checkpoint privat `manual-source-links`. Fără `--follow-active-import` execută o singură sincronizare. `data/rag/original-recovery/source-links.txt` și `data/cleanup/P-062-cleanup.json` sunt rapoarte operaționale ignorate de Git. Copiile necunoscute, fișierele parțiale active, configurările, runtime-ul, modelele OCR și checkpointurile necesare rămân local. `sources/` sincronizat rămâne read-only.

Verificare live la 14:30 UTC: 639 PDF-uri originale de manuale în Supabase, 828 originale de concursuri/olimpiade, 1.318 texte de manuale și 1.405 texte de concursuri. Starea se schimbă în timpul importului. Nu toate originalele sunt transferate; cozile de manuale și arhive continuă. Cele 14 texte de concursuri rămase după blocaj au fost indexate/transferate și eliminate din cache. Au fost eliminate PDF-ul de concurs de 57.946.349 bytes și trei fișiere Word de blocare de 162 bytes, cu amprente verificate. A fost eliminat și cache-ul manualului 642-1 de 203.324.862 bytes, după verificarea referinței. Referințele manualelor prea mari se sincronizează în paralel.

Validare: 49 teste Python offline, TypeScript și suite bibliotecă/cache, adaptor Supabase, DTO/RAG comun și proveniență/export trecute. Build Sites trecut și publicat privat, source `024889aab52ab2056d6428873c76a584dcd6b61d`, deployment `appgdep_6ac8fa4c2e2881918f84f75ccaba52f6`, status `succeeded`, env revision 4. Scanner Git/client: 1.240 fișiere/bloburi, zero detecții. Audit npm: cele 8 high existente în toolchain rămân urmărite; fără dezactivarea controlului sau afirmație CI integral verde.

Recuperare separată pentru originalele concursurilor deja indexate: inventarul inițial a identificat 578 originale lipsă din cloud. `recover_competition_originals.py` grupează descărcările după URL, selectează membrii exclusiv prin SHA-256 original, transferă cu doi lucrători și elimină cache-ul după verificare. Nu reindexează și nu înlocuiește un original cu o versiune diferită a sursei. Raport/checkpoint: `data/competitions/original-recovery/progress.txt` / UID `competition-original-recovery`. Erorile și sursele modificate sunt raportate separat.

## P-063 — renunțare la materialele cu erori, 2026-10-10

Titularul a autorizat omiterea materialelor cu erori: referință verificată în Supabase înainte de eliminarea cache-ului local, fără redescărcare automată. Cele 10 PDF-uri rămase după erori (394.205.365 bytes) au fost eliminate. Importul valid al concursurilor continuă; companionul păstrează și linkurile pentru erorile lui. [Flux, dovezi și limite](FAILED_MATERIALS.md).
