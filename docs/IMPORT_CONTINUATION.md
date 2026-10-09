# Import și curățare după limita de 50 MB

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

## Publicare P-062 confirmată

PR #10 integrat în main la 14:36 UTC: merge `869a20747e721d776b692db1081971b056d282b3`, cod `980b88a0d7113b8585aa60583a0180acd52019b3`. Site-ul privat este publicat cu succes (dovezi în IMPORT_CONTINUATION.md). CI verifică acum și companionul de referințe și recuperarea originalelor concursurilor; toate cele 49 teste au fost executate local. Livrarea codului este **DONE**; importul datelor rămâne **IN PROGRESS**. Instrucțiunea explicită a titularului autorizează integrarea curentă în main; nu se dezactivează controalele și nu se schimbă regulile normale de review pentru sarcini viitoare.
