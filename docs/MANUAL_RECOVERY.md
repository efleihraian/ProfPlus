# Recuperarea PDF-urilor originale ale manualelor

PDF-ul original, textul extras și indexarea pentru AI sunt trei stări separate. Un manual poate fi disponibil pentru AI, iar originalul să fie încă la sursa oficială. Rapoartele importului nu trebuie folosite ca dovadă că toate PDF-urile sunt în Storage.

La cererea titularului din 9 octombrie 2026, recuperăm toate originalele oficiale care se încadrează în limita Supabase de 50 MB. Organizația este Pro; spend cap rămâne activ. Nu sunt cumpărate add-onuri. Pro include 100 GB Storage și 8 GB disk per proiect; biblioteca are un prag operațional de 75 GB, cu spațiu rămas pentru documentele profesorilor. Conturile/conversațiile/metadatele merg în PostgreSQL, nu în fișiere PDF. Limita existentă pentru uploadul profesorului este 10 MB pe document.

## Transfer reluabil

Din copia operațională, cu configurația server protejată existentă:

```bash
.venv/bin/python scripts/recover_manual_originals.py \
  --operational-root /cale/absoluta/profos --file-limit-mb 50
```

Transferul are cel mult șase lucrători (implicit șase, `--workers 1..6`); indexarea/OCR păstrează limitele separate. SIGTERM/SIGINT opresc coada și lasă transferurile deja începute să se încheie. Reluarea nu redescarcă un document deja identificat ca prea mare dacă URL-ul nu s-a schimbat, iar un PDF local păstrat este verificat din nou față de limita aleasă.

Scriptul procesează catalogul complet, circular pe disciplină și clasă înaintea editurilor suplimentare din aceeași grupă. Descarcă numai de la manuale.edu.ro, verifică redirectul și semnătura PDF, respinge dimensiunea prea mare înainte de download când Content-Length este disponibil și limitează și fluxurile fără lungime. Transferul privat folosește upload reluabil; recitește toate bytes din Storage, verifică SHA-256/dimensiune, manifest și înregistrarea PostgreSQL înaintea ștergerii locale. Originalele rămase după eșec de upload sunt păstrate pentru reluare. Erorile temporare de rețea/5xx au retry limitat; 413 nu se retrimite repetitiv.

O singură recuperare de originale poate rula simultan. Pentru continuare după pasul deja activ:

```bash
.venv/bin/python scripts/run_manual_recovery.py --operational-root /cale/absoluta/profos
```

Acesta așteaptă lock-ul pasului activ și execută încă un pas finit, cu versiunea curentă a regulilor de retry. Nu este automatizare periodică. Procesele folosesc copia operațională; checkout-urile temporare de review/publicare pot fi eliminate după push fără oprirea importului.

## Rapoarte și documente rămase

În `data/rag/original-recovery/`, ignorat de Git:

- `progress.txt`: JSON cu starea transferului, dimensiuni și rezultat pe UID; nu conține secrete sau textul manualelor.
- `remaining.csv`: lista originalelor neîncărcate, cu disciplină/clasă, sursă, dimensiune sau motiv; generată la terminarea pasului curent al scriptului nou. Dacă pasul este oprit, include și `not_attempted`.
- `controller.json`: PID/starea continuării, fără credentiale.
- `run.log` și `controller.log`: rezultate și coduri de eroare, fără text/credențiale.

Raportul progresului este și un checkpoint privat Supabase, family `checkpoints`, UID `manual-original-recovery`, kind `text`, după terminarea pasului. Lista prea mare/404/NOT_PDF/timeout trebuie evaluată separat; o recuperare care a terminat parcurgerea poate avea materiale rămase. Nu înseamnă că toate originale au fost transferate.

## Indexul AI

Cele 1.303 manuale confirmate la începutul P-060 sunt în indexul AI existent. Recuperarea PDF nu le dublează în index. Retry pentru celelalte, respectând limita originalului:

```bash
.venv/bin/python scripts/import_manuals.py --workers 3 --max-pdf-mb 50 --export-report
```

OCR explicit, după terminarea oricărui import activ:

```bash
.venv/bin/python scripts/import_manuals.py --ocr --only-ocr \
  --workers 2 --max-pdf-mb 50 --export-report
```

Pragul rămâne 90% pagini lizibile. Volumele cu pagini predominant ilustrate, fragmente/preview-uri, URL-uri moarte sau prea mari nu sunt declarate ready. Catalogul și raportul pe disciplină/clasă permit alegerea alternativelor deja indexate; titularul a autorizat acum omiterea celor peste 50 MB, cu link oficial și referință verificată înaintea eliminării cache-ului. Celelalte erori se raportează separat.

## Protecții și limite

Storage rămâne privat, cu acces prin aplicație. RLS/ownership rămân active. SSL obligatoriu și deny-all pentru conexiuni directe PostgreSQL/pooler sunt aplicate; REST/Storage/Auth și SQL administrativ funcționează. Pentru un viitor client DB direct trebuie o permisiune de rețea explicită și SSL, nu allow-all.

Backupurile zilnice PostgreSQL Pro au retenție 7 zile și **nu includ fișierele Storage**. Backup și restaurare pentru documentele private trebuie pregătite separat înainte de producție. PITR, CAPTCHA, integrarea MFA în aplicație, malware/quarantină și auditul complet nu sunt considerate rezolvate de trecerea la Pro.

Google are deja App name ProfPlus; aplicația OAuth este Testing, fără branding verificat. Titularul nu are încă domeniu. Afișarea adresei proiectului în Google rămâne de remediat după domeniu, pagini publice și verificare; site-ul privat nu este făcut public pentru acest scop.

Surse oficiale: [limite fișier](https://supabase.com/docs/guides/storage/uploads/file-limits), [capacități Pro](https://supabase.com/docs/guides/platform/billing-on-supabase), [sesiuni](https://supabase.com/docs/guides/auth/sessions), [backupuri](https://supabase.com/docs/guides/platform/backups), [Google branding](https://supabase.com/docs/guides/auth/social-login/auth-google).

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
